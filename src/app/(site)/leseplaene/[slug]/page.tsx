import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowDown, ArrowLeft, CalendarDays, Clock, LibraryBig, PartyPopper, Users } from "lucide-react";
import { DayList, dayAnchor } from "@/components/plans/day-list";
import { MarkDayButton } from "@/components/plans/mark-day-button";
import { ArchiveButton, ResetButton, SubscribeButton } from "@/components/plans/plan-buttons";
import { ProgressBar } from "@/components/plans/progress-bar";
import { ReadingLinks } from "@/components/plans/reading-links";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/dal";
import { categoryLabel, encouragement, estimatedFinish, nextOpenDay, percent, planStatus, readingsSummary } from "@/lib/plans/progress";
import { getPlanBySlug, getSubscription, readerContext } from "@/lib/plans/queries";
import { formatDate } from "@/lib/utils";

type Props = PageProps<"/leseplaene/[slug]">;

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  const plan = await getPlanBySlug(slug);
  if (!plan) return { title: "Leseplan" };
  const description = `${plan.description} ${plan.dayCount} Tage, ca. ${plan.minutesPerDay} Minuten pro Tag.`;
  return { title: plan.title, description, openGraph: { title: plan.title, description, type: "article" } };
}

export default async function PlanPage(props: Props) {
  const { slug } = await props.params;
  const plan = await getPlanBySlug(slug);
  if (!plan) notFound();

  const user = await getCurrentUser();
  const [sub, reader] = await Promise.all([
    user ? getSubscription(user.id, plan.id) : Promise.resolve(null),
    readerContext(user?.preferredTranslation),
  ]);

  const status = sub ? planStatus(sub) : null;
  const completed = sub?.completedDays.length ?? 0;
  const currentDay = sub ? nextOpenDay(sub.completedDays, plan.dayCount) : null;
  const today = currentDay !== null ? plan.days.find((d) => d.day === currentDay) : undefined;
  const finish = sub && status === "active" ? estimatedFinish(completed, plan.dayCount, { lastCompletedAt: sub.lastCompletedAt }) : null;
  const interactive = status === "active" || status === "finished";
  const nextPath = `/leseplaene/${plan.slug}`;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 md:py-14">
      <Link href="/leseplaene" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Alle Lesepläne
      </Link>

      <header className="mt-5">
        <Badge variant="outline">{categoryLabel(plan.category)}</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{plan.title}</h1>
        <p className="mt-2">
          <Link href={`/leseplaene/gemeinsam/neu?plan=${plan.slug}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline">
            <Users className="size-4" aria-hidden="true" /> Mit Freunden oder einer Gruppe gemeinsam lesen
          </Link>
        </p>
        <p className="mt-3 max-w-prose text-lg text-muted-foreground">{plan.description}</p>

        <dl className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Dauer</dt>
            <CalendarDays className="size-4" aria-hidden="true" />
            <dd>{plan.dayCount} Tage</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Lesezeit</dt>
            <Clock className="size-4" aria-hidden="true" />
            <dd>ca. {plan.minutesPerDay} Min/Tag</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Umfang</dt>
            <LibraryBig className="size-4" aria-hidden="true" />
            <dd>{readingsSummary(plan.days.map((d) => d.readings))}</dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap items-start gap-3">
          {!user ? (
            <>
              <Link href={`/anmelden?next=${encodeURIComponent(nextPath)}`} className={buttonClasses("primary", "lg")}>
                Anmelden und Plan starten
              </Link>
              <p className="self-center text-sm text-muted-foreground">
                Noch kein Konto?{" "}
                <Link href="/registrieren" className="text-primary underline-offset-4 hover:underline">
                  Jetzt registrieren
                </Link>
              </p>
            </>
          ) : !sub ? (
            <SubscribeButton planId={plan.id} />
          ) : status === "archived" ? (
            <SubscribeButton planId={plan.id} label="Wieder aufnehmen" />
          ) : (
            <>
              <ArchiveButton planId={plan.id} />
              <ResetButton planId={plan.id} />
            </>
          )}
        </div>
      </header>

      {sub && status === "archived" ? (
        <Alert tone="info" title="Dieser Plan ist pausiert." className="mt-8">
          Dein Fortschritt ({completed} von {plan.dayCount} Tagen) bleibt erhalten. Wenn du magst, mach einfach weiter.
        </Alert>
      ) : null}

      {sub && status !== "archived" ? (
        <section aria-labelledby="fortschritt" className="mt-8">
          <Card>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 id="fortschritt" className="text-lg font-semibold tracking-tight">
                  Dein Fortschritt
                </h2>
                <p className="text-sm text-muted-foreground">
                  {Math.min(completed, plan.dayCount)} von {plan.dayCount} Tagen · {percent(completed, plan.dayCount)} %
                </p>
              </div>
              <ProgressBar value={completed} max={plan.dayCount} label={`Fortschritt: ${plan.title}`} />
              <p className="text-sm text-muted-foreground">
                {encouragement(completed, plan.dayCount)}
                {finish ? ` Wenn du ab jetzt täglich liest, bist du am ${formatDate(finish)} fertig.` : ""}
              </p>
            </CardContent>
          </Card>
        </section>
      ) : null}

      {sub && status === "finished" ? (
        <section aria-labelledby="geschafft" className="mt-6">
          <Card className="border-success/30 bg-success-soft/40">
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <PartyPopper className="mt-0.5 size-5 shrink-0 text-success" aria-hidden="true" />
                <div>
                  <h2 id="geschafft" className="text-lg font-semibold tracking-tight">
                    Plan abgeschlossen – stark durchgehalten.
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Fertig seit {formatDate(sub.completedAt!)}. Du kannst den Plan jederzeit noch einmal lesen.
                  </p>
                </div>
              </div>
              <ResetButton planId={plan.id} label="Noch einmal lesen" />
            </CardContent>
          </Card>
        </section>
      ) : null}

      {sub && status === "active" && today ? (
        <section aria-labelledby="heute-dran" className="mt-6">
          <Card className="border-primary/30">
            <CardContent className="space-y-4">
              <div>
                <h2 id="heute-dran" className="text-lg font-semibold tracking-tight">
                  Heute dran: Tag {today.day}
                </h2>
                <p className="text-sm text-muted-foreground">Lies in Ruhe – und markiere den Tag danach als gelesen.</p>
              </div>
              <ReadingLinks readings={today.readings} locale={reader.locale} translation={reader.translation} className="text-lg" />
              <MarkDayButton planId={plan.id} day={today.day} done={false} size="md" />
            </CardContent>
          </Card>
        </section>
      ) : null}

      <section aria-labelledby="alle-tage" className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="alle-tage" className="text-2xl font-semibold tracking-tight">
            Alle Tage
          </h2>
          {currentDay !== null ? (
            <a href={`#${dayAnchor(currentDay)}`} className={buttonClasses("link", "sm")}>
              Zu Tag {currentDay}
              <ArrowDown aria-hidden="true" />
            </a>
          ) : null}
        </div>
        {!user ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Melde dich an, um Tage abzuhaken. Lesen kannst du natürlich auch so – jeder Abschnitt ist verlinkt.
          </p>
        ) : null}
        <DayList
          planId={plan.id}
          days={plan.days}
          completedDays={sub?.completedDays ?? []}
          currentDay={currentDay}
          interactive={interactive}
          locale={reader.locale}
          translation={reader.translation}
          className="mt-4"
        />
      </section>
    </main>
  );
}
