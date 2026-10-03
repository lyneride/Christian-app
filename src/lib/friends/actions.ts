"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getUserOrThrow, UnauthorizedError } from "@/lib/auth/dal";
import { failure, success, type ActionState } from "@/lib/action-state";
import { notify } from "@/lib/notifications";
import { getFriendState } from "./queries";

const idSchema = z.string().min(5).max(64);
const usernameSchema = z
  .string()
  .trim()
  .transform((s) => s.replace(/^@/, "").toLowerCase())
  .pipe(z.string().min(3).max(30));

function revalidate(username?: string) {
  revalidatePath("/freunde");
  if (username) revalidatePath(`/profil/${username}`);
}

async function withUser(fn: (user: Awaited<ReturnType<typeof getUserOrThrow>>) => Promise<ActionState>): Promise<ActionState> {
  try {
    return await fn(await getUserOrThrow());
  } catch (e) {
    if (e instanceof UnauthorizedError) return failure("Bitte melde dich an.");
    console.error(e);
    return failure("Das hat leider nicht geklappt. Bitte versuch es noch einmal.");
  }
}

/** Sends (or re-sends after a decline) a friend request to the user with this username. */
export async function sendFriendRequest(username: unknown): Promise<ActionState> {
  return withUser(async (user) => {
    const parsed = usernameSchema.safeParse(username);
    if (!parsed.success) return failure("Ungültiger Benutzername.");
    const other = await prisma.user.findUnique({ where: { username: parsed.data }, select: { id: true, username: true, status: true } });
    if (!other || other.status !== "ACTIVE") return failure("Dieses Mitglied gibt es nicht.");
    if (other.id === user.id) return failure("Du kannst dich nicht selbst hinzufügen.");
    const state = await getFriendState(user.id, other.id);
    if (state.kind === "friends") return success("Ihr seid schon befreundet.");
    if (state.kind === "sent") return success("Anfrage ist schon unterwegs.");
    if (state.kind === "received") {
      await prisma.friendship.update({ where: { id: state.friendshipId }, data: { status: "ACCEPTED", respondedAt: new Date() } });
      await notify({ userId: other.id, actorId: user.id, type: "friend_accepted", title: `${user.name} hat deine Freundschaftsanfrage angenommen`, href: `/@${user.username}` });
      revalidate(other.username);
      return success("Ihr seid jetzt befreundet.");
    }
    await prisma.friendship.upsert({
      where: { requesterId_addresseeId: { requesterId: user.id, addresseeId: other.id } },
      create: { requesterId: user.id, addresseeId: other.id },
      update: { status: "PENDING", respondedAt: null, createdAt: new Date() },
    });
    await notify({ userId: other.id, actorId: user.id, type: "friend_request", title: `${user.name} möchte mit dir befreundet sein`, href: "/freunde" });
    revalidate(other.username);
    return success("Anfrage gesendet.");
  });
}

export async function acceptFriendRequest(friendshipId: unknown): Promise<ActionState> {
  return withUser(async (user) => {
    const parsed = idSchema.safeParse(friendshipId);
    if (!parsed.success) return failure("Anfrage nicht gefunden.");
    const req = await prisma.friendship.findFirst({
      where: { id: parsed.data, addresseeId: user.id, status: "PENDING" },
      select: { id: true, requester: { select: { id: true, username: true } } },
    });
    if (!req) return failure("Anfrage nicht gefunden.");
    await prisma.friendship.update({ where: { id: req.id }, data: { status: "ACCEPTED", respondedAt: new Date() } });
    await notify({ userId: req.requester.id, actorId: user.id, type: "friend_accepted", title: `${user.name} hat deine Freundschaftsanfrage angenommen`, href: `/@${user.username}` });
    revalidate(req.requester.username);
    return success("Ihr seid jetzt befreundet.");
  });
}

export async function declineFriendRequest(friendshipId: unknown): Promise<ActionState> {
  return withUser(async (user) => {
    const parsed = idSchema.safeParse(friendshipId);
    if (!parsed.success) return failure("Anfrage nicht gefunden.");
    const { count } = await prisma.friendship.updateMany({
      where: { id: parsed.data, addresseeId: user.id, status: "PENDING" },
      data: { status: "DECLINED", respondedAt: new Date() },
    });
    revalidate();
    return count ? success("Anfrage abgelehnt.") : failure("Anfrage nicht gefunden.");
  });
}

/** Cancels an own pending request or ends an existing friendship. */
export async function removeFriendship(friendshipId: unknown): Promise<ActionState> {
  return withUser(async (user) => {
    const parsed = idSchema.safeParse(friendshipId);
    if (!parsed.success) return failure("Nicht gefunden.");
    const row = await prisma.friendship.findFirst({
      where: { id: parsed.data, OR: [{ requesterId: user.id }, { addresseeId: user.id }] },
      select: { id: true, requester: { select: { username: true } }, addressee: { select: { username: true } } },
    });
    if (!row) return failure("Nicht gefunden.");
    await prisma.friendship.delete({ where: { id: row.id } });
    revalidate(row.requester.username);
    revalidate(row.addressee.username);
    return success("Entfernt.");
  });
}
