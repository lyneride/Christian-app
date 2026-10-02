import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import type { ReportRow as ReportRowData, ReportTarget } from "@/lib/moderation/queries";
import { formatRelative, truncate } from "@/lib/utils";
import { ReasonBadge, ReportStatusBadge } from "./badges";
import { TargetPreview } from "./target-preview";

export interface ReportRowProps {
  report: ReportRowData;
  target: ReportTarget | null;
}

/** One report in a list: reason, reporter, target preview and a link to the detail page. */
export function ReportRow({ report, target }: ReportRowProps) {
  const href = `/admin/meldungen/${report.id}`;
  return (
    <li className="rounded-card border border-border bg-surface p-4 shadow-soft sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <ReasonBadge reason={report.reason} />
        {report.status !== "OPEN" ? <ReportStatusBadge status={report.status} /> : null}
        <time dateTime={report.createdAt.toISOString()} className="text-xs text-muted-foreground">
          gemeldet {formatRelative(report.createdAt)}
        </time>
        <Link href={href} className="ml-auto inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline">
          Öffnen
          <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      <TargetPreview target={target} targetType={report.targetType} targetId={report.targetId} compact className="mt-3" />

      <div className="mt-3 flex items-start gap-2 text-sm">
        <Avatar name={report.reporter.name} src={report.reporter.avatarUrl} size="xs" className="mt-0.5" />
        <p className="text-muted-foreground">
          <Link href={`/admin/mitglieder/${report.reporter.id}`} className="font-medium text-foreground underline-offset-4 hover:underline">
            {report.reporter.name}
          </Link>{" "}
          <span>@{report.reporter.username}</span>
          {report.details ? <span className="block text-foreground/90">„{truncate(report.details, 160)}“</span> : null}
        </p>
      </div>
    </li>
  );
}
