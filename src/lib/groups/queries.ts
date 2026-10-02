import "server-only";
import { cache } from "react";
import type { Prisma } from "@/generated/prisma/client";
import type { GroupKind, GroupRole, MembershipStatus, Visibility } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import type { Page } from "@/lib/pagination";
import { visibilityWhere, type Viewer } from "@/lib/visibility";
import { canManageGroup, compareMembers, isOwner } from "./roles";

/** Narrow user DTO for member rows and author lines (never the whole user row). */
export const memberUserSelect = { id: true, name: true, username: true, avatarUrl: true } as const;
export type MemberUser = { id: string; name: string; username: string; avatarUrl: string | null };

export interface Membership {
  role: GroupRole;
  status: MembershipStatus;
  joinedAt: Date;
}

/** Ids of the groups the user is an active member of (memoised per request). */
export const getMemberGroupIds = cache(async (userId: string): Promise<string[]> => {
  const rows = await prisma.groupMember.findMany({ where: { userId, status: "ACTIVE" }, select: { groupId: true } });
  return rows.map((r) => r.groupId);
});

export async function isActiveMember(groupId: string, userId: string): Promise<boolean> {
  const m = await prisma.groupMember.findUnique({ where: { groupId_userId: { groupId, userId } }, select: { status: true } });
  return m?.status === "ACTIVE";
}

export async function getMembership(groupId: string, userId: string): Promise<Membership | null> {
  return prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
    select: { role: true, status: true, joinedAt: true },
  });
}

export interface UserGroup {
  id: string;
  slug: string;
  name: string;
  visibility: Visibility;
  role: GroupRole;
}

/** Groups the user may post into (active membership, any role). Exported for selects in other features. */
export const getUserGroups = cache(async (userId: string): Promise<UserGroup[]> => {
  const rows = await prisma.groupMember.findMany({
    where: { userId, status: "ACTIVE" },
    select: { role: true, group: { select: { id: true, slug: true, name: true, visibility: true } } },
    orderBy: { group: { name: "asc" } },
  });
  return rows.map((r) => ({ ...r.group, role: r.role }));
});

const listSelect = {
  id: true,
  slug: true,
  name: true,
  description: true,
  kind: true,
  city: true,
  visibility: true,
  imageUrl: true,
  createdAt: true,
  _count: { select: { members: { where: { status: "ACTIVE" } } } },
} satisfies Prisma.GroupSelect;

export type GroupListItem = Prisma.GroupGetPayload<{ select: typeof listSelect }>;

export interface ListGroupsArgs {
  viewer: Viewer | null;
  kind?: GroupKind;
  city?: string;
  q?: string;
  page: Page;
}

/** Public groups plus the private ones the viewer belongs to, newest first. */
export async function listGroups({ viewer, kind, city, q, page }: ListGroupsArgs): Promise<{ items: GroupListItem[]; total: number }> {
  const where: Prisma.GroupWhereInput = {
    OR: [
      { visibility: "PUBLIC" },
      ...(viewer ? [{ visibility: "PRIVATE" as const, members: { some: { userId: viewer.id, status: "ACTIVE" as const } } }] : []),
    ],
  };
  if (kind) where.kind = kind;
  if (city) where.city = { contains: city };
  if (q) where.AND = [{ OR: [{ name: { contains: q } }, { description: { contains: q } }] }];

  const [items, total] = await Promise.all([
    prisma.group.findMany({ where, select: listSelect, orderBy: { createdAt: "desc" }, skip: page.skip, take: page.take }),
    prisma.group.count({ where }),
  ]);
  return { items, total };
}

const detailSelect = {
  ...listSelect,
  createdById: true,
  updatedAt: true,
} satisfies Prisma.GroupSelect;

export type GroupRow = Prisma.GroupGetPayload<{ select: typeof detailSelect }>;

export interface GroupDetail {
  group: GroupRow;
  /** The viewer's membership row, or null for guests and strangers. */
  membership: Membership | null;
  memberCount: number;
  /** Open join requests; only filled for owner/admin. */
  pendingCount: number;
  isActiveMember: boolean;
  /** Owner/admin of this group. */
  canManage: boolean;
  isOwner: boolean;
  /** Whether posts, prayers, events and members may be shown to the viewer. */
  canViewContent: boolean;
}

const findGroupBySlug = cache(async (slug: string): Promise<GroupRow | null> => {
  if (!slug || slug.length > 120) return null;
  return prisma.group.findUnique({ where: { slug }, select: detailSelect });
});

/**
 * Group header data for the detail page. For a private group, strangers only
 * get name, description and counts (`canViewContent` false); the page must not
 * load posts, prayers, events or members in that case.
 */
export const getGroupBySlug = cache(async (slug: string, viewer: Viewer | null): Promise<GroupDetail | null> => {
  const group = await findGroupBySlug(slug);
  if (!group) return null;
  const membership = viewer ? await getMembership(group.id, viewer.id) : null;
  const active = membership?.status === "ACTIVE";
  const manage = canManageGroup(membership);
  const moderator = viewer?.role === "ADMIN" || viewer?.role === "MODERATOR";
  const pendingCount = manage || moderator ? await prisma.groupMember.count({ where: { groupId: group.id, status: "PENDING" } }) : 0;
  return {
    group,
    membership,
    memberCount: group._count.members,
    pendingCount,
    isActiveMember: active,
    canManage: manage,
    isOwner: isOwner(membership),
    canViewContent: group.visibility === "PUBLIC" || active || moderator,
  };
});

export interface MemberRowData extends Membership {
  user: MemberUser;
}

/** Members of a group (ACTIVE by default), leadership first. */
export async function listMembers(groupId: string, status: MembershipStatus = "ACTIVE", limit?: number): Promise<MemberRowData[]> {
  const rows = await prisma.groupMember.findMany({
    where: { groupId, status },
    select: { role: true, status: true, joinedAt: true, user: { select: memberUserSelect } },
    orderBy: { joinedAt: "asc" },
    ...(limit ? { take: limit } : {}),
  });
  return rows.sort(compareMembers);
}

/** User ids of owner and admins (for join-request notifications). */
export async function listLeaderIds(groupId: string): Promise<string[]> {
  const rows = await prisma.groupMember.findMany({
    where: { groupId, status: "ACTIVE", role: { in: ["OWNER", "ADMIN"] } },
    select: { userId: true },
  });
  return rows.map((r) => r.userId);
}

/** Latest open prayer requests of a group the viewer may see (read-only teaser on the group page). */
export async function listGroupPrayers(groupId: string, viewer: Viewer | null, limit = 5) {
  const memberGroupIds = viewer ? await getMemberGroupIds(viewer.id) : [];
  return prisma.prayerRequest.findMany({
    where: { groupId, deletedAt: null, ...visibilityWhere(viewer, memberGroupIds) },
    select: { id: true, title: true, status: true, isAnonymous: true, createdAt: true, author: { select: memberUserSelect } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/** Upcoming events of a group (teaser on the group page). Events have a host, not an author, so visibility is matched directly. */
export async function listGroupEvents(groupId: string, viewer: Viewer | null, isMember: boolean, limit = 5) {
  const moderator = viewer?.role === "ADMIN" || viewer?.role === "MODERATOR";
  const visibility = moderator
    ? undefined
    : !viewer
      ? { in: ["PUBLIC" as const] }
      : isMember
        ? { in: ["PUBLIC" as const, "MEMBERS" as const, "GROUP" as const] }
        : { in: ["PUBLIC" as const, "MEMBERS" as const] };
  return prisma.event.findMany({
    where: { groupId, deletedAt: null, startsAt: { gte: new Date() }, ...(visibility ? { visibility } : {}) },
    select: { id: true, title: true, startsAt: true, isOnline: true, city: true, location: true },
    orderBy: { startsAt: "asc" },
    take: limit,
  });
}
