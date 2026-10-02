import "server-only";
import { cache } from "react";
import type { Prisma } from "@/generated/prisma/client";
import type { UserStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import { markdownToText } from "@/lib/markdown";
import type { Page } from "@/lib/pagination";
import { commentAnchor, targetPath } from "@/lib/comments/target";
import { profilePath } from "@/lib/profile";
import type { ReportTargetType } from "@/lib/validation/report";
import type { ReportStatusValue, UserRoleValue, UserStatusFilter } from "@/lib/validation/admin";

/**
 * Read side of the moderation area. Everything here is only called from
 * pages/actions that already passed `requireRole("MODERATOR")`.
 */

/** Narrow person DTO for reporters, authors and actors. */
export const personSelect = { id: true, name: true, username: true, avatarUrl: true } as const;
export type Person = { id: string; name: string; username: string; avatarUrl: string | null };

const DAY_MS = 86_400_000;
const EXCERPT_LENGTH = 300;

export const POST_KIND_LABELS = {
  POST: "Beitrag",
  TESTIMONY: "Zeugnis",
  QUESTION: "Frage",
  IMPULSE: "Impuls",
} as const;

// ---------------------------------------------------------------------------
// Public paths of content (kept in one place for previews and revalidation)
// ---------------------------------------------------------------------------

export function postPath(id: string) {
  return `/gemeinschaft/beitrag/${id}`;
}
export function prayerPath(id: string) {
  return `/gebet/${id}`;
}
export function groupPath(slug: string) {
  return `/gruppen/${slug}`;
}
export function eventPath(id: string) {
  return `/veranstaltungen/${id}`;
}
export function commentPath(comment: {
  id: string;
  postId: string | null;
  prayerRequestId: string | null;
}): string | null {
  const base = comment.postId
    ? targetPath({ postId: comment.postId })
    : comment.prayerRequestId
      ? targetPath({ prayerRequestId: comment.prayerRequestId })
      : null;
  return base ? `${base}#${commentAnchor(comment.id)}` : null;
}

/** List path in the public site that shows content of this kind (for revalidation). */
export function listPathFor(kind: ReportTargetType): string | null {
  switch (kind) {
    case "post":
    case "comment":
      return "/gemeinschaft";
    case "prayer":
      return "/gebet";
    case "group":
      return "/gruppen";
    case "event":
      return "/veranstaltungen";
    default:
      return null;
  }
}

/** Where an audit entry's target can be opened; null when the entry carries its own `href` or has none. */
export function auditTargetHref(targetType: string | null, targetId: string | null): string | null {
  if (!targetType || !targetId) return null;
  switch (targetType) {
    case "report":
      return `/admin/meldungen/${targetId}`;
    case "user":
      return `/admin/mitglieder/${targetId}`;
    case "post":
      return postPath(targetId);
    case "prayer":
      return prayerPath(targetId);
    case "event":
      return eventPath(targetId);
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export interface DashboardStats {
  members: { total: number; active: number; suspended: number; newLast7Days: number };
  posts: number;
  prayers: number;
  groups: number;
  events: number;
  openReports: number;
  resolvedLast30Days: number;
}

export async function dashboardStats(): Promise<DashboardStats> {
  const now = Date.now();
  const since7 = new Date(now - 7 * DAY_MS);
  const since30 = new Date(now - 30 * DAY_MS);
  const [total, active, suspended, newLast7Days, posts, prayers, groups, events, openReports, resolvedLast30Days] =
    await Promise.all([
      prisma.user.count({ where: { status: { not: "DELETED" } } }),
      prisma.user.count({ where: { status: "ACTIVE" } }),
      prisma.user.count({ where: { status: "SUSPENDED" } }),
      prisma.user.count({ where: { status: { not: "DELETED" }, createdAt: { gte: since7 } } }),
      prisma.post.count({ where: { deletedAt: null } }),
      prisma.prayerRequest.count({ where: { deletedAt: null } }),
      prisma.group.count(),
      prisma.event.count({ where: { deletedAt: null } }),
      prisma.report.count({ where: { status: "OPEN" } }),
      prisma.report.count({ where: { status: { in: ["RESOLVED", "DISMISSED"] }, resolvedAt: { gte: since30 } } }),
    ]);
  return {
    members: { total, active, suspended, newLast7Days },
    posts,
    prayers,
    groups,
    events,
    openReports,
    resolvedLast30Days,
  };
}

export const countOpenReports = cache(async (): Promise<number> => prisma.report.count({ where: { status: "OPEN" } }));

/** Number of reports per status (for the filter tabs). */
export async function countReportsByStatus(): Promise<Record<ReportStatusValue, number>> {
  const rows = await prisma.report.groupBy({ by: ["status"], _count: { _all: true } });
  const counts: Record<ReportStatusValue, number> = { OPEN: 0, RESOLVED: 0, DISMISSED: 0 };
  for (const row of rows) counts[row.status] = row._count._all;
  return counts;
}

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------

const reportSelect = {
  id: true,
  targetType: true,
  targetId: true,
  reason: true,
  details: true,
  status: true,
  resolution: true,
  createdAt: true,
  resolvedAt: true,
  reporter: { select: personSelect },
  resolvedBy: { select: personSelect },
} satisfies Prisma.ReportSelect;

export type ReportRow = Prisma.ReportGetPayload<{ select: typeof reportSelect }>;

export async function listReports({
  status,
  page,
}: {
  status: ReportStatusValue;
  page: Page;
}): Promise<{ items: ReportRow[]; total: number }> {
  const where: Prisma.ReportWhereInput = { status };
  const [items, total] = await Promise.all([
    prisma.report.findMany({
      where,
      select: reportSelect,
      orderBy: status === "OPEN" ? { createdAt: "asc" } : { resolvedAt: "desc" },
      skip: page.skip,
      take: page.take,
    }),
    prisma.report.count({ where }),
  ]);
  return { items, total };
}

export const getReport = cache(async (id: string): Promise<ReportRow | null> => {
  if (!id || id.length > 64) return null;
  return prisma.report.findUnique({ where: { id }, select: reportSelect });
});

/** Other reports about the same content (newest first), e.g. to spot repeated complaints. */
export async function listReportsForTarget(
  targetType: string,
  targetId: string,
  excludeId?: string,
  limit = 10,
): Promise<ReportRow[]> {
  return prisma.report.findMany({
    where: { targetType, targetId, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
    select: reportSelect,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

// ---------------------------------------------------------------------------
// Target previews
// ---------------------------------------------------------------------------

/** Normalised preview of whatever a report points at. */
export interface ReportTarget {
  kind: ReportTargetType;
  title: string;
  excerpt: string;
  authorId: string | null;
  authorName: string | null;
  authorUsername: string | null;
  authorStatus: UserStatus | null;
  /** Public page of the content; null for private messages. */
  href: string | null;
  /** Soft-deleted (or, for groups, hidden) by the author or the moderation. */
  deleted: boolean;
  /** Short state note, e.g. "Anonym gestellt" or "Gesperrt". */
  note?: string;
  createdAt: Date | null;
}

type TargetRef = { targetType: string; targetId: string };

function targetKey(ref: TargetRef) {
  return `${ref.targetType}:${ref.targetId}`;
}

const authorSelect = { id: true, name: true, username: true, status: true } as const;
type AuthorRow = { id: string; name: string; username: string; status: UserStatus };

function author(a: AuthorRow | null | undefined) {
  return {
    authorId: a?.id ?? null,
    authorName: a?.name ?? null,
    authorUsername: a?.username ?? null,
    authorStatus: a?.status ?? null,
  };
}

async function loadPosts(ids: string[]) {
  const rows = await prisma.post.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      kind: true,
      title: true,
      body: true,
      deletedAt: true,
      createdAt: true,
      author: { select: authorSelect },
    },
  });
  return rows.map((p) => ({
    kind: "post" as const,
    title: p.title?.trim() || POST_KIND_LABELS[p.kind],
    excerpt: markdownToText(p.body, EXCERPT_LENGTH),
    ...author(p.author),
    href: postPath(p.id),
    deleted: p.deletedAt !== null,
    createdAt: p.createdAt,
    _id: p.id,
  }));
}

async function loadComments(ids: string[]) {
  const rows = await prisma.comment.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      body: true,
      deletedAt: true,
      createdAt: true,
      postId: true,
      prayerRequestId: true,
      author: { select: authorSelect },
    },
  });
  return rows.map((c) => ({
    kind: "comment" as const,
    title: c.postId ? "Kommentar zu einem Beitrag" : "Kommentar zu einem Gebetsanliegen",
    excerpt: markdownToText(c.body, EXCERPT_LENGTH),
    ...author(c.author),
    href: commentPath(c),
    deleted: c.deletedAt !== null,
    createdAt: c.createdAt,
    _id: c.id,
  }));
}

async function loadPrayers(ids: string[]) {
  const rows = await prisma.prayerRequest.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      title: true,
      body: true,
      isAnonymous: true,
      deletedAt: true,
      createdAt: true,
      author: { select: authorSelect },
    },
  });
  return rows.map((p) => ({
    kind: "prayer" as const,
    title: p.title,
    excerpt: markdownToText(p.body, EXCERPT_LENGTH),
    ...author(p.author),
    href: prayerPath(p.id),
    deleted: p.deletedAt !== null,
    note: p.isAnonymous ? "Anonym gestellt – nur die Moderation sieht den Namen." : undefined,
    createdAt: p.createdAt,
    _id: p.id,
  }));
}

async function loadUsers(ids: string[]) {
  const rows = await prisma.user.findMany({
    where: { id: { in: ids } },
    select: { ...authorSelect, bio: true, createdAt: true },
  });
  return rows.map((u) => ({
    kind: "user" as const,
    title: `${u.name} (@${u.username})`,
    excerpt: u.bio ? markdownToText(u.bio, EXCERPT_LENGTH) : "",
    ...author(u),
    href: profilePath(u.username),
    deleted: u.status === "DELETED",
    note: u.status === "SUSPENDED" ? "Gesperrt" : u.status === "DELETED" ? "Konto gelöscht" : undefined,
    createdAt: u.createdAt,
    _id: u.id,
  }));
}

async function loadGroups(ids: string[]) {
  const rows = await prisma.group.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      visibility: true,
      createdAt: true,
      createdBy: { select: authorSelect },
    },
  });
  return rows.map((g) => ({
    kind: "group" as const,
    title: g.name,
    excerpt: markdownToText(g.description, EXCERPT_LENGTH),
    ...author(g.createdBy),
    href: groupPath(g.slug),
    deleted: g.visibility === "PRIVATE",
    note: g.visibility === "PRIVATE" ? "Verborgen (nur für die Gründerin/den Gründer sichtbar)" : undefined,
    createdAt: g.createdAt,
    _id: g.id,
  }));
}

async function loadEvents(ids: string[]) {
  const rows = await prisma.event.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      title: true,
      description: true,
      deletedAt: true,
      createdAt: true,
      host: { select: authorSelect },
    },
  });
  return rows.map((e) => ({
    kind: "event" as const,
    title: e.title,
    excerpt: markdownToText(e.description, EXCERPT_LENGTH),
    ...author(e.host),
    href: eventPath(e.id),
    deleted: e.deletedAt !== null,
    createdAt: e.createdAt,
    _id: e.id,
  }));
}

async function loadMessages(ids: string[]) {
  const rows = await prisma.message.findMany({
    where: { id: { in: ids } },
    select: { id: true, body: true, createdAt: true, sender: { select: authorSelect } },
  });
  return rows.map((m) => ({
    kind: "message" as const,
    title: "Private Nachricht",
    excerpt: markdownToText(m.body, EXCERPT_LENGTH),
    ...author(m.sender),
    href: null,
    deleted: false,
    createdAt: m.createdAt,
    _id: m.id,
  }));
}

const loaders: Record<ReportTargetType, (ids: string[]) => Promise<(ReportTarget & { _id: string })[]>> = {
  post: loadPosts,
  comment: loadComments,
  prayer: loadPrayers,
  user: loadUsers,
  group: loadGroups,
  event: loadEvents,
  message: loadMessages,
};

function isTargetType(value: string): value is ReportTargetType {
  return value in loaders;
}

/**
 * Loads previews for many reports with one query per content type.
 * Missing rows (hard-deleted or unknown ids) are absent from the map.
 */
export async function loadReportTargets(refs: TargetRef[]): Promise<Map<string, ReportTarget>> {
  const byType = new Map<ReportTargetType, Set<string>>();
  for (const ref of refs) {
    if (!isTargetType(ref.targetType) || !ref.targetId) continue;
    const set = byType.get(ref.targetType) ?? new Set<string>();
    set.add(ref.targetId);
    byType.set(ref.targetType, set);
  }
  const result = new Map<string, ReportTarget>();
  await Promise.all(
    [...byType.entries()].map(async ([type, ids]) => {
      const rows = await loaders[type]([...ids]);
      for (const { _id, ...target } of rows) result.set(targetKey({ targetType: type, targetId: _id }), target);
    }),
  );
  return result;
}

/** Preview of a single target, or null when it no longer exists. */
export async function loadReportTarget(targetType: string, targetId: string): Promise<ReportTarget | null> {
  const map = await loadReportTargets([{ targetType, targetId }]);
  return map.get(targetKey({ targetType, targetId })) ?? null;
}

export function reportTargetKey(report: TargetRef): string {
  return targetKey(report);
}

// ---------------------------------------------------------------------------
// Members
// ---------------------------------------------------------------------------

const userRowSelect = {
  id: true,
  name: true,
  username: true,
  email: true,
  emailVerifiedAt: true,
  avatarUrl: true,
  role: true,
  status: true,
  createdAt: true,
  lastSeenAt: true,
} satisfies Prisma.UserSelect;

export type UserRow = Prisma.UserGetPayload<{ select: typeof userRowSelect }>;

export interface ListUsersArgs {
  q: string;
  role?: UserRoleValue;
  status?: UserStatusFilter;
  page: Page;
}

export async function listUsers({
  q,
  role,
  status,
  page,
}: ListUsersArgs): Promise<{ items: UserRow[]; total: number }> {
  const where: Prisma.UserWhereInput = {
    ...(role ? { role } : {}),
    ...(status ? { status } : {}),
    ...(q ? { OR: [{ name: { contains: q } }, { username: { contains: q } }, { email: { contains: q } }] } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: userRowSelect,
      orderBy: { createdAt: "desc" },
      skip: page.skip,
      take: page.take,
    }),
    prisma.user.count({ where }),
  ]);
  return { items, total };
}

const userDetailSelect = {
  ...userRowSelect,
  bio: true,
  location: true,
  church: true,
  profileVisibility: true,
  updatedAt: true,
  _count: {
    select: {
      posts: { where: { deletedAt: null } },
      comments: { where: { deletedAt: null } },
      prayerRequests: { where: { deletedAt: null } },
      reportsMade: true,
      createdGroups: true,
      hostedEvents: { where: { deletedAt: null } },
    },
  },
} satisfies Prisma.UserSelect;

type UserDetailRow = Prisma.UserGetPayload<{ select: typeof userDetailSelect }>;

export interface UserDetail extends UserDetailRow {
  activeSessions: number;
  reportsAgainst: number;
}

export const getUserDetail = cache(async (id: string): Promise<UserDetail | null> => {
  if (!id || id.length > 64) return null;
  const user = await prisma.user.findUnique({ where: { id }, select: userDetailSelect });
  if (!user) return null;
  const [activeSessions, reportsAgainst] = await Promise.all([
    prisma.session.count({ where: { userId: id, expiresAt: { gt: new Date() } } }),
    countReportsAgainstUser(id),
  ]);
  return { ...user, activeSessions, reportsAgainst };
});

/** Whole-row ids are capped so the `IN (...)` lists stay well below SQLite's variable limit. */
const CONTENT_ID_CAP = 400;

/** Reports that point at the member's profile or at content the member authored. */
async function reportsAgainstUserWhere(userId: string): Promise<Prisma.ReportWhereInput> {
  const ids = { select: { id: true }, take: CONTENT_ID_CAP, orderBy: { createdAt: "desc" as const } };
  const [posts, comments, prayers, events, groups, messages] = await Promise.all([
    prisma.post.findMany({ where: { authorId: userId }, ...ids }),
    prisma.comment.findMany({ where: { authorId: userId }, ...ids }),
    prisma.prayerRequest.findMany({ where: { authorId: userId }, ...ids }),
    prisma.event.findMany({ where: { hostId: userId }, ...ids }),
    prisma.group.findMany({ where: { createdById: userId }, ...ids }),
    prisma.message.findMany({ where: { senderId: userId }, ...ids }),
  ]);
  const or: Prisma.ReportWhereInput[] = [{ targetType: "user", targetId: userId }];
  const add = (targetType: ReportTargetType, rows: { id: string }[]) => {
    if (rows.length > 0) or.push({ targetType, targetId: { in: rows.map((r) => r.id) } });
  };
  add("post", posts);
  add("comment", comments);
  add("prayer", prayers);
  add("event", events);
  add("group", groups);
  add("message", messages);
  return { OR: or };
}

export async function countReportsAgainstUser(userId: string): Promise<number> {
  return prisma.report.count({ where: await reportsAgainstUserWhere(userId) });
}

export async function listReportsAgainstUser(userId: string, limit = 10): Promise<ReportRow[]> {
  return prisma.report.findMany({
    where: await reportsAgainstUserWhere(userId),
    select: reportSelect,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export interface ContentItem {
  id: string;
  title: string;
  excerpt: string;
  href: string | null;
  createdAt: Date;
  deleted: boolean;
}

export interface UserContent {
  posts: ContentItem[];
  comments: ContentItem[];
  prayers: ContentItem[];
}

/** The member's latest posts, comments and prayer requests (including removed ones, marked). */
export async function listUserContent(userId: string, limit = 5): Promise<UserContent> {
  const [posts, comments, prayers] = await Promise.all([
    prisma.post.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: { id: true, kind: true, title: true, body: true, createdAt: true, deletedAt: true },
    }),
    prisma.comment.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: { id: true, body: true, createdAt: true, deletedAt: true, postId: true, prayerRequestId: true },
    }),
    prisma.prayerRequest.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: { id: true, title: true, body: true, createdAt: true, deletedAt: true },
    }),
  ]);
  return {
    posts: posts.map((p) => ({
      id: p.id,
      title: p.title?.trim() || POST_KIND_LABELS[p.kind],
      excerpt: markdownToText(p.body, 140),
      href: postPath(p.id),
      createdAt: p.createdAt,
      deleted: p.deletedAt !== null,
    })),
    comments: comments.map((c) => ({
      id: c.id,
      title: c.postId ? "Kommentar zu einem Beitrag" : "Kommentar zu einem Gebetsanliegen",
      excerpt: markdownToText(c.body, 140),
      href: commentPath(c),
      createdAt: c.createdAt,
      deleted: c.deletedAt !== null,
    })),
    prayers: prayers.map((p) => ({
      id: p.id,
      title: p.title,
      excerpt: markdownToText(p.body, 140),
      href: prayerPath(p.id),
      createdAt: p.createdAt,
      deleted: p.deletedAt !== null,
    })),
  };
}

// ---------------------------------------------------------------------------
// Audit log
// ---------------------------------------------------------------------------

export interface AuditRow {
  id: string;
  actorId: string | null;
  actor: Person | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  details: string | null;
  createdAt: Date;
}

export async function listAudit({
  page,
  actorId,
}: {
  page: Page;
  actorId?: string;
}): Promise<{ items: AuditRow[]; total: number }> {
  const where: Prisma.AuditLogWhereInput = actorId ? { actorId } : {};
  const [rows, total] = await Promise.all([
    prisma.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, skip: page.skip, take: page.take }),
    prisma.auditLog.count({ where }),
  ]);
  const actorIds = [...new Set(rows.map((r) => r.actorId).filter((id): id is string => id !== null))];
  const actors =
    actorIds.length > 0 ? await prisma.user.findMany({ where: { id: { in: actorIds } }, select: personSelect }) : [];
  const byId = new Map(actors.map((a) => [a.id, a]));
  return {
    items: rows.map((r) => ({ ...r, actor: r.actorId ? (byId.get(r.actorId) ?? null) : null })),
    total,
  };
}
