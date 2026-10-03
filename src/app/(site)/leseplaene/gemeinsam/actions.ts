"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getUserOrThrow, UnauthorizedError } from "@/lib/auth/dal";
import { failure, fieldErrors, stringValues, success, type ActionState } from "@/lib/action-state";
import { notify, notifyMany } from "@/lib/notifications";
import { friendIds } from "@/lib/friends/queries";
import { getPlanGroup } from "@/lib/plans/shared";

const createSchema = z.object({
  planId: z.string().min(5),
  name: z.string().trim().min(3, { error: "Mindestens 3 Zeichen." }).max(80, { error: "Höchstens 80 Zeichen." }),
  groupId: z.string().optional().transform((v) => (v ? v : null)),
});

async function subscribe(userId: string, planId: string, planGroupId: string) {
  await prisma.planSubscription.upsert({
    where: { userId_planId: { userId, planId } },
    create: { userId, planId, planGroupId },
    update: { archivedAt: null, planGroupId },
  });
}

export async function createPlanGroup(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let user;
  try {
    user = await getUserOrThrow();
  } catch (e) {
    if (e instanceof UnauthorizedError) return failure("Bitte melde dich an.");
    throw e;
  }
  const values = stringValues(formData);
  const parsed = createSchema.safeParse(values);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), values };
  const { planId, name, groupId } = parsed.data;
  const plan = await prisma.readingPlan.findUnique({ where: { id: planId }, select: { id: true, title: true } });
  if (!plan) return failure("Leseplan nicht gefunden.");

  const invited = formData.getAll("friends").map(String).filter(Boolean);
  const myFriends = new Set(await friendIds(user.id));
  const friendsToInvite = invited.filter((id) => myFriends.has(id));

  let groupMemberIds: string[] = [];
  if (groupId) {
    const membership = await prisma.groupMember.findUnique({ where: { groupId_userId: { groupId, userId: user.id } }, select: { status: true } });
    if (membership?.status !== "ACTIVE") return failure("Du bist in dieser Gruppe nicht Mitglied.", { values });
    groupMemberIds = (await prisma.groupMember.findMany({ where: { groupId, status: "ACTIVE", NOT: { userId: user.id } }, select: { userId: true } })).map((m) => m.userId);
  }
  if (friendsToInvite.length === 0 && !groupId) return failure("Lade mindestens einen Freund ein oder wähle eine Gruppe.", { values });

  const planGroup = await prisma.planGroup.create({
    data: {
      planId: plan.id,
      name,
      createdById: user.id,
      groupId,
      members: {
        create: [
          { userId: user.id, status: "ACTIVE" },
          ...[...new Set([...friendsToInvite, ...groupMemberIds])].map((userId) => ({ userId, status: "PENDING" as const })),
        ],
      },
    },
    select: { id: true },
  });
  await subscribe(user.id, plan.id, planGroup.id);
  const href = `/leseplaene/gemeinsam/${planGroup.id}`;
  await notifyMany([...friendsToInvite, ...groupMemberIds], {
    type: "plan_invite",
    actorId: user.id,
    title: `${user.name} lädt dich ein: „${name}“ gemeinsam lesen`,
    body: plan.title,
    href,
  });
  revalidatePath("/leseplaene/meine");
  redirect(href);
}

export async function joinPlanGroup(id: unknown): Promise<ActionState> {
  try {
    const user = await getUserOrThrow();
    const group = await getPlanGroup(String(id));
    if (!group) return failure("Nicht gefunden.");
    const existing = group.members.find((m) => m.userId === user.id);
    if (existing?.status === "BANNED") return failure("Du kannst hier nicht beitreten.");
    let allowed = existing?.status === "PENDING";
    if (!allowed && group.groupId) {
      const gm = await prisma.groupMember.findUnique({ where: { groupId_userId: { groupId: group.groupId, userId: user.id } }, select: { status: true } });
      allowed = gm?.status === "ACTIVE";
    }
    if (!allowed) allowed = (await friendIds(user.id)).includes(group.createdById);
    if (!allowed) return failure("Nur Eingeladene, Freunde oder Gruppenmitglieder können beitreten.");
    await prisma.planGroupMember.upsert({
      where: { planGroupId_userId: { planGroupId: group.id, userId: user.id } },
      create: { planGroupId: group.id, userId: user.id, status: "ACTIVE" },
      update: { status: "ACTIVE", joinedAt: new Date() },
    });
    await subscribe(user.id, group.planId, group.id);
    if (group.createdById !== user.id) {
      await notify({ userId: group.createdById, actorId: user.id, type: "plan_invite", title: `${user.name} liest jetzt mit bei „${group.name}“`, href: `/leseplaene/gemeinsam/${group.id}` });
    }
    revalidatePath(`/leseplaene/gemeinsam/${group.id}`);
    revalidatePath("/leseplaene/meine");
    return success("Du liest jetzt mit.");
  } catch (e) {
    if (e instanceof UnauthorizedError) return failure("Bitte melde dich an.");
    console.error(e);
    return failure("Das hat nicht geklappt.");
  }
}

export async function leavePlanGroup(id: unknown): Promise<ActionState> {
  try {
    const user = await getUserOrThrow();
    const group = await getPlanGroup(String(id));
    if (!group) return failure("Nicht gefunden.");
    await prisma.planGroupMember.deleteMany({ where: { planGroupId: group.id, userId: user.id } });
    await prisma.planSubscription.updateMany({ where: { userId: user.id, planId: group.planId, planGroupId: group.id }, data: { planGroupId: null } });
    const remaining = await prisma.planGroupMember.count({ where: { planGroupId: group.id } });
    if (remaining === 0) await prisma.planGroup.delete({ where: { id: group.id } });
    revalidatePath(`/leseplaene/gemeinsam/${group.id}`);
    revalidatePath("/leseplaene/meine");
    return success("Du liest hier nicht mehr mit.");
  } catch (e) {
    if (e instanceof UnauthorizedError) return failure("Bitte melde dich an.");
    console.error(e);
    return failure("Das hat nicht geklappt.");
  }
}

export async function setShareHighlights(id: unknown, share: boolean): Promise<ActionState> {
  try {
    const user = await getUserOrThrow();
    await prisma.planGroupMember.updateMany({ where: { planGroupId: String(id), userId: user.id }, data: { shareHighlights: share } });
    revalidatePath(`/leseplaene/gemeinsam/${String(id)}`);
    return success(share ? "Deine Markierungen und geteilten Notizen sind für die anderen sichtbar." : "Deine Markierungen bleiben privat.");
  } catch (e) {
    if (e instanceof UnauthorizedError) return failure("Bitte melde dich an.");
    return failure("Das hat nicht geklappt.");
  }
}

export async function inviteFriendsToPlanGroup(id: unknown, formData: FormData): Promise<ActionState> {
  try {
    const user = await getUserOrThrow();
    const group = await getPlanGroup(String(id));
    if (!group || group.createdById !== user.id) return failure("Nur wer den Plan gestartet hat, kann einladen.");
    const wanted = formData.getAll("friends").map(String);
    const mine = new Set(await friendIds(user.id));
    const already = new Set(group.members.map((m) => m.userId));
    const ids = wanted.filter((f) => mine.has(f) && !already.has(f));
    if (ids.length === 0) return failure("Niemand Neues ausgewählt.");
    await prisma.planGroupMember.createMany({ data: ids.map((userId) => ({ planGroupId: group.id, userId, status: "PENDING" })) });
    await notifyMany(ids, { type: "plan_invite", actorId: user.id, title: `${user.name} lädt dich ein: „${group.name}“ gemeinsam lesen`, href: `/leseplaene/gemeinsam/${group.id}` });
    revalidatePath(`/leseplaene/gemeinsam/${group.id}`);
    return success(`${ids.length} Einladung${ids.length === 1 ? "" : "en"} verschickt.`);
  } catch (e) {
    if (e instanceof UnauthorizedError) return failure("Bitte melde dich an.");
    console.error(e);
    return failure("Das hat nicht geklappt.");
  }
}
