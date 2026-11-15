import "server-only";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { notify } from "@/lib/notifications";
import { generateInviteCode, invitePath, parseInviteCode } from "./invite-code";
import { friendIds, friendUserSelect, getFriendState, type FriendUser } from "./queries";

/**
 * Personal invite links ("bleibe.online/einladung/<code>"). Whoever opens the
 * link and confirms becomes a friend of the inviter straight away – no extra
 * request, because sharing the link already is the invitation.
 */

export function inviteUrl(code: string): string {
  return `${env().APP_URL}${invitePath(code)}`;
}

async function storeNewCode(userId: string): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateInviteCode();
    try {
      await prisma.user.update({ where: { id: userId }, data: { inviteCode: code } });
      return code;
    } catch (err) {
      if ((err as { code?: string })?.code !== "P2002") throw err;
    }
  }
  throw new Error("Es konnte kein Einladungscode erzeugt werden.");
}

/** The member's invite code, created on first use. */
export async function getOrCreateInviteCode(userId: string): Promise<string> {
  const row = await prisma.user.findUnique({ where: { id: userId }, select: { inviteCode: true } });
  return row?.inviteCode ?? storeNewCode(userId);
}

/** Replaces the code; the old link stops working. */
export async function regenerateInviteCode(userId: string): Promise<string> {
  return storeNewCode(userId);
}

/** The active member behind a code, or null for unknown/invalid codes. */
export async function findInviter(rawCode: unknown): Promise<FriendUser | null> {
  const code = parseInviteCode(rawCode);
  if (!code) return null;
  const user = await prisma.user.findUnique({ where: { inviteCode: code }, select: { ...friendUserSelect, status: true } });
  if (!user || user.status !== "ACTIVE") return null;
  return { id: user.id, name: user.name, username: user.username, avatarUrl: user.avatarUrl, location: user.location };
}

export type InviteResult = "friends" | "already" | "self";

/** Makes inviter and invitee friends (accepting an open request in either direction). */
export async function befriendViaInvite(
  inviter: { id: string },
  invitee: { id: string; name: string; username: string },
): Promise<InviteResult> {
  if (inviter.id === invitee.id) return "self";
  const state = await getFriendState(invitee.id, inviter.id);
  if (state.kind === "friends") return "already";

  const now = new Date();
  if (state.kind === "sent" || state.kind === "received") {
    await prisma.friendship.update({ where: { id: state.friendshipId }, data: { status: "ACCEPTED", respondedAt: now } });
  } else {
    // A declined request may still exist in one direction; reuse that row.
    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: inviter.id, addresseeId: invitee.id },
          { requesterId: invitee.id, addresseeId: inviter.id },
        ],
      },
      select: { id: true },
    });
    if (existing) {
      await prisma.friendship.update({ where: { id: existing.id }, data: { status: "ACCEPTED", respondedAt: now } });
    } else {
      try {
        await prisma.friendship.create({
          data: { requesterId: inviter.id, addresseeId: invitee.id, status: "ACCEPTED", respondedAt: now },
        });
      } catch (err) {
        // Two tabs at once: the friendship exists now, which is what we wanted.
        if ((err as { code?: string })?.code !== "P2002") throw err;
      }
    }
  }

  await notify({
    userId: inviter.id,
    actorId: invitee.id,
    type: "friend_accepted",
    title: `${invitee.name} hat deine Einladung angenommen`,
    body: "Ihr seid jetzt Freunde.",
    href: `/@${invitee.username}`,
  });
  return "friends";
}

/**
 * "Kennst du …?" – members who share active groups with the viewer, are not
 * friends yet and have no open request either way. Most shared groups first.
 */
export async function suggestFriends(userId: string, limit = 6): Promise<(FriendUser & { sharedGroups: number })[]> {
  const myGroups = await prisma.groupMember.findMany({ where: { userId, status: "ACTIVE" }, select: { groupId: true } });
  if (myGroups.length === 0) return [];

  const [friends, pending] = await Promise.all([
    friendIds(userId),
    prisma.friendship.findMany({
      where: { status: "PENDING", OR: [{ requesterId: userId }, { addresseeId: userId }] },
      select: { requesterId: true, addresseeId: true },
    }),
  ]);
  const exclude = new Set([userId, ...friends, ...pending.flatMap((p) => [p.requesterId, p.addresseeId])]);

  const rows = await prisma.groupMember.groupBy({
    by: ["userId"],
    where: {
      groupId: { in: myGroups.map((g) => g.groupId) },
      status: "ACTIVE",
      userId: { notIn: [...exclude] },
      user: { status: "ACTIVE" },
    },
    _count: { groupId: true },
    orderBy: { _count: { groupId: "desc" } },
    take: limit,
  });
  if (rows.length === 0) return [];

  const users = await prisma.user.findMany({ where: { id: { in: rows.map((r) => r.userId) } }, select: friendUserSelect });
  const byId = new Map(users.map((u) => [u.id, u]));
  return rows.flatMap((r) => {
    const user = byId.get(r.userId);
    return user ? [{ ...user, sharedGroups: r._count.groupId }] : [];
  });
}
