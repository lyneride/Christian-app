"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { GroupRole } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import { getUserOrThrow, UnauthorizedError, type CurrentUser } from "@/lib/auth/dal";
import { failure, fieldErrors, stringValues, success, type ActionState } from "@/lib/action-state";
import { notify, notifyMany } from "@/lib/notifications";
import { slugify } from "@/lib/utils";
import { getMembership, listLeaderIds } from "@/lib/groups/queries";
import { canActOn, canChangeRole, canManageGroup, isOwner } from "@/lib/groups/roles";
import {
  changeRoleSchema,
  groupIdSchema,
  groupSchema,
  groupSlugBase,
  userIdSchema,
  type GroupInput,
} from "@/lib/validation/groups";
import { groupPath } from "@/lib/validation/community";

/**
 * Server actions for groups: founding, editing, joining and member
 * management. Expected failures are returned as state, never thrown.
 */

const LOGIN_REQUIRED = "Bitte melde dich an.";
const NOT_FOUND = "Diese Gruppe gibt es nicht.";
const NO_PERMISSION = "Das darf nur die Gruppenleitung.";
const GENERIC_ERROR = "Das hat leider nicht geklappt. Bitte versuche es später noch einmal.";

async function actionUser(): Promise<CurrentUser | null> {
  try {
    return await getUserOrThrow();
  } catch (err) {
    if (err instanceof UnauthorizedError) return null;
    throw err;
  }
}

function revalidateGroup(slug: string) {
  revalidatePath("/gruppen");
  revalidatePath(groupPath(slug));
  revalidatePath(`${groupPath(slug)}/mitglieder`);
  revalidatePath("/gemeinschaft");
}

type ParsedGroupForm = { ok: false; error: ActionState } | { ok: true; data: GroupInput; values: Record<string, string> };

function parseGroupForm(formData: FormData): ParsedGroupForm {
  const values = stringValues(formData);
  const parsed = groupSchema.safeParse({
    name: values.name ?? "",
    description: values.description ?? "",
    kind: values.kind ?? "",
    city: values.city ?? "",
    visibility: values.visibility ?? "",
    imageUrl: values.imageUrl ?? "",
  });
  if (!parsed.success) {
    return { ok: false, error: failure("Bitte prüfe deine Eingaben.", { errors: fieldErrors(parsed.error), values }) };
  }
  return { ok: true, data: parsed.data, values };
}

/** Unique slug: slugified name, with a numeric suffix on collision. */
async function uniqueSlug(name: string): Promise<string> {
  const base = groupSlugBase(name, slugify);
  const taken = await prisma.group.findMany({
    where: { OR: [{ slug: base }, { slug: { startsWith: `${base}-` } }] },
    select: { slug: true },
  });
  if (taken.length === 0) return base;
  const used = new Set(taken.map((g) => g.slug));
  let n = 2;
  while (used.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

async function findGroup(groupId: string) {
  if (!groupIdSchema.safeParse(groupId).success) return null;
  return prisma.group.findUnique({ where: { id: groupId }, select: { id: true, slug: true, name: true, visibility: true } });
}

// ---------------------------------------------------------------------------
// Gründen / Bearbeiten
// ---------------------------------------------------------------------------

export async function createGroup(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await actionUser();
  if (!user) return failure(LOGIN_REQUIRED, { values: stringValues(formData) });

  const result = parseGroupForm(formData);
  if (!result.ok) return result.error;

  let slug: string;
  try {
    slug = await uniqueSlug(result.data.name);
    await prisma.group.create({
      data: {
        ...result.data,
        slug,
        createdById: user.id,
        members: { create: { userId: user.id, role: "OWNER", status: "ACTIVE" } },
      },
      select: { id: true },
    });
  } catch (err) {
    console.error("[gruppen] Gruppe konnte nicht angelegt werden:", err);
    return failure(GENERIC_ERROR, { values: result.values });
  }

  revalidateGroup(slug);
  redirect(groupPath(slug));
}

export async function updateGroup(groupId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await actionUser();
  if (!user) return failure(LOGIN_REQUIRED, { values: stringValues(formData) });

  const group = await findGroup(groupId);
  if (!group) return failure(NOT_FOUND);
  if (!canManageGroup(await getMembership(group.id, user.id))) return failure(NO_PERMISSION);

  const result = parseGroupForm(formData);
  if (!result.ok) return result.error;

  try {
    await prisma.group.update({ where: { id: group.id }, data: result.data });
    // A group that becomes closed keeps its content inside: existing posts become group-only.
    if (result.data.visibility === "PRIVATE" && group.visibility !== "PRIVATE") {
      await prisma.post.updateMany({ where: { groupId: group.id }, data: { visibility: "GROUP" } });
    }
  } catch (err) {
    console.error("[gruppen] Gruppe konnte nicht aktualisiert werden:", err);
    return failure(GENERIC_ERROR, { values: result.values });
  }

  revalidateGroup(group.slug);
  redirect(groupPath(group.slug));
}

// ---------------------------------------------------------------------------
// Beitreten / Verlassen
// ---------------------------------------------------------------------------

/** Open groups: joins immediately. Closed groups: files a request and tells the leadership. */
export async function joinGroup(groupId: string): Promise<ActionState> {
  const user = await actionUser();
  if (!user) return failure(LOGIN_REQUIRED);

  const group = await findGroup(groupId);
  if (!group) return failure(NOT_FOUND);

  const existing = await getMembership(group.id, user.id);
  if (existing?.status === "ACTIVE") return success("Du bist schon dabei.", { data: { status: "ACTIVE" } });
  if (existing?.status === "PENDING") return success("Deine Anfrage wartet noch auf eine Antwort.", { data: { status: "PENDING" } });
  if (existing?.status === "BANNED") return failure("Du kannst dieser Gruppe nicht beitreten.");

  const status = group.visibility === "PRIVATE" ? "PENDING" : "ACTIVE";
  try {
    await prisma.groupMember.create({ data: { groupId: group.id, userId: user.id, role: "MEMBER", status } });
    if (status === "PENDING") {
      await notifyMany(await listLeaderIds(group.id), {
        type: "group_request",
        title: `${user.name} möchte „${group.name}“ beitreten`,
        href: `${groupPath(group.slug)}/mitglieder`,
        actorId: user.id,
      });
    }
  } catch (err) {
    console.error("[gruppen] Beitritt fehlgeschlagen:", err);
    return failure(GENERIC_ERROR);
  }

  revalidateGroup(group.slug);
  return success(status === "ACTIVE" ? "Willkommen in der Gruppe!" : "Deine Anfrage ist bei der Leitung angekommen.", {
    data: { status },
  });
}

/** Leaves the group or withdraws a pending request. The owner has to hand over the lead first. */
export async function leaveGroup(groupId: string): Promise<ActionState> {
  const user = await actionUser();
  if (!user) return failure(LOGIN_REQUIRED);

  const group = await findGroup(groupId);
  if (!group) return failure(NOT_FOUND);

  const membership = await getMembership(group.id, user.id);
  if (!membership || membership.status === "BANNED") return failure("Du bist in dieser Gruppe nicht Mitglied.");
  if (isOwner(membership)) {
    return failure("Als Leitung kannst du die Gruppe nicht verlassen. Übergib die Leitung zuerst an ein anderes Mitglied.");
  }

  try {
    await prisma.groupMember.delete({ where: { groupId_userId: { groupId: group.id, userId: user.id } } });
  } catch (err) {
    console.error("[gruppen] Verlassen fehlgeschlagen:", err);
    return failure(GENERIC_ERROR);
  }

  revalidateGroup(group.slug);
  return success(membership.status === "PENDING" ? "Deine Anfrage ist zurückgezogen." : "Du hast die Gruppe verlassen.", {
    data: { status: null },
  });
}

// ---------------------------------------------------------------------------
// Mitgliederverwaltung (Leitung)
// ---------------------------------------------------------------------------

interface ManagedMember {
  user: CurrentUser;
  group: NonNullable<Awaited<ReturnType<typeof findGroup>>>;
  actor: NonNullable<Awaited<ReturnType<typeof getMembership>>>;
  target: { role: GroupRole; status: "ACTIVE" | "PENDING" | "BANNED"; user: { name: string } };
}

type ManagedMemberResult = { ok: false; error: ActionState } | ({ ok: true } & ManagedMember);

const fail = (message: string): ManagedMemberResult => ({ ok: false, error: failure(message) });

/** Loads group, actor membership and the target row; returns an error state when the actor may not act. */
async function loadManagedMember(groupId: string, userId: string): Promise<ManagedMemberResult> {
  const user = await actionUser();
  if (!user) return fail(LOGIN_REQUIRED);
  if (!userIdSchema.safeParse(userId).success) return fail("Dieses Mitglied gibt es nicht.");

  const group = await findGroup(groupId);
  if (!group) return fail(NOT_FOUND);
  const actor = await getMembership(group.id, user.id);
  if (!actor || !canManageGroup(actor)) return fail(NO_PERMISSION);
  if (userId === user.id) return fail("Dich selbst kannst du hier nicht verwalten.");

  const target = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: group.id, userId } },
    select: { role: true, status: true, user: { select: { name: true } } },
  });
  if (!target) return fail("Dieses Mitglied gibt es nicht.");
  return { ok: true, user, group, actor, target };
}

export async function approveMember(groupId: string, userId: string): Promise<ActionState> {
  const ctx = await loadManagedMember(groupId, userId);
  if (!ctx.ok) return ctx.error;
  if (ctx.target.status !== "PENDING") return failure("Diese Anfrage ist nicht mehr offen.");

  try {
    await prisma.groupMember.update({
      where: { groupId_userId: { groupId: ctx.group.id, userId } },
      data: { status: "ACTIVE", joinedAt: new Date() },
    });
    await notify({
      userId,
      actorId: ctx.user.id,
      type: "group_accepted",
      title: `Willkommen in „${ctx.group.name}“`,
      body: "Deine Anfrage wurde angenommen.",
      href: groupPath(ctx.group.slug),
    });
  } catch (err) {
    console.error("[gruppen] Anfrage konnte nicht angenommen werden:", err);
    return failure(GENERIC_ERROR);
  }

  revalidateGroup(ctx.group.slug);
  return success(`${ctx.target.user.name} ist jetzt dabei.`);
}

export async function rejectMember(groupId: string, userId: string): Promise<ActionState> {
  const ctx = await loadManagedMember(groupId, userId);
  if (!ctx.ok) return ctx.error;
  if (ctx.target.status !== "PENDING") return failure("Diese Anfrage ist nicht mehr offen.");

  try {
    await prisma.groupMember.delete({ where: { groupId_userId: { groupId: ctx.group.id, userId } } });
  } catch (err) {
    console.error("[gruppen] Anfrage konnte nicht abgelehnt werden:", err);
    return failure(GENERIC_ERROR);
  }

  revalidateGroup(ctx.group.slug);
  return success("Die Anfrage wurde abgelehnt.");
}

export async function removeMember(groupId: string, userId: string): Promise<ActionState> {
  const ctx = await loadManagedMember(groupId, userId);
  if (!ctx.ok) return ctx.error;
  if (!canActOn(ctx.actor, ctx.target)) return failure(NO_PERMISSION);

  try {
    await prisma.groupMember.delete({ where: { groupId_userId: { groupId: ctx.group.id, userId } } });
  } catch (err) {
    console.error("[gruppen] Mitglied konnte nicht entfernt werden:", err);
    return failure(GENERIC_ERROR);
  }

  revalidateGroup(ctx.group.slug);
  return success(`${ctx.target.user.name} wurde aus der Gruppe entfernt.`);
}

export async function banMember(groupId: string, userId: string): Promise<ActionState> {
  const ctx = await loadManagedMember(groupId, userId);
  if (!ctx.ok) return ctx.error;
  if (!canActOn(ctx.actor, ctx.target)) return failure(NO_PERMISSION);

  try {
    await prisma.groupMember.update({
      where: { groupId_userId: { groupId: ctx.group.id, userId } },
      data: { status: "BANNED", role: "MEMBER" },
    });
  } catch (err) {
    console.error("[gruppen] Mitglied konnte nicht gesperrt werden:", err);
    return failure(GENERIC_ERROR);
  }

  revalidateGroup(ctx.group.slug);
  return success(`${ctx.target.user.name} ist jetzt gesperrt.`);
}

/** Owner only. Promoting to OWNER hands over the lead; the previous owner becomes an admin. */
export async function changeRole(groupId: string, userId: string, role: GroupRole): Promise<ActionState> {
  const parsed = changeRoleSchema.safeParse({ groupId, userId, role });
  if (!parsed.success) return failure("Unbekannte Rolle.");

  const ctx = await loadManagedMember(groupId, userId);
  if (!ctx.ok) return ctx.error;
  if (!canChangeRole(ctx.actor, ctx.target)) return failure("Rollen kann nur die Leitung der Gruppe ändern.");
  if (ctx.target.role === role) return success();

  try {
    if (role === "OWNER") {
      await prisma.$transaction([
        prisma.groupMember.update({ where: { groupId_userId: { groupId: ctx.group.id, userId: ctx.user.id } }, data: { role: "ADMIN" } }),
        prisma.groupMember.update({ where: { groupId_userId: { groupId: ctx.group.id, userId } }, data: { role: "OWNER" } }),
      ]);
    } else {
      await prisma.groupMember.update({ where: { groupId_userId: { groupId: ctx.group.id, userId } }, data: { role } });
    }
  } catch (err) {
    console.error("[gruppen] Rolle konnte nicht geändert werden:", err);
    return failure(GENERIC_ERROR);
  }

  revalidateGroup(ctx.group.slug);
  return success(
    role === "OWNER"
      ? `${ctx.target.user.name} leitet die Gruppe jetzt. Du bleibst in der Mitleitung.`
      : role === "ADMIN"
        ? `${ctx.target.user.name} ist jetzt in der Mitleitung.`
        : `${ctx.target.user.name} ist jetzt einfaches Mitglied.`,
  );
}
