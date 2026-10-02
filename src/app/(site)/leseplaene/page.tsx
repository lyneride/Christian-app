import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import { PlanCard } from "@/components/plans/plan-card";
import { buttonClasses } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/dal";
import { planStatus } from "@/lib/plans/progress";
import { listMySubscriptions, listPlans, type MySubscription } from "@/lib/plans/queries";

export const metadata: Metadata = {
  title: "Lesepläne",
  description:
    "Bibellesepläne in deinem Tempo: die ganze Bibel in einem Jahr, das Neue Testament in 90 Tagen, einzelne Bücher oder kurze Einstiegspläne – ohne Druck, ohne Streak.",
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
    listPlans(),
    user ? listMySubscriptions(user.id, "active") : Promise.resolve<MySubscription[]>([]),
  ]);
  const own = [...mine].sort(byProgress);
  const subscribedIds = new Set(own.map((s) => s.planId));

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 md:py-14">
      <header className="max-w-prose">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Lesepläne</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Ein Plan hilft dir, dranzubleiben – in deinem Tempo. Kein Tag geht verloren: Der nächste Abschnitt wartet einfach,
          bis du wieder Zeit hast.
        </p>
      </header>

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
          <section key={group.category} aria-labelledby={`kategorie-${group.category}`} className="mt-12">
            <h2 id={`kategorie-${group.category}`} className="text-2xl font-semibold tracking-tight">
              {group.label}
            </h2>
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
