import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { KeyboardNav } from "@/components/bible/keyboard-nav";
import { ReaderToolbar, type ChapterTarget } from "@/components/bible/reader-toolbar";
import { RecordRecentChapter } from "@/components/bible/recent-chapters";
import { VerseList, type ReaderVerse } from "@/components/bible/verse-list";
import { Alert } from "@/components/ui/alert";
import { buttonClasses } from "@/components/ui/button";
import { BOOKS, bookSlug, getBookBySlug, getBookByNumber, type BibleBook } from "@/lib/bible/books";
import {
  getAdjacentChapters,
  getChapter,
  getTranslation,
  listTranslations,
  resolveTranslationId,
  type TranslationInfo,
} from "@/lib/bible/data";
import { formatReference, parseVerseRange } from "@/lib/bible/reference";
import { buildBookUrl, buildReaderUrl, clampVerseRange, excerpt, localeFor, toTranslationOption } from "@/lib/bible/ui";
import { cn } from "@/lib/utils";

type Props = PageProps<"/bibel/[book]/[chapter]">;

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

function parseChapter(raw: string): number | null {
  if (!/^\d{1,3}$/.test(raw)) return null;
  const n = Number(raw);
  return n >= 1 ? n : null;
}

/** The parallel translation, if requested, valid and different from the primary one. */
async function resolveParallel(raw: string | undefined, t: string): Promise<TranslationInfo | null> {
  if (!raw) return null;
  const info = await getTranslation(raw.toUpperCase());
  return info && info.id !== t ? info : null;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const [{ book: bookParam, chapter: chapterParam }, sp] = await Promise.all([props.params, props.searchParams]);
  const book = getBookBySlug(bookParam);
  const chapter = parseChapter(chapterParam);
  if (!book || !chapter) return { title: "Bibel" };
  const t = await resolveTranslationId(first(sp.t));
  const data = await getChapter(t, book.number, chapter);
  if (!data) return { title: "Bibel" };
  const locale = localeFor(data.translation.language);
  const highlight = clampVerseRange(parseVerseRange(first(sp.v)), data.verses.length);
  const reference = formatReference({ book, chapter, verseStart: highlight?.start, verseEnd: highlight?.end }, locale);
  const title = `${reference} – ${data.translation.shortName}`;
  const texts = (highlight ? data.verses.slice(highlight.start - 1, highlight.end) : data.verses).map((v) => v.text);
  const description = excerpt(texts, 160);
  return { title, description, openGraph: { title, description, type: "article" } };
}

function chapterTarget(
  target: { book: number; chapter: number } | null,
  locale: "de" | "en",
  params: { t: string; p: string | null },
): ChapterTarget | null {
  if (!target) return null;
  const book = getBookByNumber(target.book);
  if (!book) return null;
  return { href: buildReaderUrl(book, target.chapter, params), label: `${book.name[locale]} ${target.chapter}` };
}

export default async function ChapterPage(props: Props) {
  const [{ book: bookParam, chapter: chapterParam }, sp] = await Promise.all([props.params, props.searchParams]);
  const book: BibleBook | undefined = getBookBySlug(bookParam);
  const chapter = parseChapter(chapterParam);
  if (!book || !chapter) notFound();
  if (bookParam !== bookSlug(book)) {
    redirect(buildReaderUrl(book, chapter, { t: first(sp.t), p: first(sp.p), v: first(sp.v) }));
  }

  const t = await resolveTranslationId(first(sp.t));
  const data = await getChapter(t, book.number, chapter);
  if (!data) notFound();

  const pRaw = first(sp.p);
  const [translations, adjacent, parallelInfo] = await Promise.all([
    listTranslations(),
    getAdjacentChapters(t, book.number, chapter),
    resolveParallel(pRaw, t),
  ]);
  const parallel = parallelInfo ? await getChapter(parallelInfo.id, book.number, chapter) : null;
  const p = parallelInfo?.id ?? null;
  const vRaw = first(sp.v);

  const { translation } = data;
  const locale = localeFor(translation.language);
  const slug = bookSlug(book);
  const highlight = clampVerseRange(parseVerseRange(vRaw), data.verses.length);
  const heading = formatReference({ book, chapter, verseStart: highlight?.start, verseEnd: highlight?.end }, locale);
  const prev = chapterTarget(adjacent.prev, locale, { t, p });
  const next = chapterTarget(adjacent.next, locale, { t, p });

  const verseCount = Math.max(data.verses.length, parallel?.verses.length ?? 0);
  const verses: ReaderVerse[] = Array.from({ length: verseCount }, (_, i) => ({
    verse: i + 1,
    text: data.verses[i]?.text ?? "",
    parallelText: parallel ? (parallel.verses[i]?.text ?? null) : undefined,
  }));

  const licenses = [translation, ...(parallel ? [parallel.translation] : [])];

  return (
    <main className="flex-1">
      <ReaderToolbar
        books={BOOKS.map((b) => ({ slug: bookSlug(b), name: b.name[locale] }))}
        bookSlug={slug}
        chapter={chapter}
        chapterCount={data.chapterCount}
        translations={translations.map(toTranslationOption)}
        t={t}
        p={p}
        v={vRaw}
        prev={prev}
        next={next}
      />
      <KeyboardNav prevHref={prev?.href ?? null} nextHref={next?.href ?? null} />
      <RecordRecentChapter book={slug} chapter={chapter} t={t} />

      <div className={cn("mx-auto w-full px-4 py-8 sm:px-6 md:py-12", parallel ? "max-w-5xl" : "prose-reader")}>
        <header className="mb-8">
          <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            <Link href={buildBookUrl(book, { t })} className="hover:text-foreground">
              {book.name[locale]}
            </Link>
            {" · "}
            {translation.name}
            {parallel ? ` · ${parallel.translation.name}` : null}
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">{heading}</h1>
          {highlight ? (
            <p className="text-muted-foreground mt-2 text-sm">
              Hervorgehoben: Vers{" "}
              {highlight.start === highlight.end ? highlight.start : `${highlight.start}–${highlight.end}`}.{" "}
              <Link href={buildReaderUrl(book, chapter, { t, p })} className="text-primary hover:underline">
                Ganzes Kapitel ohne Hervorhebung
              </Link>
            </p>
          ) : null}
        </header>

        {pRaw && !parallelInfo ? (
          <Alert tone="info" className="mb-6">
            Die Parallelübersetzung „{pRaw}“ ist nicht verfügbar.
          </Alert>
        ) : null}
        {parallelInfo && !parallel ? (
          <Alert tone="info" className="mb-6">
            In der {parallelInfo.shortName} gibt es dieses Kapitel nicht – die Zählung weicht dort ab.
          </Alert>
        ) : null}

        <VerseList
          key={`${t}-${p ?? ""}-${slug}-${chapter}`}
          bookNumber={book.number}
          bookSlug={slug}
          bookName={book.name[locale]}
          chapter={chapter}
          translation={{ id: translation.id, shortName: translation.shortName, language: translation.language }}
          parallel={
            parallel
              ? {
                  id: parallel.translation.id,
                  shortName: parallel.translation.shortName,
                  language: parallel.translation.language,
                }
              : null
          }
          verses={verses}
          highlight={highlight}
        />

        <nav aria-label="Kapitelnavigation" className="mt-12 flex items-center justify-between gap-3">
          {prev ? (
            <Link href={prev.href} rel="prev" className={buttonClasses("outline", "md", "pl-3")}>
              <ChevronLeft aria-hidden="true" />
              {prev.label}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={next.href} rel="next" className={buttonClasses("outline", "md", "pr-3")}>
              {next.label}
              <ChevronRight aria-hidden="true" />
            </Link>
          ) : (
            <span />
          )}
        </nav>

        <footer className="border-border text-muted-foreground mt-10 space-y-1.5 border-t pt-4 text-xs">
          {licenses.map((info) => (
            <p key={info.id}>
              {info.name}: {info.licenseNote}
            </p>
          ))}
          {licenses.some((info) => !info.commercialUse) ? (
            <p>
              Die Schlachter-Bibel 1951 ist urheberrechtlich geschützt (© Genfer Bibelgesellschaft) und wird hier
              ausschließlich nicht-kommerziell und unverändert wiedergegeben.
            </p>
          ) : null}
          <p>Querverweise: OpenBible.info (CC-BY 4.0). Tipp: Mit ← und → blätterst du zwischen den Kapiteln.</p>
        </footer>
      </div>
    </main>
  );
}
