import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ChapterGrid } from "@/components/bible/chapter-grid";
import { TranslationSelect } from "@/components/bible/translation-select";
import { buttonClasses } from "@/components/ui/button";
import { bookSlug, getBookBySlug, getBookByNumber, GENRE_LABELS } from "@/lib/bible/books";
import {
  DEFAULT_TRANSLATION,
  getChapterCount,
  getTranslation,
  listTranslations,
  resolveTranslationId,
} from "@/lib/bible/data";
import { buildBookUrl, localeFor, TESTAMENT_LABELS, toTranslationOption } from "@/lib/bible/ui";

type Props = PageProps<"/bibel/[book]">;

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { book: param } = await props.params;
  const book = getBookBySlug(param);
  if (!book) return { title: "Bibel" };
  const other = book.name.en !== book.name.de ? ` (${book.name.en})` : "";
  return {
    title: `${book.name.de} – Bibel`,
    description: `${book.name.de}${other}: ${TESTAMENT_LABELS[book.testament]}, ${GENRE_LABELS[book.genre].de}. Alle ${book.chapters} Kapitel lesen, vergleichen und teilen.`,
  };
}

export default async function BookPage(props: Props) {
  const [{ book: param }, sp] = await Promise.all([props.params, props.searchParams]);
  const book = getBookBySlug(param);
  if (!book) notFound();
  const tRaw = first(sp.t);
  if (param !== bookSlug(book)) redirect(buildBookUrl(book, { t: tRaw }));

  const t = await resolveTranslationId(tRaw);
  const [translation, chapterCount, translations] = await Promise.all([
    getTranslation(t),
    getChapterCount(t, book.number),
    listTranslations(),
  ]);
  const locale = localeFor(translation?.language);
  const tParam = t === DEFAULT_TRANSLATION ? undefined : t;
  const prevBook = getBookByNumber(book.number - 1);
  const nextBook = getBookByNumber(book.number + 1);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 md:py-14">
      <nav aria-label="Brotkrumen" className="text-muted-foreground text-sm">
        <Link href="/bibel" className="hover:text-foreground">
          Bibel
        </Link>
        <span aria-hidden="true"> / </span>
        <Link href={`/bibel#${book.testament === "OT" ? "at" : "nt"}`} className="hover:text-foreground">
          {TESTAMENT_LABELS[book.testament]}
        </Link>
      </nav>

      <header className="mt-4 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{book.name[locale]}</h1>
          <p className="text-muted-foreground mt-2">
            {locale === "en" ? book.name.de : book.name.en}
            {" · "}
            {TESTAMENT_LABELS[book.testament]}
            {" · "}
            {GENRE_LABELS[book.genre].de}
            {" · "}
            {chapterCount} Kapitel
          </p>
        </div>
        <TranslationSelect
          id="buch-uebersetzung"
          label="Übersetzung"
          translations={translations.map(toTranslationOption)}
          value={t}
          param="t"
          pathname={`/bibel/${bookSlug(book)}`}
          query={{}}
          className="w-56"
        />
      </header>

      <ChapterGrid book={book} count={chapterCount} t={tParam} className="mt-10" />

      <nav aria-label="Bücher" className="border-border mt-12 flex items-center justify-between gap-3 border-t pt-6">
        {prevBook ? (
          <Link href={buildBookUrl(prevBook, { t: tParam })} className={buttonClasses("ghost", "md", "pl-2")}>
            <ChevronLeft aria-hidden="true" />
            {prevBook.name[locale]}
          </Link>
        ) : (
          <span />
        )}
        {nextBook ? (
          <Link href={buildBookUrl(nextBook, { t: tParam })} className={buttonClasses("ghost", "md", "pr-2")}>
            {nextBook.name[locale]}
            <ChevronRight aria-hidden="true" />
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </main>
  );
}
