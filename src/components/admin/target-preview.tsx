import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ReportTarget } from "@/lib/moderation/queries";
import { cn, formatDateTime } from "@/lib/utils";
import { TargetTypeBadge, targetTypeLabel } from "./badges";

export interface TargetPreviewProps {
  target: ReportTarget | null;
  targetType: string;
  targetId: string;
  /** Shorter excerpt and no timestamps (list rows). */
  compact?: boolean;
  className?: string;
}

/** Normalised preview of the content a report points at. */
export function TargetPreview({ target, targetType, targetId, compact = false, className }: TargetPreviewProps) {
  if (!target) {
    return (
      <div className={cn("border-border rounded-xl border border-dashed p-4 text-sm", className)}>
        <div className="flex flex-wrap items-center gap-2">
          <TargetTypeBadge type={targetType} />
          <Badge variant="default">Nicht mehr vorhanden</Badge>
        </div>
        <p className="text-muted-foreground mt-2">
          {targetTypeLabel(targetType)} mit der Kennung <code className="text-xs">{targetId}</code> existiert nicht
          mehr.
        </p>
      </div>
    );
  }

  const linkable = target.href && !target.deleted;
  return (
    <div className={cn("border-border bg-surface-muted/40 rounded-xl border p-4", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <TargetTypeBadge type={target.kind} />
        {target.deleted ? <Badge variant="danger">{target.kind === "group" ? "Verborgen" : "Entfernt"}</Badge> : null}
        {!compact && target.createdAt ? (
          <span className="text-muted-foreground text-xs">erstellt am {formatDateTime(target.createdAt)}</span>
        ) : null}
      </div>

      <p className={cn("mt-2 font-semibold", target.deleted && "decoration-muted-foreground/60 line-through")}>
        {linkable ? (
          <Link
            href={target.href as string}
            className="text-primary inline-flex items-center gap-1 underline-offset-4 hover:underline"
          >
            {target.title}
            <ExternalLink className="size-3.5" aria-hidden="true" />
          </Link>
        ) : (
          target.title
        )}
      </p>

      {target.excerpt ? (
        <p className={cn("text-muted-foreground mt-1 text-sm", compact ? "line-clamp-2" : "whitespace-pre-wrap")}>
          {target.excerpt}
        </p>
      ) : null}

      {target.note ? <p className="text-warning mt-2 text-xs">{target.note}</p> : null}

      {target.authorId ? (
        <p className="text-muted-foreground mt-3 text-xs">
          {target.kind === "user" ? "Mitglied: " : target.kind === "message" ? "Gesendet von " : "Von "}
          <Link
            href={`/admin/mitglieder/${target.authorId}`}
            className="text-foreground font-medium underline-offset-4 hover:underline"
          >
            {target.authorName}
          </Link>{" "}
          <span>@{target.authorUsername}</span>
          {target.authorStatus === "SUSPENDED" ? <span className="text-danger ml-2">(gesperrt)</span> : null}
          {target.authorStatus === "DELETED" ? <span className="ml-2">(Konto gelöscht)</span> : null}
        </p>
      ) : null}
    </div>
  );
}
