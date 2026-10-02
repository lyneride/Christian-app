import "server-only";
import { prisma } from "@/lib/db";

/**
 * Audit trail for moderation. Every decision taken in "/admin" is written
 * here so it can be reviewed later ("Protokoll").
 */

/** `AuditLog.details` is capped so one entry can never grow unbounded. */
export const AUDIT_DETAILS_MAX = 2000;

export type AuditDetails = Record<string, string | number | boolean | null | undefined>;

export interface AuditInput {
  actorId: string | null;
  /** Dotted action name, e.g. "content.remove" (labels live in `@/lib/validation/admin`). */
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  details?: AuditDetails | string | null;
}

/** JSON string of at most AUDIT_DETAILS_MAX characters, or null when there is nothing to store. */
export function serializeAuditDetails(details: AuditInput["details"]): string | null {
  if (details === null || details === undefined) return null;
  const json =
    typeof details === "string"
      ? details
      : JSON.stringify(
          Object.fromEntries(Object.entries(details).filter(([, v]) => v !== undefined && v !== null && v !== "")),
        );
  if (json === "{}" || json === "") return null;
  if (json.length <= AUDIT_DETAILS_MAX) return json;
  // Truncated JSON would not parse any more; store a plain-text marker instead.
  return json.slice(0, AUDIT_DETAILS_MAX - 2) + " …";
}

export async function logAudit(input: AuditInput) {
  return prisma.auditLog.create({
    data: {
      actorId: input.actorId,
      action: input.action,
      targetType: input.targetType ?? null,
      targetId: input.targetId ?? null,
      details: serializeAuditDetails(input.details),
    },
    select: { id: true },
  });
}

/** Parses stored details back into key/value pairs (null for free text or unparsable entries). */
export function parseAuditDetails(details: string | null): Record<string, unknown> | null {
  if (!details) return null;
  try {
    const parsed: unknown = JSON.parse(details);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}
