import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { PlanCard, planHref } from "@/components/plans/plan-card";
import { SubscribeButton } from "@/components/plans/plan-buttons";
import { ProgressBar } from "@/components/plans/progress-bar";
import { TodayReadings } from "@/components/plans/today-readings";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth/dal";
import { planStatus } from "@/lib/plans/progress";
import { listMySubscriptions } from "@/lib/plans/queries";
import { listMyPlanGroups } from "@/lib/plans/shared";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Meine Lesepläne" };

export default async function MyPlansPage() {
  const user = await requireUser("/leseplaene/meine");
  const [all, shared] = await Promise.all([listMySubscriptions(user.id, "all"), listMyPlanGroups(user.id)]);
  const active = all.filter((s) => planStatus(s) === "active");
  const finished = all.filter((s) => planStatus(s) === "finished");
  const archived = all.filter((s) => planStatus(s) === "archived");

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 md:py-14">
      <Link href="/leseplaene" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Alle Lesepläne
      </Link>
      <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">Deine Lesepläne</h1>
      <p className="mt-3 max-w-prose text-lg text-muted-foreground">
        Hier siehst du, was als Nächstes dran ist. Lies, wenn es passt – der Plan wartet.
      </p>

      <section aria-labelledby="gemeinsam" className="mt-10">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="gemeinsam" className="text-2xl font-semibold tracking-tight">
            Gemeinsam lesen
          </h2>
          <Link href="/freunde" className="text-sm text-primary underline-offset-4 hover:underline">
            Freunde verwalten
          </Link>
        </div>
        {shared.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Starte einen Plan zusammen mit Freunden oder einer Gruppe – auf jeder Planseite über „Gemeinsam lesen“. Ihr seht dann
            gegenseitig Fortschritt, Markierungen und geteilte Notizen.
          </p>
        ) : (
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {shared.map((g) => (
              <li key={g.id} className="rounded-card border border-border bg-surface p-4 shadow-soft">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/leseplaene/gemeinsam/${g.id}`} className="font-medium hover:underline">
                    {g.name}
                  </Link>
                  {g.status === "PENDING" ? <Badge variant="accent">Einladung</Badge> : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {g.plan.title} · {g.memberCount} {g.memberCount === 1 ? "Person" : "Personen"} · von {g.createdBy.name}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="heute-dran" className="mt-10">
        <h2 id="heute-dran" className="text-2xl font-semibold tracking-tight">
          Heute dran
        </h2>
        <div className="mt-4">
          <TodayReadings
            userId={user.id}
            translation={user.preferredTranslation}
            fallback={
              <EmptyState
                icon={<Compass />}
                title={active.length > 0 ? "Gerade ist nichts offen." : "Du hast noch keinen Plan gestartet."}
                description={
                  active.length > 0
                    ? "Alle deine gestarteten Pläne sind gelesen. Wenn du magst, starte einen neuen."
                    : "Such dir einen Plan aus – kurz oder lang, in deinem Tempo."
                }
                action={
                  <Link href="/leseplaene" className={buttonClasses("primary", "md")}>
                    Pläne entdecken
                  </Link>
                }
              />
            }
          />
        </div>
      </section>

      {finished.length > 0 ? (
        <section aria-labelledby="abgeschlossen" className="mt-12">
          <h2 id="abgeschlossen" className="text-2xl font-semibold tracking-tight">
            Abgeschlossen
          </h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {finished.map((sub) => (
              <li key={sub.id}>
                <PlanCard
                  plan={sub.plan}
                  progress={{ completed: sub.completedDays.length, nextDay: null, status: "finished" }}
                  className="h-full"
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {archived.length > 0 ? (
        <section aria-labelledby="pausiert" className="mt-12">
          <h2 id="pausiert" className="text-2xl font-semibold tracking-tight">
            Pausiert
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Dein Fortschritt bleibt erhalten. Du kannst jederzeit weitermachen.</p>
          <ul className="mt-4 divide-y divide-border rounded-card border border-border bg-surface">
            {archived.map((sub) => (
              <li key={sub.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1 space-y-2">
                  <h3 className="font-semibold">
                    <Link href={planHref(sub.plan)} className="hover:text-primary">
                      {sub.plan.title}
                    </Link>
                  </h3>
                  <ProgressBar value={sub.completedDays.length} max={sub.plan.dayCount} label={`Fortschritt: ${sub.plan.title}`} size="sm" className="max-w-xs" />
                  <p className="text-sm text-muted-foreground">
                    {sub.completedDays.length} von {sub.plan.dayCount} Tagen gelesen
                  </p>
                </div>
                <SubscribeButton planId={sub.plan.id} label="Wieder aufnehmen" size="sm" className="shrink-0" />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
