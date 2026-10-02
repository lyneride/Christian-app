import type { Metadata } from "next";
import Link from "next/link";
import { Brain, Play, X } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { listTranslations, resolveTranslationId } from "@/lib/bible/data";
import { parseVerseKey, referencePath } from "@/lib/bible/reference";
import { toTranslationOption } from "@/lib/bible/ui";
import { removeMemoryVerse } from "@/lib/study/actions";
import { dueSummary } from "@/lib/study/format";
import { BOX_INTERVALS_DAYS, MAX_BOX, boxLabel, dueCount, isDue, nextReviewLabel } from "@/lib/study/leitner";
import { listMemoryVerses } from "@/lib/study/queries";
import { ActionButton } from "@/components/study/action-button";
import { MemoryAddForm } from "@/components/study/memory-add-form";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Merken",
  description: "Bibelverse auswendig lernen – in deinem Tempo, mit dem Karteikasten-Prinzip.",
  robots: { index: false, follow: false },
};

export default async function MerkenPage() {
  const user = await requireUser("/merken");
  const now = new Date();
  const [verses, translations, defaultTranslation] = await Promise.all([
    listMemoryVerses(user.id),
    listTranslations(),
    resolveTranslationId(user.preferredTranslation),
  ]);
  const due = dueCount(verses, now);
  const shortNames = Object.fromEntries(translations.map((t) => [t.id, t.shortName]));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 md:py-14">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Merken</h1>
        <p className="text-muted-foreground mt-3 max-w-prose text-lg">
          Verse, die du auswendig lernen möchtest – ohne Druck, in deinem Tempo. Gewusste Verse kommen seltener dran,
          schwierige öfter.
        </p>
      </header>

      {verses.length > 0 ? (
        <section className="rounded-card bg-primary-soft mt-8 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between" aria-labelledby="faellig">
          <div>
            <h2 id="faellig" className="text-primary text-lg font-semibold">
              {dueSummary(due)}
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {due > 0 ? "Ein paar Minuten reichen. Fang einfach an." : "Deine Verse ruhen, bis sie wieder fällig sind."}
            </p>
          </div>
          {due > 0 ? (
            <Link href="/merken/ueben" className={buttonClasses("primary", "lg", "shrink-0")}>
              <Play aria-hidden="true" />
              Jetzt üben
            </Link>
          ) : (
            <Link href="/merken/ueben?alle=1" className={buttonClasses("outline", "md", "shrink-0")}>
              Trotzdem üben
            </Link>
          )}
        </section>
      ) : null}

      <section className="rounded-card border-border bg-surface shadow-soft mt-8 border p-5" aria-labelledby="hinzufuegen">
        <h2 id="hinzufuegen" className="text-lg font-semibold tracking-tight">
          Vers hinzufügen
        </h2>
        <div className="mt-4">
          <MemoryAddForm translations={translations.map(toTranslationOption)} defaultTranslation={defaultTranslation} />
        </div>
      </section>

      <section className="mt-10" aria-labelledby="lernliste">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="lernliste" className="text-lg font-semibold tracking-tight">
            Deine Lernliste
          </h2>
          {verses.length > 0 ? (
            <p className="text-muted-foreground text-sm">
              {verses.length} {verses.length === 1 ? "Vers" : "Verse"}
            </p>
          ) : null}
        </div>

        {verses.length === 0 ? (
          <EmptyState
            icon={<Brain />}
            title="Noch keine Verse"
            description="Füge oben einen Vers hinzu, der dich gerade trägt – zum Beispiel Johannes 3,16 oder Psalm 23,1."
            className="mt-4"
          />
        ) : (
          <ul className="mt-4 space-y-3">
            {verses.map((v) => {
              const parsed = parseVerseKey(v.verseKey);
              const href = parsed
                ? referencePath(
                    { book: parsed.book, chapter: parsed.chapter, verseStart: parsed.verse, verseEnd: v.verseEnd ?? undefined },
                    v.translation,
                  )
                : "/bibel";
              const dueNow = isDue(v, now);
              return (
                <li key={v.id} className="rounded-card border-border bg-surface shadow-soft flex items-start gap-3 border p-4 sm:p-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={href} className="text-primary font-medium underline-offset-4 hover:underline">
                        {v.reference}
                      </Link>
                      <span className="text-muted-foreground text-xs">{shortNames[v.translation] ?? v.translation}</span>
                      <Badge variant={v.box >= MAX_BOX ? "success" : "primary"}>{boxLabel(v.box)}</Badge>
                    </div>
                    <p className="scripture text-foreground/90 mt-2 text-base leading-relaxed">{v.text}</p>
                    <p className={cn("mt-2 text-xs", dueNow ? "text-primary font-medium" : "text-muted-foreground")}>
                      {dueNow ? "Heute dran" : `Nächste Wiederholung ${nextReviewLabel(v.nextReviewAt, now)}`}
                      {v.reviewCount > 0 ? ` · ${v.correctCount} von ${v.reviewCount} Mal gewusst` : ""}
                    </p>
                  </div>
                  <ActionButton
                    action={removeMemoryVerse.bind(null, v.id)}
                    confirmText={`${v.reference} aus der Lernliste entfernen?`}
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0"
                    aria-label={`${v.reference} entfernen`}
                    title="Aus der Lernliste entfernen"
                  >
                    <X aria-hidden="true" />
                  </ActionButton>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="text-muted-foreground mt-10 text-sm" aria-labelledby="so-gehts">
        <h2 id="so-gehts" className="text-foreground text-sm font-semibold">
          So funktioniert es
        </h2>
        <p className="mt-1 max-w-prose">
          Jeder Vers startet auf Stufe 1. Weißt du ihn beim Üben, steigt er eine Stufe – und kommt erst nach{" "}
          {BOX_INTERVALS_DAYS.map((d, i) => (i === 0 ? `${d} Tag` : i === BOX_INTERVALS_DAYS.length - 1 ? ` oder ${d} Tagen` : `, ${d}`)).join("")} wieder
          dran. Weißt du ihn noch nicht, geht er zurück auf Stufe 1 – ganz ohne Wertung.
        </p>
      </section>
    </main>
  );
}
