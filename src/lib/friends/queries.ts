import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db";

export const friendUserSelect = { id: true, name: true, username: true, avatarUrl: true, location: true } as const;
export type FriendUser = { id: string; name: string; username: string; avatarUrl: string | null; location: string | null };

export type FriendState =
  | { kind: "none" }
  | { kind: "friends"; friendshipId: string }
  | { kind: "sent"; friendshipId: string }
  | { kind: "received"; friendshipId: string };

/** Relationship between two users from the viewer's perspective. */
export const getFriendState = cache(async (viewerId: string, otherId: string): Promise<FriendState> => {
  if (viewerId === otherId) return { kind: "none" };
  const rows = await prisma.friendship.findMany({
    where: {
      OR: [
        { requesterId: viewerId, addresseeId: otherId },
        { requesterId: otherId, addresseeId: viewerId },
      ],
    },
    select: { id: true, requesterId: true, status: true },
  });
  const accepted = rows.find((r) => r.status === "ACCEPTED");
  if (accepted) return { kind: "friends", friendshipId: accepted.id };
  const pending = rows.find((r) => r.status === "PENDING");
  if (pending) return pending.requesterId === viewerId ? { kind: "sent", friendshipId: pending.id } : { kind: "received", friendshipId: pending.id };
  return { kind: "none" };
});

export const friendIds = cache(async (userId: string): Promise<string[]> => {
  const rows = await prisma.friendship.findMany({
    where: { status: "ACCEPTED", OR: [{ requesterId: userId }, { addresseeId: userId }] },
    select: { requesterId: true, addresseeId: true },
  });
  return rows.map((r) => (r.requesterId === userId ? r.addresseeId : r.requesterId));
});

export async function areFriends(a: string, b: string): Promise<boolean> {
  const state = await getFriendState(a, b);
  return state.kind === "friends";
}

export async function listFriends(userId: string): Promise<FriendUser[]> {
  const rows = await prisma.friendship.findMany({
    where: { status: "ACCEPTED", OR: [{ requesterId: userId }, { addresseeId: userId }] },
    select: { requester: { select: friendUserSelect }, addressee: { select: friendUserSelect } },
    orderBy: { respondedAt: "desc" },
  });
  return rows.map((r) => (r.requester.id === userId ? r.addressee : r.requester)).filter((u) => u !== null);
}

export async function listIncomingRequests(userId: string) {
  return prisma.friendship.findMany({
    where: { addresseeId: userId, status: "PENDING" },
    select: { id: true, createdAt: true, requester: { select: friendUserSelect } },
    orderBy: { createdAt: "desc" },
  });
}

export async function listOutgoingRequests(userId: string) {
  return prisma.friendship.findMany({
    where: { requesterId: userId, status: "PENDING" },
    select: { id: true, createdAt: true, addressee: { select: friendUserSelect } },
    orderBy: { createdAt: "desc" },
  });
}

export async function countIncomingRequests(userId: string) {
  return prisma.friendship.count({ where: { addresseeId: userId, status: "PENDING" } });
}

/** Member search for the friends page (name or username, active accounts, excluding the viewer). */
export async function searchMembers(viewerId: string, q: string, limit = 20): Promise<FriendUser[]> {
  const term = q.trim();
  if (term.length < 2) return [];
  return prisma.user.findMany({
    where: {
      status: "ACTIVE",
      id: { not: viewerId },
      OR: [{ name: { contains: term, mode: "insensitive" } }, { username: { contains: term.replace(/^@/, ""), mode: "insensitive" } }],
    },
    select: friendUserSelect,
    orderBy: { name: "asc" },
    take: limit,
  });
}
