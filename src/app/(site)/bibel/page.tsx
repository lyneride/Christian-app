import type { Metadata } from "next";
import Form from "next/form";
import { Search } from "lucide-react";
import { BookGrid } from "@/components/bible/book-grid";
import { RecentChapters } from "@/components/bible/recent-chapters";
import { TranslationSelect } from "@/components/bible/translation-select";
import { VerseOfTheDay } from "@/components/bible/verse-of-the-day";
import { buttonClasses } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 md:py-14">
      <section className="grid gap-8 md:grid-cols-[1.1fr_1fr] md:items-start md:gap-12">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Die Bibel</h1>
          <p className="text-muted-foreground mt-4 max-w-prose text-lg">
            Lies in Ruhe, vergleiche Übersetzungen und entdecke Querverweise. Ohne Werbung, ohne Ablenkung.
          </p>

          <Form action="/bibel/suche" className="mt-8 flex flex-col gap-2 sm:flex-row" role="search">
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

          <div className="mt-6 flex flex-wrap items-end gap-4">
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

      <RecentChapters translations={shortNames} className="mt-12" />

      <BookGrid language={translation.language} tParam={tParam} className="mt-14" />
    </main>
  );
}
