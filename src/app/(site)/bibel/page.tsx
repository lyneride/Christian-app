import type { Metadata } from "next";
import Form from "next/form";
import { Search } from "lucide-react";
import { BookGrid } from "@/components/bible/book-grid";
import { RecentChapters } from "@/components/bible/recent-chapters";
import { TranslationSelect } from "@/components/bible/translation-select";
import { VerseOfTheDay } from "@/components/bible/verse-of-the-day";
import { buttonClasses } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Rebi } from "@/components/rebi/rebi";
import { DEFAULT_TRANSLATION, listTranslations, resolveTranslationId } from "@/lib/bible/data";
import { toTranslationOption } from "@/lib/bible/ui";

export const metadata: Metadata = {
  title: "Bibel",
  description:
    "Die Bibel lesen in Luther 1912, Elberfelder 1905, Schlachter 1951, Luther 1545, BSB und KJV – mit Tagesvers, Volltextsuche, Parallelansicht und Querverweisen.",
};

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function BiblePage(props: PageProps<"/bibel">) {
  const sp = await props.searchParams;
  const t = await resolveTranslationId(first(sp.t));
  const translations = await listTranslations();
  const translation = translations.find((x) => x.id === t) ?? translations[0];
  const tParam = t === DEFAULT_TRANSLATION ? undefined : t;
  const shortNames = Object.fromEntries(translations.map((x) => [x.id, x.shortName]));

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-8">
      <section className="grid gap-8 md:grid-cols-[1.1fr_1fr] md:items-start md:gap-12">
        <div>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-[30px] leading-tight sm:text-4xl">Die Bibel</h1>
              <p className="mt-1.5 max-w-prose text-[15px] text-muted-foreground sm:text-base">
                Lies in Ruhe, vergleiche Übersetzungen und entdecke Querverweise. Ohne Werbung, ohne Ablenkung.
              </p>
            </div>
            <Rebi pose="read" size={96} className="-my-2" priority />
          </div>

          <Form action="/bibel/suche" className="mt-5 flex flex-col gap-2 sm:flex-row" role="search" data-tour="bible-search">
            <label htmlFor="bibel-suche" className="sr-only">
              Bibel durchsuchen
            </label>
            <Input
              id="bibel-suche"
              name="q"
              type="search"
              placeholder="Wort, Satz oder Stelle, z. B. „fürchte dich nicht“ oder Joh 3,16"
              autoComplete="off"
              className="flex-1"
            />
            {tParam ? <input type="hidden" name="t" value={tParam} /> : null}
            <button type="submit" className={buttonClasses("primary", "md", "sm:w-auto")}>
              <Search aria-hidden="true" />
              Suchen
            </button>
          </Form>

          <div className="mt-5 flex flex-wrap items-end gap-4" data-tour="bible-translation">
            <TranslationSelect
              id="bibel-uebersetzung"
              label="Übersetzung"
              translations={translations.map(toTranslationOption)}
              value={t}
              param="t"
              pathname="/bibel"
              query={{}}
              className="w-56"
            />
            <p className="text-muted-foreground pb-2 text-sm">
              {translation.name} · {translation.year}
            </p>
          </div>
        </div>

        <VerseOfTheDay translationId={t} tParam={tParam} />
      </section>

      <RecentChapters translations={shortNames} className="mt-8" />

      <div data-tour="bible-books" className="mt-8">
        <BookGrid language={translation.language} tParam={tParam} />
      </div>
    </main>
  );
}
