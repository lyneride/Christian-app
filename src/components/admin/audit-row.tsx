import Link from "next/link";
import { parseAuditDetails } from "@/lib/moderation/audit";
import { auditTargetHref, type AuditRow as AuditRowData } from "@/lib/moderation/queries";
import { AUDIT_DETAIL_LABELS, auditActionLabel } from "@/lib/validation/admin";
import { formatDateTime } from "@/lib/utils";
import { targetTypeLabel } from "./badges";

const HIDDEN_KEYS = new Set(["href", "authorId", "targetId"]);

/** Key/value list of an audit entry's details (or the raw text for older entries). */
export function AuditDetails({ details }: { details: string | null }) {
  if (!details) return <span className="text-muted-foreground">–</span>;
  const parsed = parseAuditDetails(details);
  if (!parsed) return <span className="break-words whitespace-pre-wrap">{details}</span>;
  const entries = Object.entries(parsed).filter(([k, v]) => !HIDDEN_KEYS.has(k) && v !== null && v !== undefined && v !== "");
  if (entries.length === 0) return <span className="text-muted-foreground">–</span>;
  return (
    <dl className="space-y-0.5">
      {entries.map(([key, value]) => (
        <div key={key} className="flex gap-2">
          <dt className="shrink-0 text-muted-foreground">{AUDIT_DETAIL_LABELS[key] ?? key}:</dt>
          <dd className="min-w-0 break-words">{key === "targetType" ? targetTypeLabel(String(value)) : String(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

function targetLink(entry: AuditRowData): string | null {
  const parsed = parseAuditDetails(entry.details);
  const own = parsed && typeof parsed.href === "string" ? parsed.href : null;
  return own ?? auditTargetHref(entry.targetType, entry.targetId);
}

/** Table row of the audit log. Columns: Zeit · Wer · Aktion · Ziel · Details. */
export function AuditRow({ entry }: { entry: AuditRowData }) {
  const href = targetLink(entry);
  const typeLabel = entry.targetType === "report" ? "Meldung" : entry.targetType ? targetTypeLabel(entry.targetType) : null;
  return (
    <tr className="border-t border-border align-top text-sm">
      <td className="py-3 pr-4 whitespace-nowrap text-muted-foreground">
        <time dateTime={entry.createdAt.toISOString()}>{formatDateTime(entry.createdAt)}</time>
      </td>
      <td className="py-3 pr-4">
        {entry.actor ? (
          <Link href={`/admin/mitglieder/${entry.actor.id}`} className="font-medium underline-offset-4 hover:underline">
            {entry.actor.name}
          </Link>
        ) : (
          <span className="text-muted-foreground">System</span>
        )}
      </td>
      <td className="py-3 pr-4 font-medium">{auditActionLabel(entry.action)}</td>
      <td className="py-3 pr-4">
        {typeLabel ? (
          href ? (
            <Link href={href} className="text-primary underline-offset-4 hover:underline">
              {typeLabel}
            </Link>
          ) : (
            <span>{typeLabel}</span>
          )
        ) : (
          <span className="text-muted-foreground">–</span>
        )}
      </td>
      <td className="py-3 text-sm">
        <AuditDetails details={entry.details} />
      </td>
    </tr>
  );
}
