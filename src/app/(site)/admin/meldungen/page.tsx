import type { Metadata } from "next";
import Link from "next/link";
import { Inbox } from "lucide-react";
import { ReportRow } from "@/components/admin/report-row";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { requireRole } from "@/lib/auth/dal";
import { countReportsByStatus, listReports, loadReportTargets, reportTargetKey } from "@/lib/moderation/queries";
import { parsePage } from "@/lib/pagination";
import { cn, pluralize } from "@/lib/utils";
import { REPORT_STATUSES, REPORT_STATUS_LABELS, parseReportStatus } from "@/lib/validation/admin";

export const metadata: Metadata = { title: "Meldungen" };

const EMPTY: Record<(typeof REPORT_STATUSES)[number], { title: string; description: string }> = {
  OPEN: { title: "Keine offenen Meldungen", description: "Alles ist bearbeitet. Danke fürs Hinschauen." },
  RESOLVED: { title: "Noch nichts erledigt", description: "Erledigte Meldungen erscheinen hier." },
  DISMISSED: { title: "Noch nichts abgewiesen", description: "Abgewiesene Meldungen erscheinen hier." },
};

export default async function ReportsPage(props: PageProps<"/admin/meldungen">) {
  await requireRole("MODERATOR", "/admin/meldungen");
  const sp = await props.searchParams;
  const status = parseReportStatus(sp.status);
  const page = parsePage(sp.seite);

  const [{ items, total }, counts] = await Promise.all([listReports({ status, page }), countReportsByStatus()]);
  const targets = await loadReportTargets(items);

  return (
    <section aria-labelledby="reports-heading">
      <h1 id="reports-heading" className="text-2xl font-semibold tracking-tight">
        Meldungen
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Jede Meldung wird geprüft. Entferne nur, was gegen die Regeln verstößt, und begründe jede Entscheidung.
      </p>

      <nav aria-label="Status" className="mt-6 flex flex-wrap gap-1 border-b border-border">
        {REPORT_STATUSES.map((s) => {
          const active = s === status;
          return (
            <Link
              key={s}
              href={s === "OPEN" ? "/admin/meldungen" : `/admin/meldungen?status=${s}`}
              aria-current={active ? "page" : undefined}
              className={cn(
                "-mb-px inline-flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {REPORT_STATUS_LABELS[s]}
              <span className="rounded-full bg-surface-muted px-1.5 text-xs tabular-nums text-muted-foreground">{counts[s]}</span>
            </Link>
          );
        })}
      </nav>

      {items.length === 0 ? (
        <EmptyState icon={<Inbox />} title={EMPTY[status].title} description={EMPTY[status].description} className="mt-6" />
      ) : (
        <>
          <p className="mt-4 text-sm text-muted-foreground">{pluralize(total, "Meldung", "Meldungen")}</p>
          <ul className="mt-3 space-y-3">
            {items.map((report) => (
              <ReportRow key={report.id} report={report} target={targets.get(reportTargetKey(report)) ?? null} />
            ))}
          </ul>
        </>
      )}

      <Pagination
        basePath="/admin/meldungen"
        params={{ status: status === "OPEN" ? undefined : status }}
        page={page.page}
        perPage={page.perPage}
        total={total}
      />
    </section>
  );
}
