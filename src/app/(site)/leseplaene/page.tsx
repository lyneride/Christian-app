import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass, Plus } from "lucide-react";
import { PlanCard } from "@/components/plans/plan-card";
import { buttonClasses } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/dal";
import { planStatus } from "@/lib/plans/progress";
import { listMySubscriptions, listPlans, type MySubscription } from "@/lib/plans/queries";

export const metadata: Metadata = {
  title: "Lesepläne",
  description:
    "Bibellesepläne in deinem Tempo: die ganze Bibel in 3, 6 oder 12 Monaten, Themen wie Agape oder Gebet, Bücherstudien mit kostenlosem Kommentar – ohne Druck, ohne Streak.",
};

function byProgress(a: MySubscription, b: MySubscription): number {
  const fa = a.completedAt ? 1 : 0;
  const fb = b.completedAt ? 1 : 0;
  if (fa !== fb) return fa - fb;
  return b.startedAt.getTime() - a.startedAt.getTime();
}

export default async function PlansPage() {
  const user = await getCurrentUser();
  const [groups, mine] = await Promise.all([
    listPlans(user?.id),
    user ? listMySubscriptions(user.id, "active") : Promise.resolve<MySubscription[]>([]),
  ]);
  const own = [...mine].sort(byProgress);
  const subscribedIds = new Set(own.map((s) => s.planId));

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-prose">
          <h1 className="text-[30px] leading-tight sm:text-4xl">Lesepläne</h1>
          <p className="mt-1.5 text-[15px] text-muted-foreground sm:text-base">
            Ein Plan hilft dir, dranzubleiben – in deinem Tempo. Kein Tag geht verloren: Der nächste Abschnitt wartet einfach,
            bis du wieder Zeit hast.
          </p>
        </div>
        <Link href={user ? "/leseplaene/neu" : "/anmelden?next=%2Fleseplaene%2Fneu"} className={buttonClasses("primary", "lg")}>
          <Plus aria-hidden="true" /> Eigenen Plan erstellen
        </Link>
      </header>

      {groups.length > 1 ? (
        <nav aria-label="Kategorien" className="-mx-4 mt-6 overflow-x-auto px-4 scrollbar-none sm:mx-0 sm:px-0">
          <ul className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
            {groups.map((group) => (
              <li key={group.category}>
                <a
                  href={`#kategorie-${group.category}`}
                  className="inline-flex h-10 items-center gap-1.5 rounded-full border-2 border-border bg-surface px-4 font-display text-sm font-extrabold whitespace-nowrap transition hover:border-area-bibel hover:bg-area-bibel-soft"
                >
                  {group.label}
                  <span className="text-xs font-bold text-muted-foreground">{group.plans.length}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      {user && own.length > 0 ? (
        <section aria-labelledby="deine-plaene" className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 id="deine-plaene" className="text-2xl font-semibold tracking-tight">
              Deine Pläne
            </h2>
            <Link href="/leseplaene/meine" className={buttonClasses("link", "sm")}>
              Heute dran
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {own.map((sub) => (
              <li key={sub.id}>
                <PlanCard
                  plan={sub.plan}
                  progress={{ completed: sub.completedDays.length, nextDay: sub.nextDay, status: planStatus(sub) }}
                  className="h-full"
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {groups.length === 0 ? (
        <p className="mt-12 flex items-center gap-2 text-muted-foreground">
          <Compass className="size-5" aria-hidden="true" />
          Es sind noch keine Lesepläne eingerichtet.
        </p>
      ) : (
        groups.map((group) => (
          <section key={group.category} aria-labelledby={`kategorie-${group.category}`} className="mt-12 scroll-mt-24">
            <h2 id={`kategorie-${group.category}`} className="text-2xl font-extrabold">
              {group.label}
            </h2>
            {group.category === "studie" ? (
              <p className="mt-1 max-w-prose text-sm text-muted-foreground">
                Ein Bibelbuch Kapitel für Kapitel – dazu ein kostenloser Kommentar zum Mitlesen, online oder als PDF.
              </p>
            ) : null}
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.plans.map((plan) => {
                const sub = subscribedIds.has(plan.id) ? own.find((s) => s.planId === plan.id) : undefined;
                return (
                  <li key={plan.id}>
                    <PlanCard
                      plan={plan}
                      progress={sub ? { completed: sub.completedDays.length, nextDay: sub.nextDay, status: planStatus(sub) } : undefined}
                      className="h-full"
                    />
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      )}

      {!user ? (
        <p className="mt-12 text-sm text-muted-foreground">
          <Link href="/anmelden?next=%2Fleseplaene" className="text-primary underline-offset-4 hover:underline">
            Melde dich an
          </Link>
          , um einen Plan zu starten und deinen Fortschritt zu speichern.
        </p>
      ) : null}
    </main>
  );
}
