import "server-only";
import { cache } from "react";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import type { Page } from "@/lib/pagination";
import { canView, visibilityWhere, type Viewer } from "@/lib/visibility";
import type { PrayerCategory, PrayerFilter } from "@/lib/validation/prayer";
import { todayKey } from "./format";

export { todayKey };

/** Narrow author DTO for cards and detail pages (never the whole user row). */
export const authorSelect = { id: true, name: true, username: true, avatarUrl: true } as const;
export type Author = { id: string; name: string; username: string; avatarUrl: string | null };

/** Ids of the groups the user is an active member of (memoised per request). */
export const getMemberGroupIds = cache(async (userId: string): Promise<string[]> => {
  const rows = await prisma.groupMember.findMany({
    where: { userId, status: "ACTIVE" },
    select: { groupId: true },
  });
  return rows.map((r) => r.groupId);
});

export async function isActiveGroupMember(userId: string, groupId: string): Promise<boolean> {
  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
    select: { status: true },
  });
  return member?.status === "ACTIVE";
}

/** Groups the user may post into (any role, active membership). */
export async function listUserGroups(userId: string): Promise<{ id: string; name: string }[]> {
  const rows = await prisma.groupMember.findMany({
    where: { userId, status: "ACTIVE" },
    select: { group: { select: { id: true, name: true } } },
    orderBy: { group: { name: "asc" } },
  });
  return rows.map((r) => r.group);
}

const listSelect = {
  id: true,
  title: true,
  body: true,
  category: true,
  isAnonymous: true,
  visibility: true,
  status: true,
  groupId: true,
  authorId: true,
  answeredAt: true,
  createdAt: true,
  author: { select: authorSelect },
  _count: { select: { supports: true, comments: { where: { deletedAt: null } } } },
} satisfies Prisma.PrayerRequestSelect;

type ListRow = Prisma.PrayerRequestGetPayload<{ select: typeof listSelect }>;

export interface SupportStats {
  /** Distinct people who prayed at least once. */
  supporters: number;
  /** People who prayed today (UTC). */
  today: number;
  /** Whether the viewer prayed today. */
  prayedToday: boolean;
}

export type PrayerRequestListItem = ListRow & SupportStats;

/** Collects distinct/today/viewer support counts for a set of requests in three queries. */
async function supportStats(requestIds: string[], viewerId: string | null): Promise<Map<string, SupportStats>> {
  const stats = new Map<string, SupportStats>();
  for (const id of requestIds) stats.set(id, { supporters: 0, today: 0, prayedToday: false });
  if (requestIds.length === 0) return stats;
  const day = todayKey();

  const [distinct, today, mine] = await Promise.all([
    prisma.prayerSupport.groupBy({ by: ["requestId", "userId"], where: { requestId: { in: requestIds } } }),
    prisma.prayerSupport.groupBy({
      by: ["requestId"],
      where: { requestId: { in: requestIds }, day },
      _count: { _all: true },
    }),
    viewerId
      ? prisma.prayerSupport.findMany({
          where: { requestId: { in: requestIds }, userId: viewerId, day },
          select: { requestId: true },
        })
      : Promise.resolve([]),
  ]);

  for (const row of distinct) {
    const s = stats.get(row.requestId);
    if (s) s.supporters += 1;
  }
  for (const row of today) {
    const s = stats.get(row.requestId);
    if (s) s.today = row._count._all;
  }
  for (const row of mine) {
    const s = stats.get(row.requestId);
    if (s) s.prayedToday = true;
  }
  return stats;
}

export interface ListPrayerRequestsArgs {
  viewer: Viewer | null;
  filter: PrayerFilter;
  category?: PrayerCategory;
  page: Page;
}

export async function listPrayerRequests({
  viewer,
  filter,
  category,
  page,
}: ListPrayerRequestsArgs): Promise<{ items: PrayerRequestListItem[]; total: number }> {
  const memberGroupIds = viewer ? await getMemberGroupIds(viewer.id) : [];
  const where: Prisma.PrayerRequestWhereInput = {
    deletedAt: null,
    ...visibilityWhere(viewer, memberGroupIds),
    ...(category ? { category } : {}),
  };

  switch (filter) {
    case "offen":
      where.status = "OPEN";
      break;
    case "erhoert":
      where.status = "ANSWERED";
      break;
    case "meine":
      if (!viewer) return { items: [], total: 0 };
      where.authorId = viewer.id;
      break;
    case "gebetet":
      if (!viewer) return { items: [], total: 0 };
      where.supports = { some: { userId: viewer.id } };
      break;
    case "alle":
    default:
      break;
  }

  const [rows, total] = await Promise.all([
    prisma.prayerRequest.findMany({
      where,
      select: listSelect,
      orderBy: { createdAt: "desc" },
      skip: page.skip,
      take: page.take,
    }),
    prisma.prayerRequest.count({ where }),
  ]);

  const stats = await supportStats(
    rows.map((r) => r.id),
    viewer?.id ?? null,
  );
  const items = rows.map((row) => ({
    ...row,
    ...(stats.get(row.id) ?? { supporters: 0, today: 0, prayedToday: false }),
  }));
  return { items, total };
}

const detailSelect = {
  ...listSelect,
  answerNote: true,
  updatedAt: true,
  group: { select: { id: true, name: true, slug: true } },
} satisfies Prisma.PrayerRequestSelect;

type DetailRow = Prisma.PrayerRequestGetPayload<{ select: typeof detailSelect }>;
export type PrayerRequestDetail = DetailRow & SupportStats;

/** Raw row without visibility check; memoised so page and generateMetadata share one read. */
const findPrayerRequestRow = cache(async (id: string): Promise<DetailRow | null> => {
  if (!id || id.length > 64) return null;
  return prisma.prayerRequest.findFirst({ where: { id, deletedAt: null }, select: detailSelect });
});

/** Whether the viewer may see the request (group membership resolved here). */
export async function canViewPrayerRequest(
  request: { visibility: DetailRow["visibility"]; authorId: string; groupId: string | null },
  viewer: Viewer | null,
): Promise<boolean> {
  const needsMembership =
    request.visibility === "GROUP" && !!viewer && !!request.groupId && viewer.id !== request.authorId;
  const member = needsMembership ? await isActiveGroupMember(viewer.id, request.groupId as string) : false;
  return canView(request, viewer, member);
}

/**
 * The request with support stats, or null when it does not exist, is deleted or
 * the viewer may not see it. Memoised per request so `generateMetadata` and the
 * page share one read (pass the same viewer object, e.g. from `getCurrentUser()`).
 */
export const getPrayerRequest = cache(
  async (id: string, viewer: Viewer | null): Promise<PrayerRequestDetail | null> => {
    const row = await findPrayerRequestRow(id);
    if (!row) return null;
    if (!(await canViewPrayerRequest(row, viewer))) return null;
    const stats = await supportStats([row.id], viewer?.id ?? null);
    return { ...row, ...(stats.get(row.id) ?? { supporters: 0, today: 0, prayedToday: false }) };
  },
);

/** The author's own request (for the edit form); null when it is not theirs or was deleted. */
export async function getOwnPrayerRequest(id: string, userId: string) {
  if (!id || id.length > 64) return null;
  return prisma.prayerRequest.findFirst({
    where: { id, deletedAt: null, authorId: userId },
    select: {
      id: true,
      title: true,
      body: true,
      category: true,
      visibility: true,
      groupId: true,
      isAnonymous: true,
      status: true,
    },
  });
}

export interface SupporterList {
  users: Author[];
  /** Distinct supporters not included in `users`. */
  more: number;
}

/** Up to `limit` distinct supporters (most recent first) for the detail page. */
export async function listSupporters(requestId: string, limit = 12): Promise<SupporterList> {
  const distinct = await prisma.prayerSupport.groupBy({
    by: ["userId"],
    where: { requestId },
    _max: { createdAt: true },
    orderBy: { _max: { createdAt: "desc" } },
  });
  const ids = distinct.slice(0, limit).map((r) => r.userId);
  if (ids.length === 0) return { users: [], more: 0 };
  const rows = await prisma.user.findMany({ where: { id: { in: ids } }, select: authorSelect });
  const byId = new Map(rows.map((u) => [u.id, u]));
  const users = ids.map((id) => byId.get(id)).filter((u): u is Author => u !== undefined);
  return { users, more: Math.max(0, distinct.length - ids.length) };
}

/** Distinct user ids who supported the request (for "answered" notifications). */
export async function listSupporterIds(requestId: string): Promise<string[]> {
  const rows = await prisma.prayerSupport.groupBy({ by: ["userId"], where: { requestId } });
  return rows.map((r) => r.userId);
}
