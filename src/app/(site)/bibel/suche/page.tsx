import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Lightbulb, Search, SearchX } from "lucide-react";
import { SelectField } from "@/components/bible/select-field";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { BOOKS, bookSlug, getBookBySlug, NEW_TESTAMENT, OLD_TESTAMENT } from "@/lib/bible/books";
import { listTranslations, resolveTranslationId, searchVerses, type SearchOptions } from "@/lib/bible/data";
import { formatReference, parseReference, referencePath } from "@/lib/bible/reference";
import { buildSearchUrl, localeFor } from "@/lib/bible/ui";

const PAGE_SIZE = 25;
const MAX_QUERY = 200;

type Props = PageProps<"/bibel/suche">;

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

function readQuery(sp: Record<string, string | string[] | undefined>) {
  const q = (first(sp.q) ?? "").replace(/\s+/g, " ").trim().slice(0, MAX_QUERY);
  const bereichRaw = (first(sp.bereich) ?? "alle").toLowerCase();
  const seiteRaw = Number.parseInt(first(sp.seite) ?? "1", 10);
  const seite = Number.isInteger(seiteRaw) && seiteRaw > 0 ? seiteRaw : 1;
  let bereich = "alle";
  let label = "ganze Bibel";
  const scope: SearchOptions = {};
  if (bereichRaw === "at" || bereichRaw === "nt") {
    bereich = bereichRaw;
    scope.testament = bereichRaw === "at" ? "OT" : "NT";
    label = bereichRaw === "at" ? "Altes Testament" : "Neues Testament";
  } else if (bereichRaw !== "alle") {
    const book = getBookBySlug(bereichRaw);
    if (book) {
      bereich = bookSlug(book);
      scope.bookNumber = book.number;
      label = book.name.de;
    }
  }
  return { q, bereich, seite, scope, label };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { q } = readQuery(await props.searchParams);
  return {
    title: q ? `„${q}“ – Bibelsuche` : "Bibelsuche",
    description: "Volltextsuche in der Bibel: Wörter, Wortfolgen in Anführungszeichen oder eine Bibelstelle eingeben.",
  };
}

export default async function SearchPage(props: Props) {
  const sp = await props.searchParams;
  const { q, bereich, seite, scope, label } = readQuery(sp);
  const t = await resolveTranslationId(first(sp.t));
  const translations = await listTranslations();
  const translation = translations.find((x) => x.id === t) ?? translations[0];
  const locale = localeFor(translation.language);

  const direct = q ? parseReference(q) : null;
  const result = q ? await searchVerses(t, q, { ...scope, limit: PAGE_SIZE, offset: (seite - 1) * PAGE_SIZE }) : null;
  const pages = result ? Math.max(1, Math.ceil(result.total / PAGE_SIZE)) : 1;
  const pageUrl = (n: number) => buildSearchUrl({ q, t, bereich, seite: n });

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 md:py-14">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Bibelsuche</h1>
      <p className="text-muted-foreground mt-2">Durchsuche den vollständigen Text einer Übersetzung.</p>

      <Form action="/bibel/suche" role="search" className="mt-8 space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex-1">
            <label htmlFor="suche-q" className="sr-only">
              Suchbegriff
            </label>
            <Input
              id="suche-q"
              name="q"
              type="search"
              defaultValue={q}
              maxLength={MAX_QUERY}
              placeholder="z. B. Gnade, „fürchte dich nicht“ oder Röm 8,28"
              autoComplete="off"
              autoFocus={!q}
            />
          </div>
          <button type="submit" className={buttonClasses("primary", "md")}>
            <Search aria-hidden="true" />
            Suchen
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <SelectField id="suche-t" name="t" label="Übersetzung" defaultValue={t}>
            {translations.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </SelectField>
          <SelectField id="suche-bereich" name="bereich" label="Bereich" defaultValue={bereich}>
            <option value="alle">Ganze Bibel</option>
            <option value="at">Altes Testament</option>
            <option value="nt">Neues Testament</option>
            <optgroup label="Altes Testament">
              {OLD_TESTAMENT.map((b) => (
                <option key={b.id} value={bookSlug(b)}>
                  {b.name.de}
                </option>
              ))}
            </optgroup>
            <optgroup label="Neues Testament">
              {NEW_TESTAMENT.map((b) => (
                <option key={b.id} value={bookSlug(b)}>
                  {b.name.de}
                </option>
              ))}
            </optgroup>
          </SelectField>
        </div>
      </Form>

      {direct ? (
        <Link
          href={referencePath(direct, t)}
          className="rounded-card border-primary/30 bg-primary-soft/50 hover:bg-primary-soft mt-8 flex items-center justify-between gap-3 border px-5 py-4 transition"
        >
          <span>
            <span className="text-primary block text-xs font-semibold tracking-wider uppercase">Direkt öffnen</span>
            <span className="mt-0.5 block text-lg font-semibold">{formatReference(direct, locale)}</span>
          </span>
          <ArrowRight className="text-primary size-5 shrink-0" aria-hidden="true" />
        </Link>
      ) : null}

      {!result ? (
        <section className="rounded-card border-border bg-surface mt-10 border p-5 text-sm">
          <h2 className="flex items-center gap-2 font-semibold">
            <Lightbulb className="text-accent size-4" aria-hidden="true" />
            So suchst du
          </h2>
          <ul className="text-muted-foreground mt-3 list-disc space-y-1.5 pl-5">
            <li>Mehrere Wörter finden Verse, in denen alle Wörter vorkommen – egal in welcher Reihenfolge.</li>
            <li>
              Eine genaue Wortfolge setzt du in Anführungszeichen, z. B. <q>fürchte dich nicht</q>.
            </li>
            <li>Groß-/Kleinschreibung und Umlaute spielen keine Rolle („Gute“ findet auch „Güte“).</li>
            <li>
              Eine Bibelstelle wie <em>Joh 3,16</em> oder <em>Psalm 23</em> öffnet direkt das Kapitel.
            </li>
          </ul>
          <p className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground">Zum Ausprobieren:</span>
            {["Gnade", "Hoffnung", "„fürchte dich nicht“"].map((example) => (
              <Link
                key={example}
                href={buildSearchUrl({ q: example.replace(/[„“]/g, '"'), t })}
                className={buttonClasses("secondary", "sm")}
              >
                {example}
              </Link>
            ))}
          </p>
        </section>
      ) : result.total === 0 ? (
        <EmptyState
          className="mt-10"
          icon={<SearchX />}
          title="Keine Treffer"
          description={`Für „${q}“ wurde in der ${translation.shortName} (${label}) nichts gefunden. Versuch es mit weniger oder anderen Wörtern – Wortfolgen in Anführungszeichen müssen genau so vorkommen.`}
        />
      ) : (
        <section className="mt-10" aria-labelledby="treffer">
          <h2 id="treffer" className="text-muted-foreground text-sm font-medium">
            {result.total === 1 ? "1 Treffer" : `${result.total.toLocaleString("de-DE")} Treffer`} für „{q}“ in der{" "}
            {translation.shortName}
            {label !== "ganze Bibel" ? ` (${label})` : ""}
            {pages > 1 ? ` · Seite ${Math.min(seite, pages)} von ${pages}` : ""}
          </h2>
          <ol className="divide-border mt-4 divide-y">
            {result.hits.map((hit) => {
              const book = BOOKS[hit.book - 1];
              const ref = { book, chapter: hit.chapter, verseStart: hit.verse };
              return (
                <li key={`${hit.book}-${hit.chapter}-${hit.verse}`} className="py-4">
                  <Link href={referencePath(ref, t)} className="text-primary text-sm font-semibold hover:underline">
                    {formatReference(ref, locale)}
                  </Link>
                  <p
                    className="scripture mt-1 text-[1.05rem]"
                    lang={locale}
                    dangerouslySetInnerHTML={{ __html: hit.snippet }}
                  />
                </li>
              );
            })}
          </ol>
          {pages > 1 ? (
            <nav aria-label="Seiten" className="mt-8 flex items-center justify-between gap-3">
              {seite > 1 ? (
                <Link href={pageUrl(seite - 1)} rel="prev" className={buttonClasses("outline", "md", "pl-3")}>
                  <ChevronLeft aria-hidden="true" />
                  Zurück
                </Link>
              ) : (
                <span />
              )}
              <span className="text-muted-foreground text-sm">
                Seite {Math.min(seite, pages)} von {pages}
              </span>
              {seite < pages ? (
                <Link href={pageUrl(seite + 1)} rel="next" className={buttonClasses("outline", "md", "pr-3")}>
                  Weiter
                  <ChevronRight aria-hidden="true" />
                </Link>
              ) : (
                <span />
              )}
            </nav>
          ) : null}
          <p className="text-muted-foreground mt-8 text-xs">
            Tipp: Eine genaue Wortfolge findest du mit Anführungszeichen, z. B. „fürchte dich nicht“.
          </p>
        </section>
      )}
    </main>
  );
}
