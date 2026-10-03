import "server-only";
import { prisma } from "@/lib/db";
import { friendIds } from "@/lib/friends/queries";
import { notifyMany } from "@/lib/notifications";

export interface StartSharedPlanInput {
  user: { id: string; name: string };
  plan: { id: string; title: string };
  /** Display name of the shared plan, e.g. "Hauskreis liest Johannes" */
  name: string;
  /** Optional community group – all its active members get invited. */
  groupId: string | null;
  /** Friend ids ticked in the form (non-friends are ignored). */
  friends: string[];
}

export type StartSharedPlanResult = { ok: true; id: string; href: string } | { ok: false; message: string };

export async function subscribeToPlan(userId: string, planId: string, planGroupId: string | null = null) {
  await prisma.planSubscription.upsert({
    where: { userId_planId: { userId, planId } },
    create: { userId, planId, planGroupId },
    update: planGroupId ? { archivedAt: null, planGroupId } : { archivedAt: null },
  });
}

/**
 * Creates a "Gemeinsam lesen" group for a plan, subscribes the creator and
 * invites friends and/or a whole community group. Shared by the plan page
 * ("Mit Freunden lesen") and the plan builder.
 */
export async function startSharedPlan(input: StartSharedPlanInput): Promise<StartSharedPlanResult> {
  const { user, plan, name, groupId } = input;
  const myFriends = new Set(await friendIds(user.id));
  const friendsToInvite = input.friends.filter((id) => myFriends.has(id) && id !== user.id);

  let groupMemberIds: string[] = [];
  if (groupId) {
    const membership = await prisma.groupMember.findUnique({ where: { groupId_userId: { groupId, userId: user.id } }, select: { status: true } });
    if (membership?.status !== "ACTIVE") return { ok: false, message: "Du bist in dieser Gruppe nicht Mitglied." };
    groupMemberIds = (await prisma.groupMember.findMany({ where: { groupId, status: "ACTIVE", NOT: { userId: user.id } }, select: { userId: true } })).map((m) => m.userId);
  }
  if (friendsToInvite.length === 0 && !groupId) return { ok: false, message: "Lade mindestens einen Freund ein oder wähle eine Gruppe." };

  const invitees = [...new Set([...friendsToInvite, ...groupMemberIds])];
  const planGroup = await prisma.planGroup.create({
    data: {
      planId: plan.id,
      name,
      createdById: user.id,
      groupId,
      members: { create: [{ userId: user.id, status: "ACTIVE" }, ...invitees.map((userId) => ({ userId, status: "PENDING" as const }))] },
    },
    select: { id: true },
  });
  await subscribeToPlan(user.id, plan.id, planGroup.id);
  const href = `/leseplaene/gemeinsam/${planGroup.id}`;
  await notifyMany(invitees, {
    type: "plan_invite",
    actorId: user.id,
    title: `${user.name} lädt dich ein: „${name}“ gemeinsam lesen`,
    body: plan.title,
    href,
  });
  return { ok: true, id: planGroup.id, href };
}
