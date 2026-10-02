import { z } from "zod";
import { REPORT_TARGET_TYPES, type ReportTargetType } from "./report";

/**
 * Validation, labels and search-param parsers for the moderation area
 * ("/admin"). Pure module: usable from server actions, client forms and tests.
 */

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------

export const REPORT_STATUSES = ["OPEN", "RESOLVED", "DISMISSED"] as const;
export type ReportStatusValue = (typeof REPORT_STATUSES)[number];

export const REPORT_STATUS_LABELS: Record<ReportStatusValue, string> = {
  OPEN: "Offen",
  RESOLVED: "Erledigt",
  DISMISSED: "Abgewiesen",
};

/** The two ways a report can be closed. */
export const REPORT_RESOLUTIONS = ["RESOLVED", "DISMISSED"] as const;
export type ReportResolution = (typeof REPORT_RESOLUTIONS)[number];

export const resolutionNoteSchema = z
  .string()
  .trim()
  .max(1000, "Die Notiz darf höchstens 1000 Zeichen lang sein.");

export const resolveReportSchema = z.object({
  status: z.enum(REPORT_RESOLUTIONS, { error: "Bitte wähle, wie die Meldung abgeschlossen wird." }),
  resolution: resolutionNoteSchema,
});
export type ResolveReportInput = z.infer<typeof resolveReportSchema>;

/** Parses `?status=`; unknown values fall back to the open queue. */
export function parseReportStatus(value: string | string[] | undefined): ReportStatusValue {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw && (REPORT_STATUSES as readonly string[]).includes(raw) ? (raw as ReportStatusValue) : "OPEN";
}

export function parseTargetType(value: unknown): ReportTargetType | null {
  return typeof value === "string" && (REPORT_TARGET_TYPES as readonly string[]).includes(value)
    ? (value as ReportTargetType)
    : null;
}

// ---------------------------------------------------------------------------
// Members
// ---------------------------------------------------------------------------

export const USER_ROLES = ["USER", "MODERATOR", "ADMIN"] as const;
export type UserRoleValue = (typeof USER_ROLES)[number];

export const ROLE_LABELS: Record<UserRoleValue, string> = {
  USER: "Mitglied",
  MODERATOR: "Moderation",
  ADMIN: "Administration",
};

/** Statuses a moderator can set; DELETED is only reached through account deletion. */
export const USER_STATUSES = ["ACTIVE", "SUSPENDED"] as const;
export type UserStatusValue = (typeof USER_STATUSES)[number];

export const USER_STATUS_FILTERS = ["ACTIVE", "SUSPENDED", "DELETED"] as const;
export type UserStatusFilter = (typeof USER_STATUS_FILTERS)[number];

export const USER_STATUS_LABELS: Record<UserStatusFilter, string> = {
  ACTIVE: "Aktiv",
  SUSPENDED: "Gesperrt",
  DELETED: "Gelöscht",
};

/** Short note sent to the member with a removal or suspension. */
export const reasonNoteSchema = z
  .string()
  .trim()
  .max(500, "Die Begründung darf höchstens 500 Zeichen lang sein.");

const requiredReason = reasonNoteSchema.min(3, "Bitte gib eine kurze Begründung an (mindestens 3 Zeichen).");

export const setUserRoleSchema = z.object({
  role: z.enum(USER_ROLES, { error: "Unbekannte Rolle." }),
});
export type SetUserRoleInput = z.infer<typeof setUserRoleSchema>;

export const setUserStatusSchema = z.object({
  status: z.enum(USER_STATUSES, { error: "Unbekannter Status." }),
  reason: reasonNoteSchema,
});
export type SetUserStatusInput = z.infer<typeof setUserStatusSchema>;

export const suspendUserSchema = z.object({ reason: requiredReason });
export type SuspendUserInput = z.infer<typeof suspendUserSchema>;

export const removeContentSchema = z.object({
  targetType: z.enum(REPORT_TARGET_TYPES, { error: "Unbekannter Inhaltstyp." }),
  targetId: z.string().trim().min(1, "Unbekannter Inhalt.").max(64),
  reason: requiredReason,
});
export type RemoveContentInput = z.infer<typeof removeContentSchema>;

/** Parses `?rolle=`; unknown values mean "all roles". */
export function parseRoleFilter(value: string | string[] | undefined): UserRoleValue | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw && (USER_ROLES as readonly string[]).includes(raw) ? (raw as UserRoleValue) : undefined;
}

/** Parses `?status=` on the member list; unknown values mean "all statuses". */
export function parseStatusFilter(value: string | string[] | undefined): UserStatusFilter | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw && (USER_STATUS_FILTERS as readonly string[]).includes(raw) ? (raw as UserStatusFilter) : undefined;
}

export const SEARCH_MAX = 80;

/** Trims and caps the free-text search (`?q=`); empty means "no filter". */
export function parseSearchQuery(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return (raw ?? "").trim().replace(/\s+/g, " ").slice(0, SEARCH_MAX);
}

// ---------------------------------------------------------------------------
// Audit log
// ---------------------------------------------------------------------------

export const AUDIT_ACTIONS = [
  "report.resolve",
  "report.dismiss",
  "content.remove",
  "content.restore",
  "user.suspend",
  "user.reactivate",
  "user.role",
] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  "report.resolve": "Meldung erledigt",
  "report.dismiss": "Meldung abgewiesen",
  "content.remove": "Inhalt entfernt",
  "content.restore": "Inhalt wiederhergestellt",
  "user.suspend": "Mitglied gesperrt",
  "user.reactivate": "Sperre aufgehoben",
  "user.role": "Rolle geändert",
};

/** German label for an audit action; unknown actions (older entries) are shown as stored. */
export function auditActionLabel(action: string): string {
  return (AUDIT_ACTIONS as readonly string[]).includes(action) ? AUDIT_ACTION_LABELS[action as AuditAction] : action;
}

/** Labels for the keys that moderation writes into `AuditLog.details`. */
export const AUDIT_DETAIL_LABELS: Record<string, string> = {
  reason: "Begründung",
  resolution: "Notiz",
  title: "Inhalt",
  targetType: "Art",
  targetId: "Kennung",
  from: "Vorher",
  to: "Nachher",
  previousVisibility: "Sichtbarkeit vorher",
  authorId: "Mitglied",
  reportId: "Meldung",
};
