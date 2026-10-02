import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { profileContentVisibilities } from "@/lib/profile";
import type { Viewer } from "@/lib/visibility";

export const profileSelect = {
  id: true,
  username: true,
  name: true,
  bio: true,
  avatarUrl: true,
  location: true,
  church: true,
  role: true,
  status: true,
  profileVisibility: true,
  openForPartner: true,
  createdAt: true,
} as const;

/** The member behind a username (any status; the page decides what to show). Memoised per request. */
export const getProfileUser = cache(async (username: string) =>
  prisma.user.findUnique({ where: { username }, select: profileSelect }),
);

export type ProfileUser = NonNullable<Awaited<ReturnType<typeof getProfileUser>>>;

export interface ProfileStats {
  posts: number;
  prayers: number;
  groups: number;
  followers: number;
  following: number;
}

export async function getProfileStats(userId: string, viewer: Viewer | null, isOwner: boolean): Promise<ProfileStats> {
  const visibility = { in: profileContentVisibilities(viewer) };
  const [posts, prayers, groups, followers, following] = await Promise.all([
    prisma.post.count({ where: { authorId: userId, deletedAt: null, visibility } }),
    prisma.prayerRequest.count({ where: { authorId: userId, deletedAt: null, isAnonymous: false, visibility } }),
    prisma.groupMember.count({ where: { userId, status: "ACTIVE", ...(isOwner ? {} : { group: { visibility } }) } }),
    prisma.follow.count({ where: { followingId: userId } }),
    prisma.follow.count({ where: { followerId: userId } }),
  ]);
  return { posts, prayers, groups, followers, following };
}

const postPreviewSelect = { id: true, kind: true, title: true, body: true, createdAt: true } as const;

export type PostPreview = { [K in keyof typeof postPreviewSelect]: K extends "createdAt" ? Date : K extends "title" ? string | null : K extends "kind" ? "POST" | "TESTIMONY" | "QUESTION" | "IMPULSE" : string };

/** Latest posts and testimonies the viewer may see (PUBLIC, plus MEMBERS for signed-in viewers). */
export async function getProfilePosts(userId: string, viewer: Viewer | null, limit = 8) {
  const where = { authorId: userId, deletedAt: null, visibility: { in: profileContentVisibilities(viewer) } };
  const orderBy = { createdAt: "desc" as const };
  const [posts, testimonies] = await Promise.all([
    prisma.post.findMany({ where: { ...where, kind: { not: "TESTIMONY" } }, orderBy, take: limit, select: postPreviewSelect }),
    prisma.post.findMany({ where: { ...where, kind: "TESTIMONY" }, orderBy, take: limit, select: postPreviewSelect }),
  ]);
  return { posts, testimonies };
}

export async function isFollowing(viewerId: string, userId: string): Promise<boolean> {
  const row = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: viewerId, followingId: userId } },
    select: { followerId: true },
  });
  return row !== null;
}
