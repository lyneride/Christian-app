"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getUserOrThrow, isAdmin, isModerator, UnauthorizedError, type CurrentUser } from "@/lib/auth/dal";
import { destroyAllSessions } from "@/lib/auth/session";
import { failure, fieldErrors, success, type ActionState } from "@/lib/action-state";
import { notify } from "@/lib/notifications";
import { profilePath } from "@/lib/profile";
import { logAudit, parseAuditDetails } from "@/lib/moderation/audit";
import { listPathFor, loadReportTarget, type ReportTarget } from "@/lib/moderation/queries";
import type { ReportTargetType } from "@/lib/validation/report";
import {
  ROLE_LABELS,
  parseTargetType,
  removeContentSchema,
  resolveReportSchema,
  setUserRoleSchema,
  suspendUserSchema,
} from "@/lib/validation/admin";

/**
 * Server actions of the moderation area. Every action re-checks the role,
 * returns expected failures as state (never throws them), writes an audit
 * entry and revalidates the admin pages plus the affected public paths.
 */

const LOGIN_REQUIRED = "Bitte melde dich an.";
const NO_PERMISSION = "Keine Berechtigung.";
const GENERIC_ERROR = "Das hat leider nicht geklappt. Bitte versuche es später noch einmal.";
const CHECK_INPUT = "Bitte prüfe deine Eingabe.";
const REPORT_NOT_FOUND = "Diese Meldung gibt es nicht.";
const CONTENT_NOT_FOUND = "Diesen Inhalt gibt es nicht mehr.";
const USER_NOT_FOUND = "Dieses Mitglied gibt es nicht.";

type RemovableKind = Exclude<ReportTargetType, "user" | "message">;

const REMOVED_TITLES: Record<RemovableKind, string> = {
  post: "Dein Beitrag wurde entfernt",
  comment: "Dein Kommentar wurde entfernt",
  prayer: "Dein Gebetsanliegen wurde entfernt",
  event: "Deine Veranstaltung wurde entfernt",
  group: "Deine Gruppe wurde verborgen",
};

const RESTORED_TITLES: Record<RemovableKind, string> = {
  post: "Dein Beitrag ist wieder sichtbar",
  comment: "Dein Kommentar ist wieder sichtbar",
  prayer: "Dein Gebetsanliegen ist wieder sichtbar",
  event: "Deine Veranstaltung ist wieder sichtbar",
  group: "Deine Gruppe ist wieder sichtbar",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type Auth = { user: CurrentUser; error?: undefined } | { user?: undefined; error: ActionState };

/** The signed-in moderator, or the failure state to return. */
async function moderator(): Promise<Auth> {
  let user: CurrentUser;
  try {
    user = await getUserOrThrow();
  } catch (err) {
    if (err instanceof UnauthorizedError) return { error: failure(LOGIN_REQUIRED) };
    throw err;
  }
  if (!isModerator(user)) return { error: failure(NO_PERMISSION) };
  return { user };
}

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}

function isRemovable(kind: ReportTargetType): kind is RemovableKind {
  return kind !== "user" && kind !== "message";
}

function revalidateAdmin() {
  revalidatePath("/admin", "layout");
}

/** Revalidates the public pages where the content (and its author's profile) appears. */
function revalidateContent(kind: ReportTargetType, target: Pick<ReportTarget, "href" | "authorUsername">) {
  const list = listPathFor(kind);
  if (list) revalidatePath(list);
  if (target.href) revalidatePath(target.href.split("#")[0]);
  if (target.authorUsername) revalidatePath(profilePath(target.authorUsername));
}

/** True when no other active admin would remain without this user. */
async function isLastActiveAdmin(userId: string): Promise<boolean> {
  const others = await prisma.user.count({ where: { role: "ADMIN", status: "ACTIVE", NOT: { id: userId } } });
  return others === 0;
}

function quote(title: string) {
  return `„${title.length > 80 ? title.slice(0, 79) + "…" : title}“`;
}

// ---------------------------------------------------------------------------
// Meldungen
// ---------------------------------------------------------------------------

/** Bound with `.bind(null, reportId)`; form fields: `status` (RESOLVED | DISMISSED), `resolution`. */
export async function resolveReport(reportId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await moderator();
  if (auth.error) return auth.error;
  const { user } = auth;

  const parsed = resolveReportSchema.safeParse({ status: str(formData, "status"), resolution: str(formData, "resolution") });
  if (!parsed.success) return failure(CHECK_INPUT, { errors: fieldErrors(parsed.error) });
  const { status, resolution } = parsed.data;

  const report = await prisma.report.findUnique({
    where: { id: reportId },
    select: { id: true, status: true, reporterId: true, targetType: true, targetId: true },
  });
  if (!report) return failure(REPORT_NOT_FOUND);
  if (report.status !== "OPEN") return failure("Diese Meldung ist bereits abgeschlossen.");

  const target = await loadReportTarget(report.targetType, report.targetId);
  const href = target && !target.deleted ? (target.href ?? undefined) : undefined;

  try {
    await prisma.report.update({
      where: { id: report.id },
      data: { status, resolution: resolution || null, resolvedById: user.id, resolvedAt: new Date() },
    });
    await notify({
      userId: report.reporterId,
      type: "moderation",
      title: "Deine Meldung wurde bearbeitet",
      body:
        status === "RESOLVED"
          ? "Danke für deinen Hinweis. Wir haben die Meldung geprüft und sind tätig geworden."
          : "Danke für deinen Hinweis. Wir haben die Meldung geprüft und keinen Verstoß festgestellt.",
      href,
    });
    await logAudit({
      actorId: user.id,
      action: status === "RESOLVED" ? "report.resolve" : "report.dismiss",
      targetType: "report",
      targetId: report.id,
      details: { targetType: report.targetType, targetId: report.targetId, resolution },
    });
  } catch (err) {
    console.error("[admin] Meldung konnte nicht abgeschlossen werden:", err);
    return failure(GENERIC_ERROR);
  }

  revalidateAdmin();
  return success(status === "RESOLVED" ? "Die Meldung ist erledigt." : "Die Meldung wurde abgewiesen.");
}

// ---------------------------------------------------------------------------
// Inhalte
// ---------------------------------------------------------------------------

/** Bound with `.bind(null, targetType, targetId)`; form field: `reason`. */
export async function removeContent(
  targetType: string,
  targetId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const auth = await moderator();
  if (auth.error) return auth.error;
  const { user } = auth;

  const parsed = removeContentSchema.safeParse({ targetType, targetId, reason: str(formData, "reason") });
  if (!parsed.success) return failure(CHECK_INPUT, { errors: fieldErrors(parsed.error) });
  const { targetType: kind, targetId: id, reason } = parsed.data;

  if (kind === "user") return failure("Profile werden nicht entfernt. Sperre das Mitglied stattdessen.");
  if (kind === "message") return failure("Private Nachrichten können nicht entfernt werden.");
  if (!isRemovable(kind)) return failure(NO_PERMISSION);

  const target = await loadReportTarget(kind, id);
  if (!target) return failure(CONTENT_NOT_FOUND);
  if (target.deleted) return failure("Dieser Inhalt ist bereits entfernt.");

  let previousVisibility: string | undefined;
  try {
    const now = new Date();
    switch (kind) {
      case "post":
        await prisma.post.update({ where: { id }, data: { deletedAt: now } });
        break;
      case "comment":
        await prisma.comment.update({ where: { id }, data: { deletedAt: now } });
        break;
      case "prayer":
        await prisma.prayerRequest.update({ where: { id }, data: { deletedAt: now } });
        break;
      case "event":
        await prisma.event.update({ where: { id }, data: { deletedAt: now } });
        break;
      case "group": {
        // Groups have no soft delete: hiding them (PRIVATE) keeps members and posts intact.
        const group = await prisma.group.findUnique({ where: { id }, select: { visibility: true } });
        previousVisibility = group?.visibility;
        await prisma.group.update({ where: { id }, data: { visibility: "PRIVATE" } });
        break;
      }
    }
    if (target.authorId) {
      await notify({
        userId: target.authorId,
        type: "moderation",
        title: REMOVED_TITLES[kind],
        body: `${quote(target.title)} – Begründung der Moderation: ${reason}`,
      });
    }
    await logAudit({
      actorId: user.id,
      action: "content.remove",
      targetType: kind,
      targetId: id,
      details: { reason, title: target.title, authorId: target.authorId, href: target.href, previousVisibility },
    });
  } catch (err) {
    console.error("[admin] Inhalt konnte nicht entfernt werden:", err);
    return failure(GENERIC_ERROR);
  }

  revalidateAdmin();
  revalidateContent(kind, target);
  return success(kind === "group" ? "Die Gruppe ist jetzt verborgen." : "Der Inhalt wurde entfernt. Das Mitglied wurde benachrichtigt.");
}

/** Undoes a removal. Works with `useActionState(() => restoreContent(type, id), …)` and plain transitions. */
export async function restoreContent(targetType: string, targetId: string): Promise<ActionState> {
  const auth = await moderator();
  if (auth.error) return auth.error;
  const { user } = auth;

  const kind = parseTargetType(targetType);
  if (!kind || !isRemovable(kind)) return failure("Dieser Inhalt kann nicht wiederhergestellt werden.");
  if (!targetId || targetId.length > 64) return failure(CONTENT_NOT_FOUND);
  const id = targetId;

  const target = await loadReportTarget(kind, id);
  if (!target) return failure(CONTENT_NOT_FOUND);
  if (!target.deleted) return failure("Dieser Inhalt ist nicht entfernt.");

  try {
    switch (kind) {
      case "post":
        await prisma.post.update({ where: { id }, data: { deletedAt: null } });
        break;
      case "comment":
        await prisma.comment.update({ where: { id }, data: { deletedAt: null } });
        break;
      case "prayer":
        await prisma.prayerRequest.update({ where: { id }, data: { deletedAt: null } });
        break;
      case "event":
        await prisma.event.update({ where: { id }, data: { deletedAt: null } });
        break;
      case "group": {
        // Restore the visibility recorded when the group was hidden; MEMBERS is the safe default.
        const last = await prisma.auditLog.findFirst({
          where: { action: "content.remove", targetType: "group", targetId: id },
          orderBy: { createdAt: "desc" },
          select: { details: true },
        });
        const previous = parseAuditDetails(last?.details ?? null)?.previousVisibility;
        const visibility = previous === "PUBLIC" || previous === "MEMBERS" || previous === "GROUP" ? previous : "MEMBERS";
        await prisma.group.update({ where: { id }, data: { visibility } });
        break;
      }
    }
    if (target.authorId) {
      await notify({ userId: target.authorId, type: "moderation", title: RESTORED_TITLES[kind], body: quote(target.title), href: target.href ?? undefined });
    }
    await logAudit({
      actorId: user.id,
      action: "content.restore",
      targetType: kind,
      targetId: id,
      details: { title: target.title, authorId: target.authorId, href: target.href },
    });
  } catch (err) {
    console.error("[admin] Inhalt konnte nicht wiederhergestellt werden:", err);
    return failure(GENERIC_ERROR);
  }

  revalidateAdmin();
  revalidateContent(kind, target);
  return success("Der Inhalt ist wieder sichtbar.");
}

// ---------------------------------------------------------------------------
// Mitglieder
// ---------------------------------------------------------------------------

const memberSelect = { id: true, name: true, username: true, role: true, status: true } as const;

/** Bound with `.bind(null, userId)`; form field: `reason`. */
export async function suspendUser(userId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await moderator();
  if (auth.error) return auth.error;
  const { user } = auth;

  const parsed = suspendUserSchema.safeParse({ reason: str(formData, "reason") });
  if (!parsed.success) return failure(CHECK_INPUT, { errors: fieldErrors(parsed.error) });
  const { reason } = parsed.data;

  if (!userId || userId.length > 64) return failure(USER_NOT_FOUND);
  if (userId === user.id) return failure("Du kannst dich nicht selbst sperren.");

  const member = await prisma.user.findUnique({ where: { id: userId }, select: memberSelect });
  if (!member) return failure(USER_NOT_FOUND);
  if (member.status === "DELETED") return failure("Dieses Konto wurde gelöscht.");
  if (member.status === "SUSPENDED") return failure("Dieses Mitglied ist bereits gesperrt.");
  if (member.role !== "USER" && !isAdmin(user)) {
    return failure("Mitglieder mit Moderations- oder Admin-Rolle kann nur die Administration sperren.");
  }
  if (member.role === "ADMIN" && (await isLastActiveAdmin(member.id))) {
    return failure("Das letzte aktive Admin-Konto kann nicht gesperrt werden.");
  }

  try {
    await prisma.user.update({ where: { id: member.id }, data: { status: "SUSPENDED" } });
    await destroyAllSessions(member.id, false);
    // Seen after a reactivation; suspended accounts cannot sign in.
    await notify({
      userId: member.id,
      type: "moderation",
      title: "Dein Konto wurde gesperrt",
      body: `Begründung der Moderation: ${reason}`,
      href: "/hilfe",
    });
    await logAudit({ actorId: user.id, action: "user.suspend", targetType: "user", targetId: member.id, details: { reason } });
  } catch (err) {
    console.error("[admin] Mitglied konnte nicht gesperrt werden:", err);
    return failure(GENERIC_ERROR);
  }

  revalidateAdmin();
  revalidatePath(profilePath(member.username));
  return success(`${member.name} wurde gesperrt und auf allen Geräten abgemeldet.`);
}

/** Lifts a suspension. Works with `useActionState(() => reactivateUser(id), …)` and plain transitions. */
export async function reactivateUser(userId: string): Promise<ActionState> {
  const auth = await moderator();
  if (auth.error) return auth.error;
  const { user } = auth;

  if (!userId || userId.length > 64) return failure(USER_NOT_FOUND);
  const member = await prisma.user.findUnique({ where: { id: userId }, select: memberSelect });
  if (!member) return failure(USER_NOT_FOUND);
  if (member.status === "DELETED") return failure("Gelöschte Konten können nicht reaktiviert werden.");
  if (member.status !== "SUSPENDED") return failure("Dieses Mitglied ist nicht gesperrt.");
  if (member.role !== "USER" && !isAdmin(user)) {
    return failure("Sperren von Mitgliedern mit Moderations- oder Admin-Rolle kann nur die Administration aufheben.");
  }

  try {
    await prisma.user.update({ where: { id: member.id }, data: { status: "ACTIVE" } });
    await notify({
      userId: member.id,
      type: "moderation",
      title: "Dein Konto ist wieder aktiv",
      body: "Die Sperre wurde aufgehoben. Schön, dass du wieder dabei bist.",
      href: "/start",
    });
    await logAudit({ actorId: user.id, action: "user.reactivate", targetType: "user", targetId: member.id });
  } catch (err) {
    console.error("[admin] Sperre konnte nicht aufgehoben werden:", err);
    return failure(GENERIC_ERROR);
  }

  revalidateAdmin();
  revalidatePath(profilePath(member.username));
  return success(`Die Sperre von ${member.name} wurde aufgehoben.`);
}

/** Admin only. Bound with `.bind(null, userId)`; form field: `role`. */
export async function setUserRole(userId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await moderator();
  if (auth.error) return auth.error;
  const { user } = auth;
  if (!isAdmin(user)) return failure(NO_PERMISSION);

  const parsed = setUserRoleSchema.safeParse({ role: str(formData, "role") });
  if (!parsed.success) return failure(CHECK_INPUT, { errors: fieldErrors(parsed.error) });
  const { role } = parsed.data;

  if (!userId || userId.length > 64) return failure(USER_NOT_FOUND);
  if (userId === user.id) return failure("Deine eigene Rolle kannst du nicht ändern.");

  const member = await prisma.user.findUnique({ where: { id: userId }, select: memberSelect });
  if (!member) return failure(USER_NOT_FOUND);
  if (member.status === "DELETED") return failure("Dieses Konto wurde gelöscht.");
  if (member.role === role) return failure(`${member.name} hat diese Rolle bereits.`);
  if (member.role === "ADMIN" && (await isLastActiveAdmin(member.id))) {
    return failure("Das letzte aktive Admin-Konto kann seine Rolle nicht verlieren.");
  }

  try {
    await prisma.user.update({ where: { id: member.id }, data: { role } });
    await notify({
      userId: member.id,
      type: "moderation",
      title: "Deine Rolle wurde geändert",
      body: `Du hast jetzt die Rolle „${ROLE_LABELS[role]}“.`,
      href: role === "USER" ? "/start" : "/admin",
    });
    await logAudit({
      actorId: user.id,
      action: "user.role",
      targetType: "user",
      targetId: member.id,
      details: { from: member.role, to: role },
    });
  } catch (err) {
    console.error("[admin] Rolle konnte nicht geändert werden:", err);
    return failure(GENERIC_ERROR);
  }

  revalidateAdmin();
  revalidatePath(profilePath(member.username));
  return success(`${member.name} hat jetzt die Rolle „${ROLE_LABELS[role]}“.`);
}
