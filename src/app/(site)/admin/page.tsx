import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarDays,
  Flag,
  HandHeart,
  MessageSquareText,
  ShieldCheck,
  UserPlus,
  UserX,
  Users,
  UsersRound,
} from "lucide-react";
import { AuditRow } from "@/components/admin/audit-row";
import { ReportRow } from "@/components/admin/report-row";
import { StatCard } from "@/components/admin/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { requireRole } from "@/lib/auth/dal";
import { dashboardStats, listAudit, listReports, loadReportTargets, reportTargetKey } from "@/lib/moderation/queries";
import { parsePage } from "@/lib/pagination";

export const metadata: Metadata = { title: "Übersicht" };

export default async function AdminOverviewPage() {
  await requireRole("MODERATOR", "/admin");
  const [stats, reports, audit] = await Promise.all([
    dashboardStats(),
    listReports({ status: "OPEN", page: parsePage("1", 5) }),
    listAudit({ page: parsePage("1", 8) }),
  ]);
  const targets = await loadReportTargets(reports.items);

  return (
    <div className="space-y-12">
      <section aria-labelledby="stats-heading">
        <h1 id="stats-heading" className="text-2xl font-semibold tracking-tight">
          Übersicht
        </h1>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <StatCard
            label="Offene Meldungen"
            value={stats.openReports}
            hint={`${stats.resolvedLast30Days} in den letzten 30 Tagen bearbeitet`}
            icon={<Flag />}
            href="/admin/meldungen"
            tone={stats.openReports > 0 ? "warning" : "default"}
          />
          <StatCard
            label="Mitglieder"
            value={stats.members.total}
            hint={`${stats.members.active} aktiv`}
            icon={<Users />}
            href="/admin/mitglieder"
          />
          <StatCard
            label="Neu in 7 Tagen"
            value={stats.members.newLast7Days}
            icon={<UserPlus />}
            href="/admin/mitglieder"
          />
          <StatCard
            label="Gesperrt"
            value={stats.members.suspended}
            icon={<UserX />}
            href="/admin/mitglieder?status=SUSPENDED"
          />
          <StatCard label="Beiträge" value={stats.posts} icon={<MessageSquareText />} />
          <StatCard label="Gebetsanliegen" value={stats.prayers} icon={<HandHeart />} />
          <StatCard label="Gruppen" value={stats.groups} icon={<UsersRound />} />
          <StatCard label="Veranstaltungen" value={stats.events} icon={<CalendarDays />} />
        </div>
      </section>

      <section aria-labelledby="open-reports-heading">
        <div className="flex items-end justify-between gap-4">
          <h2 id="open-reports-heading" className="text-lg font-semibold tracking-tight">
            Offene Meldungen
          </h2>
          <Link href="/admin/meldungen" className="text-primary text-sm font-medium underline-offset-4 hover:underline">
            Alle Meldungen
          </Link>
        </div>
        {reports.items.length === 0 ? (
          <EmptyState
            icon={<ShieldCheck />}
            title="Nichts offen"
            description="Zurzeit wartet keine Meldung auf eine Entscheidung."
            className="mt-4"
          />
        ) : (
          <ul className="mt-4 space-y-3">
            {reports.items.map((report) => (
              <ReportRow key={report.id} report={report} target={targets.get(reportTargetKey(report)) ?? null} />
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="audit-heading">
        <div className="flex items-end justify-between gap-4">
          <h2 id="audit-heading" className="text-lg font-semibold tracking-tight">
            Zuletzt im Protokoll
          </h2>
          <Link href="/admin/protokoll" className="text-primary text-sm font-medium underline-offset-4 hover:underline">
            Ganzes Protokoll
          </Link>
        </div>
        {audit.items.length === 0 ? (
          <p className="text-muted-foreground mt-4 text-sm">Noch keine Einträge.</p>
        ) : (
          <div className="rounded-card border-border bg-surface shadow-soft mt-4 overflow-x-auto border">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="text-muted-foreground text-xs uppercase">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Zeit
                  </th>
                  <th scope="col" className="py-3 pr-4 font-medium">
                    Wer
                  </th>
                  <th scope="col" className="py-3 pr-4 font-medium">
                    Aktion
                  </th>
                  <th scope="col" className="py-3 pr-4 font-medium">
                    Ziel
                  </th>
                  <th scope="col" className="py-3 pr-4 font-medium">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="[&_td:first-child]:pl-4 [&_td:last-child]:pr-4">
                {audit.items.map((entry) => (
                  <AuditRow key={entry.id} entry={entry} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
