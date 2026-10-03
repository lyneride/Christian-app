import Link from "next/link";
import { BookOpenCheck, Plus } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { listGroupPlanGroups } from "@/lib/plans/shared";
import { pluralize } from "@/lib/utils";

/** "Gemeinsam lesen" box on a group page: running shared plans plus the button to start one. */
export async function GroupReadingPlans({ groupId, isMember }: { groupId: string; isMember: boolean }) {
  const plans = await listGroupPlanGroups(groupId);
  return (
    <section aria-labelledby="gruppe-leseplaene" className="space-y-3">
      <h2 id="gruppe-leseplaene" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
        <BookOpenCheck className="size-5 text-primary" aria-hidden="true" /> Gemeinsam lesen
      </h2>
      <div className="rounded-card border border-border bg-surface p-4">
        {plans.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {isMember ? "Noch kein Leseplan. Startet einen – zum Beispiel ein Evangelium in drei Wochen." : "Diese Gruppe liest noch keinen Plan gemeinsam."}
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {plans.map((p) => (
              <li key={p.id} className="py-3 first:pt-0 last:pb-0">
                <Link href={`/leseplaene/gemeinsam/${p.id}`} className="font-medium hover:underline">
                  {p.name}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {p.plan.title} · {p.plan.dayCount} Tage · {pluralize(p._count.members, "Person liest mit", "Personen lesen mit")}
                </p>
              </li>
            ))}
          </ul>
        )}
        {isMember ? (
          <Link href={`/leseplaene/neu?gruppe=${groupId}`} className={buttonClasses("outline", "sm", "mt-3")}>
            <Plus aria-hidden="true" /> Leseplan starten
          </Link>
        ) : null}
      </div>
    </section>
  );
}
