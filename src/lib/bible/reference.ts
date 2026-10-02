/**
 * Parsing and formatting of Bible references in German and English notation.
 *
 * Accepted forms (case-insensitive, flexible whitespace):
 *   "Joh 3,16"        "Johannes 3:16"      "John 3:16"
 *   "Joh 3,16-18"     "Joh 3,16–18"        "Joh 3:16-18"
 *   "1. Mose 1"       "1Mo 1,1-5"          "Genesis 1:1-5"
 *   "Ps 23"           "Psalm 23,1"         "Röm 8,28"
 *   "Joh 3,16.18"     (verse list → first range only is kept, rest as extra verses)
 */
import { BOOKS, findBook, type BibleBook } from "./books";

export interface VerseRef {
  book: BibleBook;
  chapter: number;
  /** undefined → whole chapter */
  verseStart?: number;
  /** undefined → single verse (or whole chapter if verseStart undefined) */
  verseEnd?: number;
}

const REF_RE =
  /^\s*((?:[1-3]\s*\.?\s*)?[A-Za-zÄÖÜäöüß]+\.?)\s*(\d{1,3})(?:\s*[,:]\s*(\d{1,3})(?:\s*[-–—]\s*(\d{1,3}))?)?\s*$/;

export function parseReference(input: string): VerseRef | null {
  const m = REF_RE.exec(input.replace(/\s+/g, " "));
  if (!m) return null;
  const book = findBook(m[1]);
  if (!book) return null;
  const chapter = Number(m[2]);
  if (chapter < 1) return null;
  const ref: VerseRef = { book, chapter };
  if (m[3]) {
    ref.verseStart = Number(m[3]);
    if (m[4]) {
      const end = Number(m[4]);
      ref.verseEnd = end >= ref.verseStart ? end : undefined;
    }
  }
  return ref;
}

/**
 * Finds every Bible reference inside free text (e.g. a prayer request or post)
 * and returns them with their character offsets, so the UI can link them.
 */
export function findReferencesInText(text: string): { ref: VerseRef; start: number; end: number; raw: string }[] {
  const results: { ref: VerseRef; start: number; end: number; raw: string }[] = [];
  const re =
    /(?<![A-Za-zÄÖÜäöüß])((?:[1-3]\s*\.?\s*)?[A-Za-zÄÖÜäöüß]{2,}\.?)\s*(\d{1,3})\s*[,:]\s*(\d{1,3})(?:\s*[-–—]\s*(\d{1,3}))?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const book = findBook(m[1]);
    if (!book) continue;
    const ref: VerseRef = { book, chapter: Number(m[2]), verseStart: Number(m[3]) };
    if (m[4] && Number(m[4]) >= ref.verseStart!) ref.verseEnd = Number(m[4]);
    results.push({ ref, start: m.index, end: m.index + m[0].length, raw: m[0] });
  }
  return results;
}

export type Locale = "de" | "en";

/** "Johannes 3,16-18" (de) / "John 3:16-18" (en) */
export function formatReference(ref: VerseRef, locale: Locale = "de", short = false): string {
  const name = short ? ref.book.abbr[locale] : ref.book.name[locale];
  const sep = locale === "de" ? "," : ":";
  let s = `${name} ${ref.chapter}`;
  if (ref.verseStart) {
    s += `${sep}${ref.verseStart}`;
    if (ref.verseEnd && ref.verseEnd !== ref.verseStart) s += `-${ref.verseEnd}`;
  }
  return s;
}

/** Path to the reader, e.g. /bibel/john/3?v=16-18 */
export function referencePath(ref: VerseRef, translation?: string): string {
  const slug = ref.book.id.toLowerCase();
  const params = new URLSearchParams();
  if (ref.verseStart) params.set("v", ref.verseEnd ? `${ref.verseStart}-${ref.verseEnd}` : String(ref.verseStart));
  if (translation) params.set("t", translation);
  const q = params.toString();
  return `/bibel/${slug}/${ref.chapter}${q ? `?${q}` : ""}`;
}

/**
 * Stable key for storing a verse location in the database: "<book>:<chapter>:<verse>".
 * Book is the canonical number (1–66), independent of translation.
 */
export function verseKey(bookNumber: number, chapter: number, verse: number): string {
  return `${bookNumber}:${chapter}:${verse}`;
}

export function parseVerseKey(key: string): { book: BibleBook; chapter: number; verse: number } | null {
  const [b, c, v] = key.split(":").map(Number);
  const book = BOOKS[b - 1];
  if (!book || !c || !v) return null;
  return { book, chapter: c, verse: v };
}

/** Parses "16", "16-18" from the ?v= query parameter */
export function parseVerseRange(v: string | undefined): { start: number; end: number } | null {
  if (!v) return null;
  const m = /^(\d{1,3})(?:-(\d{1,3}))?$/.exec(v);
  if (!m) return null;
  const start = Number(m[1]);
  const end = m[2] ? Math.max(start, Number(m[2])) : start;
  return { start, end };
}
