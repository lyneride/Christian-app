import type { Metadata } from "next";
import Link from "next/link";
import { ScrollText } from "lucide-react";
import { AuditRow } from "@/components/admin/audit-row";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { requireRole } from "@/lib/auth/dal";
import { listAudit } from "@/lib/moderation/queries";
import { parsePage } from "@/lib/pagination";
import { pluralize } from "@/lib/utils";

export const metadata: Metadata = { title: "Protokoll" };

const PER_PAGE = 30;

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function AuditPage(props: PageProps<"/admin/protokoll">) {
  await requireRole("MODERATOR", "/admin/protokoll");
  const sp = await props.searchParams;
  const actorId = (first(sp.akteur) ?? "").trim().slice(0, 64) || undefined;
  const page = parsePage(sp.seite, PER_PAGE);

  const { items, total } = await listAudit({ page, actorId });
  const actorName = actorId ? (items.find((e) => e.actor?.id === actorId)?.actor?.name ?? null) : null;

  return (
    <section aria-labelledby="audit-heading">
      <h1 id="audit-heading" className="text-2xl font-semibold tracking-tight">
        Protokoll
      </h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Jede Moderationsentscheidung mit Zeit, Person und Begründung. Einträge werden nicht gelöscht.
      </p>

      {actorId ? (
        <p className="mt-4 text-sm">
          Gefiltert nach {actorName ? <strong>{actorName}</strong> : "einem Mitglied"} ·{" "}
          <Link href="/admin/protokoll" className="text-primary underline-offset-4 hover:underline">
            Filter aufheben
          </Link>
        </p>
      ) : null}

      <p className="text-muted-foreground mt-4 text-sm">{pluralize(total, "Eintrag", "Einträge")}</p>

      {items.length === 0 ? (
        <EmptyState
          icon={<ScrollText />}
          title="Noch keine Einträge"
          description="Sobald die Moderation eine Entscheidung trifft, erscheint sie hier."
          className="mt-4"
        />
      ) : (
        <div className="rounded-card border-border bg-surface shadow-soft mt-3 overflow-x-auto border">
          <table className="w-full min-w-[48rem] text-left">
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
              {items.map((entry) => (
                <AuditRow key={entry.id} entry={entry} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        basePath="/admin/protokoll"
        params={{ akteur: actorId }}
        page={page.page}
        perPage={page.perPage}
        total={total}
      />
    </section>
  );
}
