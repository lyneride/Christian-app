/**
 * Pure UI helpers for the Bible reader. No I/O, no "server-only": safe to
 * import from client components and unit tests alike.
 */
import { BOOKS, GENRE_LABELS, bookSlug, type BibleBook, type Genre, type Testament } from "./books";
import type { Locale } from "./reference";

export const TESTAMENT_LABELS: Record<Testament, string> = {
  OT: "Altes Testament",
  NT: "Neues Testament",
};

/** Locale used for book names and reference notation of a translation. */
export function localeFor(language: string | undefined | null): Locale {
  return language === "en" ? "en" : "de";
}

/* ------------------------------------------------------------------ */
/* Translations (serialisable subset handed to client components)      */
/* ------------------------------------------------------------------ */

export interface TranslationOption {
  id: string;
  name: string;
  shortName: string;
  language: "de" | "en";
}

export function toTranslationOption(t: TranslationOption): TranslationOption {
  return { id: t.id, name: t.name, shortName: t.shortName, language: t.language };
}

/* ------------------------------------------------------------------ */
/* URLs                                                                 */
/* ------------------------------------------------------------------ */

export interface ReaderUrlParams {
  /** primary translation id */
  t?: string | null;
  /** parallel translation id */
  p?: string | null;
  /** verse or range: "16" | "16-18" */
  v?: string | null;
}

/** /bibel/john/3?t=LUT1912&p=KJV&v=16-18 */
export function buildReaderUrl(book: string | BibleBook, chapter: number, params: ReaderUrlParams = {}): string {
  const slug = typeof book === "string" ? book.toLowerCase() : bookSlug(book);
  const q = new URLSearchParams();
  if (params.t) q.set("t", params.t);
  if (params.p) q.set("p", params.p);
  if (params.v) q.set("v", params.v);
  const s = q.toString();
  return `/bibel/${slug}/${chapter}${s ? `?${s}` : ""}`;
}

/** /bibel/john?t=KJV */
export function buildBookUrl(book: string | BibleBook, params: { t?: string | null } = {}): string {
  const slug = typeof book === "string" ? book.toLowerCase() : bookSlug(book);
  return `/bibel/${slug}${params.t ? `?t=${encodeURIComponent(params.t)}` : ""}`;
}

export interface SearchUrlParams {
  q?: string | null;
  t?: string | null;
  bereich?: string | null;
  seite?: number | null;
}

/** /bibel/suche?q=liebe&t=LUT1912&bereich=nt&seite=2 */
export function buildSearchUrl(params: SearchUrlParams = {}): string {
  const q = new URLSearchParams();
  if (params.q) q.set("q", params.q);
  if (params.t) q.set("t", params.t);
  if (params.bereich && params.bereich !== "alle") q.set("bereich", params.bereich);
  if (params.seite && params.seite > 1) q.set("seite", String(params.seite));
  const s = q.toString();
  return `/bibel/suche${s ? `?${s}` : ""}`;
}

/* ------------------------------------------------------------------ */
/* Verse ranges and selections                                          */
/* ------------------------------------------------------------------ */

export interface VerseRange {
  start: number;
  end: number;
}

/** Limits a parsed ?v= range to the verses that exist in the chapter. */
export function clampVerseRange(range: VerseRange | null | undefined, verseCount: number): VerseRange | null {
  if (!range || verseCount < 1) return null;
  const start = Math.min(Math.max(range.start, 1), verseCount);
  const end = Math.min(Math.max(range.end, start), verseCount);
  return { start, end };
}

function sortedUnique(verses: readonly number[]): number[] {
  return [...new Set(verses)].filter((n) => Number.isInteger(n) && n > 0).sort((a, b) => a - b);
}

/** Splits a verse list into contiguous runs: [16,17,18,20] → [[16,18],[20,20]] */
export function verseRuns(verses: readonly number[]): VerseRange[] {
  const runs: VerseRange[] = [];
  for (const n of sortedUnique(verses)) {
    const last = runs[runs.length - 1];
    if (last && n === last.end + 1) last.end = n;
    else runs.push({ start: n, end: n });
  }
  return runs;
}

/**
 * Value for the ?v= parameter. The reader only understands a single range, so
 * a non-contiguous selection collapses to its outer bounds.
 */
export function verseParam(verses: readonly number[]): string | null {
  const list = sortedUnique(verses);
  if (list.length === 0) return null;
  const start = list[0];
  const end = list[list.length - 1];
  return start === end ? String(start) : `${start}-${end}`;
}

/**
 * The range a study action (note, memory verse) applies to: the first
 * contiguous run of the selection, i.e. the whole selection when contiguous.
 */
export function selectionRange(verses: readonly number[]): VerseRange | null {
  return verseRuns(verses)[0] ?? null;
}

/** "Johannes 3,16-18" / "John 3:16-18" for a single range. */
export function formatRangeReference(
  bookName: string,
  chapter: number,
  range: VerseRange,
  locale: Locale = "de",
): string {
  const sep = locale === "de" ? "," : ":";
  return `${bookName} ${chapter}${sep}${range.start}${range.end > range.start ? `-${range.end}` : ""}`;
}

/** "16", "16-18", "16.18" (de) / "16,18" (en), "16-17.20" */
export function formatVerseList(verses: readonly number[], locale: Locale = "de"): string {
  const listSep = locale === "de" ? "." : ",";
  return verseRuns(verses)
    .map((r) => (r.start === r.end ? String(r.start) : `${r.start}-${r.end}`))
    .join(listSep);
}

/** "Johannes 3,16-18" / "John 3:16-18" for an arbitrary verse selection. */
export function formatSelectionReference(
  bookName: string,
  chapter: number,
  verses: readonly number[],
  locale: Locale = "de",
): string {
  const list = formatVerseList(verses, locale);
  if (!list) return `${bookName} ${chapter}`;
  return `${bookName} ${chapter}${locale === "de" ? "," : ":"}${list}`;
}

export interface CrossRefLike {
  book: BibleBook;
  chapter: number;
  verseStart: number;
  verseEnd?: number;
  endChapter?: number;
}

/** "Römer 5,8", "1. Johannes 4,9-10", "Johannes 11,25-12,2" (cross-chapter range) */
export function formatCrossReference(ref: CrossRefLike, locale: Locale = "de"): string {
  const sep = locale === "de" ? "," : ":";
  let s = `${ref.book.name[locale]} ${ref.chapter}${sep}${ref.verseStart}`;
  if (ref.verseEnd !== undefined) {
    if (ref.endChapter !== undefined && ref.endChapter !== ref.chapter) s += `-${ref.endChapter}${sep}${ref.verseEnd}`;
    else if (ref.verseEnd !== ref.verseStart) s += `-${ref.verseEnd}`;
  }
  return s;
}

/** Text put on the clipboard for a selection. */
export function buildCopyText(
  verses: readonly { verse: number; text: string }[],
  reference: string,
  translationShortName: string,
): string {
  const body =
    verses.length > 1 ? verses.map((v) => `${v.verse} ${v.text.trim()}`).join(" ") : (verses[0]?.text.trim() ?? "");
  return `${body}\n— ${reference} (${translationShortName})`;
}

/** First `max` characters of a chapter, cut at a word boundary, for meta descriptions. */
export function excerpt(texts: readonly string[], max = 160): string {
  const joined = texts.join(" ").replace(/\s+/g, " ").trim();
  if (joined.length <= max) return joined;
  const cut = joined.slice(0, max);
  const at = cut.lastIndexOf(" ");
  return `${cut.slice(0, at > max * 0.6 ? at : max).trimEnd()}…`;
}

/* ------------------------------------------------------------------ */
/* Reader settings (localStorage "bleibe:reader-settings")              */
/* ------------------------------------------------------------------ */

export type FontSize = "s" | "m" | "l" | "xl";
export type FontFamily = "serif" | "sans";
export type VerseLayout = "lines" | "flow";

export interface ReaderSettings {
  fontSize: FontSize;
  font: FontFamily;
  layout: VerseLayout;
}

export const READER_SETTINGS_KEY = "bleibe:reader-settings";

export const DEFAULT_READER_SETTINGS: ReaderSettings = { fontSize: "m", font: "serif", layout: "lines" };

export const FONT_SIZE_OPTIONS: readonly { value: FontSize; label: string; fontSize: string; lineHeight: string }[] = [
  { value: "s", label: "S", fontSize: "1rem", lineHeight: "1.75" },
  { value: "m", label: "M", fontSize: "1.125rem", lineHeight: "1.85" },
  { value: "l", label: "L", fontSize: "1.3125rem", lineHeight: "1.85" },
  { value: "xl", label: "XL", fontSize: "1.5rem", lineHeight: "1.8" },
];

const FONT_SIZES = new Set<string>(FONT_SIZE_OPTIONS.map((o) => o.value));

/** Tolerant parser: unknown or missing fields fall back to the defaults. */
export function parseReaderSettings(raw: string | null | undefined): ReaderSettings {
  if (!raw) return DEFAULT_READER_SETTINGS;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return DEFAULT_READER_SETTINGS;
    const o = parsed as Record<string, unknown>;
    return {
      fontSize:
        typeof o.fontSize === "string" && FONT_SIZES.has(o.fontSize)
          ? (o.fontSize as FontSize)
          : DEFAULT_READER_SETTINGS.fontSize,
      font: o.font === "sans" || o.font === "serif" ? o.font : DEFAULT_READER_SETTINGS.font,
      layout: o.layout === "flow" || o.layout === "lines" ? o.layout : DEFAULT_READER_SETTINGS.layout,
    };
  } catch {
    return DEFAULT_READER_SETTINGS;
  }
}

/** Inline style for the reader container (inline styles win over the `scripture` utility). */
export function readerSettingsStyle(settings: ReaderSettings): {
  fontSize: string;
  lineHeight: string;
  fontFamily?: string;
} {
  const size = FONT_SIZE_OPTIONS.find((o) => o.value === settings.fontSize) ?? FONT_SIZE_OPTIONS[1];
  const style: { fontSize: string; lineHeight: string; fontFamily?: string } = {
    fontSize: size.fontSize,
    lineHeight: size.lineHeight,
  };
  if (settings.font === "sans") style.fontFamily = "var(--font-sans), ui-sans-serif, system-ui, sans-serif";
  return style;
}

/* ------------------------------------------------------------------ */
/* Recently read chapters (localStorage "bleibe:recent-chapters")       */
/* ------------------------------------------------------------------ */

export const RECENT_CHAPTERS_KEY = "bleibe:recent-chapters";
export const MAX_RECENT_CHAPTERS = 8;

export interface RecentChapter {
  /** canonical lowercase OSIS slug, e.g. "john" */
  book: string;
  chapter: number;
  /** translation id */
  t: string;
  /** epoch millis */
  at: number;
}

function isRecentChapter(x: unknown): x is RecentChapter {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.book === "string" &&
    typeof o.chapter === "number" &&
    Number.isInteger(o.chapter) &&
    o.chapter > 0 &&
    typeof o.t === "string" &&
    typeof o.at === "number"
  );
}

export function parseRecentChapters(raw: string | null | undefined): RecentChapter[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isRecentChapter).slice(0, MAX_RECENT_CHAPTERS);
  } catch {
    return [];
  }
}

/** Returns a new list with `entry` at the front, deduplicated by book+chapter and capped. */
export function pushRecentChapter(list: readonly RecentChapter[], entry: RecentChapter): RecentChapter[] {
  const rest = list.filter((e) => !(e.book === entry.book && e.chapter === entry.chapter));
  return [entry, ...rest].slice(0, MAX_RECENT_CHAPTERS);
}

/* ------------------------------------------------------------------ */
/* Book grouping for the overview                                       */
/* ------------------------------------------------------------------ */

export interface BookGroup {
  genre: Genre;
  label: string;
  books: BibleBook[];
}

export interface TestamentGroup {
  testament: Testament;
  label: string;
  books: BibleBook[];
  groups: BookGroup[];
}

/** Books grouped by testament, then by genre in canonical order of first appearance. */
export function groupBooks(books: readonly BibleBook[] = BOOKS): TestamentGroup[] {
  const result: TestamentGroup[] = [];
  for (const testament of ["OT", "NT"] as const) {
    const inTestament = books.filter((b) => b.testament === testament);
    if (inTestament.length === 0) continue;
    const groups: BookGroup[] = [];
    for (const book of inTestament) {
      let group = groups.find((g) => g.genre === book.genre);
      if (!group) {
        group = { genre: book.genre, label: GENRE_LABELS[book.genre].de, books: [] };
        groups.push(group);
      }
      group.books.push(book);
    }
    result.push({ testament, label: TESTAMENT_LABELS[testament], books: inTestament, groups });
  }
  return result;
}
