import "server-only";
import { cache } from "react";
import type { Prisma } from "@/generated/prisma/client";
import type { ReactionKind } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import type { Page } from "@/lib/pagination";
import { canView, visibilityWhere, type Viewer } from "@/lib/visibility";
import { getVerse, getTranslation } from "@/lib/bible/data";
import { formatReference, parseVerseKey, referencePath } from "@/lib/bible/reference";
import { getMemberGroupIds, isActiveMember, memberUserSelect } from "@/lib/groups/queries";
import type { FeedTab } from "@/lib/validation/community";

export { isActiveMember };

const listSelect = {
  id: true,
  kind: true,
  title: true,
  body: true,
  verseRef: true,
  visibility: true,
  pinned: true,
  authorId: true,
  groupId: true,
  createdAt: true,
  updatedAt: true,
  author: { select: memberUserSelect },
  group: { select: { id: true, slug: true, name: true, visibility: true } },
  _count: { select: { comments: { where: { deletedAt: null } } } },
} satisfies Prisma.PostSelect;

type ListRow = Prisma.PostGetPayload<{ select: typeof listSelect }>;

export type ReactionCounts = Record<ReactionKind, number>;

export interface ReactionStats {
  reactions: ReactionCounts;
  /** The viewer's own reaction on this post, if any. */
  viewerReaction: ReactionKind | null;
}

export type PostListItem = ListRow & ReactionStats;

export function emptyReactionCounts(): ReactionCounts {
  return { AMEN: 0, HEART: 0, PRAY: 0 };
}

/** Per-kind reaction counts and the viewer's reaction for a set of posts (two queries). */
export async function reactionStats(postIds: string[], viewerId: string | null): Promise<Map<string, ReactionStats>> {
  const stats = new Map<string, ReactionStats>();
  for (const id of postIds) stats.set(id, { reactions: emptyReactionCounts(), viewerReaction: null });
  if (postIds.length === 0) return stats;

  const [counts, mine] = await Promise.all([
    prisma.reaction.groupBy({ by: ["postId", "kind"], where: { postId: { in: postIds } }, _count: { _all: true } }),
    viewerId
      ? prisma.reaction.findMany({ where: { postId: { in: postIds }, userId: viewerId }, select: { postId: true, kind: true } })
      : Promise.resolve([]),
  ]);
  for (const row of counts) {
    const s = stats.get(row.postId);
    if (s) s.reactions[row.kind] = row._count._all;
  }
  for (const row of mine) {
    const s = stats.get(row.postId);
    if (s) s.viewerReaction = row.kind;
  }
  return stats;
}

function withStats<T extends { id: string }>(rows: T[], stats: Map<string, ReactionStats>): (T & ReactionStats)[] {
  return rows.map((row) => ({ ...row, ...(stats.get(row.id) ?? { reactions: emptyReactionCounts(), viewerReaction: null }) }));
}

export interface ListPostsArgs {
  viewer: Viewer | null;
  tab?: FeedTab;
  /** Restrict to one group (group page). The caller checks that the viewer may see the group's content. */
  groupId?: string;
  page: Page;
}

/**
 * Feed query. Visibility follows `visibilityWhere` (the viewer's active
 * memberships unlock GROUP posts); deleted posts are never returned. Inside a
 * group, pinned posts come first.
 */
export async function listPosts({ viewer, tab = "alle", groupId, page }: ListPostsArgs): Promise<{ items: PostListItem[]; total: number }> {
  const memberGroupIds = viewer ? await getMemberGroupIds(viewer.id) : [];
  const where: Prisma.PostWhereInput = { deletedAt: null, ...visibilityWhere(viewer, memberGroupIds) };
  if (groupId) where.groupId = groupId;

  switch (tab) {
    case "fragen":
      where.kind = "QUESTION";
      break;
    case "zeugnisse":
      where.kind = "TESTIMONY";
      break;
    case "impulse":
      where.kind = "IMPULSE";
      break;
    case "gefolgt":
      if (!viewer) return { items: [], total: 0 };
      where.author = { followers: { some: { followerId: viewer.id } } };
      break;
    case "meine":
      if (!viewer) return { items: [], total: 0 };
      where.authorId = viewer.id;
      break;
    default:
      break;
  }

  const orderBy: Prisma.PostOrderByWithRelationInput[] = groupId
    ? [{ pinned: "desc" }, { createdAt: "desc" }]
    : [{ createdAt: "desc" }];

  const [rows, total] = await Promise.all([
    prisma.post.findMany({ where, select: listSelect, orderBy, skip: page.skip, take: page.take }),
    prisma.post.count({ where }),
  ]);
  const stats = await reactionStats(
    rows.map((r) => r.id),
    viewer?.id ?? null,
  );
  return { items: withStats(rows, stats), total };
}

/** Raw row without visibility check; memoised so page and generateMetadata share one read. */
const findPostRow = cache(async (id: string): Promise<ListRow | null> => {
  if (!id || id.length > 64) return null;
  return prisma.post.findFirst({ where: { id, deletedAt: null }, select: listSelect });
});

/** Whether the viewer may see the post (group membership resolved here). */
export async function canViewPost(
  post: { visibility: ListRow["visibility"]; authorId: string; groupId: string | null },
  viewer: Viewer | null,
): Promise<boolean> {
  const needsMembership = post.visibility === "GROUP" && !!viewer && !!post.groupId && viewer.id !== post.authorId;
  const member = needsMembership ? await isActiveMember(post.groupId as string, viewer.id) : false;
  return canView(post, viewer, member);
}

/**
 * The post with reaction stats, or null when it does not exist, is deleted or
 * the viewer may not see it. Memoised per request (pass the same viewer object
 * from `getCurrentUser()` in page and `generateMetadata`).
 */
export const getPost = cache(async (id: string, viewer: Viewer | null): Promise<PostListItem | null> => {
  const row = await findPostRow(id);
  if (!row) return null;
  if (!(await canViewPost(row, viewer))) return null;
  const stats = await reactionStats([row.id], viewer?.id ?? null);
  return withStats([row], stats)[0];
});

export interface VerseQuote {
  /** "Römer 8,28" */
  reference: string;
  text: string;
  /** Reader path, e.g. /bibel/rom/8?v=28 */
  href: string;
  /** Short translation name, e.g. "LUT 1912" */
  translation: string;
}

/** Formatted reference and verse text for a stored verse key ("45:8:28"); null when the key or text is unknown. */
export const verseQuote = cache(async (verseKey: string, translationId: string): Promise<VerseQuote | null> => {
  const parsed = parseVerseKey(verseKey);
  if (!parsed) return null;
  const [verse, translation] = await Promise.all([
    getVerse(translationId, parsed.book.number, parsed.chapter, parsed.verse),
    getTranslation(translationId),
  ]);
  if (!verse || !verse.text) return null;
  const ref = { book: parsed.book, chapter: parsed.chapter, verseStart: parsed.verse };
  return {
    reference: formatReference(ref, translation?.language === "en" ? "en" : "de"),
    text: verse.text,
    href: referencePath(ref, translationId),
    translation: translation?.shortName ?? translationId,
  };
});
