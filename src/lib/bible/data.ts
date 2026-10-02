import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { BOOKS, getBookByNumber, type BibleBook } from "./books";

/**
 * Server-side access to the bundled public-domain Bible texts in /data.
 * Texts are loaded lazily from disk and cached in memory for the lifetime of
 * the process (≈4 MB per translation when fully loaded).
 */

export interface TranslationInfo {
  id: string;
  name: string;
  shortName: string;
  language: "de" | "en";
  year: number;
  license: string;
  licenseNote: string;
  source: string;
  order: number;
  commercialUse: boolean;
  verseCount: number;
  /** chapter count per book (index = bookNumber - 1) */
  chapters: number[];
}

interface TranslationIndex extends TranslationInfo {
  verseCounts: number[][];
}

interface BookFile {
  b: number;
  c: string[][];
}

export interface Verse {
  book: number;
  chapter: number;
  verse: number;
  text: string;
}

export interface Chapter {
  translation: TranslationInfo;
  book: BibleBook;
  chapter: number;
  verses: Verse[];
  chapterCount: number;
}

const DATA_DIR = path.join(process.cwd(), "data");
export const DEFAULT_TRANSLATION = "LUT1912";

let translationsCache: TranslationInfo[] | null = null;
const indexCache = new Map<string, Promise<TranslationIndex>>();
const bookCache = new Map<string, Promise<BookFile>>();
const crossRefCache = new Map<number, Promise<Record<string, [string, number][]>>>();

async function readJson<T>(file: string): Promise<T> {
  const raw = await readFile(path.join(DATA_DIR, file), "utf8");
  return JSON.parse(raw) as T;
}

export async function listTranslations(): Promise<TranslationInfo[]> {
  if (!translationsCache) {
    translationsCache = await readJson<TranslationInfo[]>("bibles/translations.json");
  }
  return translationsCache;
}

export async function getTranslation(id: string): Promise<TranslationInfo | undefined> {
  const all = await listTranslations();
  return all.find((t) => t.id === id);
}

/** Returns a valid translation id, falling back to the default. */
export async function resolveTranslationId(id: string | undefined | null): Promise<string> {
  if (!id) return DEFAULT_TRANSLATION;
  const t = await getTranslation(id.toUpperCase());
  return t ? t.id : DEFAULT_TRANSLATION;
}

async function getIndex(translationId: string): Promise<TranslationIndex> {
  let p = indexCache.get(translationId);
  if (!p) {
    p = readJson<TranslationIndex>(`bibles/${translationId}/index.json`);
    indexCache.set(translationId, p);
  }
  return p;
}

async function getBookFile(translationId: string, bookNumber: number): Promise<BookFile> {
  const key = `${translationId}/${bookNumber}`;
  let p = bookCache.get(key);
  if (!p) {
    p = readJson<BookFile>(`bibles/${translationId}/${bookNumber}.json`);
    bookCache.set(key, p);
  }
  return p;
}

export async function getChapterCount(translationId: string, bookNumber: number): Promise<number> {
  const index = await getIndex(translationId);
  return index.chapters[bookNumber - 1] ?? getBookByNumber(bookNumber)?.chapters ?? 0;
}

export async function getVerseCount(translationId: string, bookNumber: number, chapter: number): Promise<number> {
  const index = await getIndex(translationId);
  return index.verseCounts[bookNumber - 1]?.[chapter - 1] ?? 0;
}

export async function getChapter(translationId: string, bookNumber: number, chapter: number): Promise<Chapter | null> {
  const translation = await getTranslation(translationId);
  const book = getBookByNumber(bookNumber);
  if (!translation || !book) return null;
  const file = await getBookFile(translationId, bookNumber);
  const verses = file.c[chapter - 1];
  if (!verses) return null;
  return {
    translation,
    book,
    chapter,
    chapterCount: file.c.length,
    verses: verses.map((text, i) => ({ book: bookNumber, chapter, verse: i + 1, text })),
  };
}

export async function getVerses(
  translationId: string,
  bookNumber: number,
  chapter: number,
  start: number,
  end: number = start,
): Promise<Verse[]> {
  const ch = await getChapter(translationId, bookNumber, chapter);
  if (!ch) return [];
  return ch.verses.filter((v) => v.verse >= start && v.verse <= end);
}

export async function getVerse(translationId: string, bookNumber: number, chapter: number, verse: number): Promise<Verse | null> {
  const verses = await getVerses(translationId, bookNumber, chapter, verse, verse);
  return verses[0] ?? null;
}

/** Position helpers for prev/next navigation across book boundaries. */
export async function getAdjacentChapters(translationId: string, bookNumber: number, chapter: number) {
  const index = await getIndex(translationId);
  const count = index.chapters[bookNumber - 1];
  let prev: { book: number; chapter: number } | null = null;
  let next: { book: number; chapter: number } | null = null;
  if (chapter > 1) prev = { book: bookNumber, chapter: chapter - 1 };
  else if (bookNumber > 1) prev = { book: bookNumber - 1, chapter: index.chapters[bookNumber - 2] };
  if (chapter < count) next = { book: bookNumber, chapter: chapter + 1 };
  else if (bookNumber < 66) next = { book: bookNumber + 1, chapter: 1 };
  return { prev, next };
}

export interface SearchHit extends Verse {
  /** text with the query terms wrapped in <mark> (already HTML-escaped) */
  snippet: string;
}

export interface SearchOptions {
  limit?: number;
  offset?: number;
  /** restrict to "OT" | "NT" | undefined */
  testament?: "OT" | "NT";
  /** restrict to a single book */
  bookNumber?: number;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function foldDiacritics(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, "a")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/**
 * Simple full-text search: every whitespace-separated term must occur
 * (diacritic- and case-insensitive); a phrase in quotes must occur literally.
 * Linear scan over ≈31k verses, typically < 50 ms per translation after warm-up.
 */
export async function searchVerses(
  translationId: string,
  query: string,
  options: SearchOptions = {},
): Promise<{ hits: SearchHit[]; total: number }> {
  const limit = Math.min(Math.max(options.limit ?? 50, 1), 200);
  const offset = Math.max(options.offset ?? 0, 0);
  const phrases: string[] = [];
  const rest = query.replace(/"([^"]+)"/g, (_, p: string) => {
    phrases.push(foldDiacritics(p.trim()));
    return " ";
  });
  const terms = rest
    .split(/\s+/)
    .map((t) => foldDiacritics(t.trim()))
    .filter((t) => t.length >= 2);
  if (terms.length === 0 && phrases.length === 0) return { hits: [], total: 0 };

  const books = BOOKS.filter((b) => {
    if (options.bookNumber) return b.number === options.bookNumber;
    if (options.testament) return b.testament === options.testament;
    return true;
  });

  const hits: SearchHit[] = [];
  let total = 0;
  for (const book of books) {
    const file = await getBookFile(translationId, book.number);
    file.c.forEach((verses, ci) => {
      verses.forEach((text, vi) => {
        if (!text) return;
        const folded = foldDiacritics(text);
        if (!terms.every((t) => folded.includes(t))) return;
        if (!phrases.every((p) => folded.includes(p))) return;
        total++;
        if (total <= offset || hits.length >= limit) return;
        hits.push({
          book: book.number,
          chapter: ci + 1,
          verse: vi + 1,
          text,
          snippet: highlight(text, [...terms, ...phrases]),
        });
      });
    });
  }
  return { hits, total };
}

/** Folds a string for matching while keeping a map from folded index → original index. */
function foldWithMap(text: string): { folded: string; map: number[] } {
  let folded = "";
  const map: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const piece = foldDiacritics(text[i]);
    for (let j = 0; j < piece.length; j++) map.push(i);
    folded += piece;
  }
  return { folded, map };
}

function highlight(text: string, terms: string[]): string {
  const { folded, map } = foldWithMap(text);
  const marks: [number, number][] = [];
  for (const term of terms) {
    if (!term) continue;
    let idx = folded.indexOf(term);
    while (idx >= 0) {
      const start = map[idx];
      const end = map[idx + term.length - 1] + 1;
      marks.push([start, end]);
      idx = folded.indexOf(term, idx + term.length);
    }
  }
  marks.sort((a, b) => a[0] - b[0]);
  let out = "";
  let pos = 0;
  for (const [s, e] of marks) {
    if (s < pos) continue;
    out += escapeHtml(text.slice(pos, s)) + "<mark>" + escapeHtml(text.slice(s, e)) + "</mark>";
    pos = e;
  }
  out += escapeHtml(text.slice(pos));
  return out;
}

export interface CrossReference {
  book: BibleBook;
  chapter: number;
  verseStart: number;
  verseEnd?: number;
  /** "c:v" of the end when the range spans into another chapter */
  endChapter?: number;
  votes: number;
}

export async function getCrossReferences(bookNumber: number, chapter: number, verse: number): Promise<CrossReference[]> {
  let p = crossRefCache.get(bookNumber);
  if (!p) {
    p = readJson<Record<string, [string, number][]>>(`crossrefs/${bookNumber}.json`).catch(() => ({}));
    crossRefCache.set(bookNumber, p);
  }
  const map = await p;
  const entries = map[`${chapter}:${verse}`] ?? [];
  const refs: CrossReference[] = [];
  for (const [target, votes] of entries) {
    // formats: "b:c:v", "b:c:v-v2", "b:c:v-c2:v2"
    const m = /^(\d+):(\d+):(\d+)(?:-(?:(\d+):)?(\d+))?$/.exec(target);
    if (!m) continue;
    const book = getBookByNumber(Number(m[1]));
    if (!book) continue;
    const ref: CrossReference = { book, chapter: Number(m[2]), verseStart: Number(m[3]), votes };
    if (m[5]) {
      ref.verseEnd = Number(m[5]);
      if (m[4]) ref.endChapter = Number(m[4]);
    }
    refs.push(ref);
  }
  return refs;
}

/**
 * Deterministic "verse of the day": a curated list of well-known verses,
 * rotated by the day of the year so that every visitor sees the same verse.
 */
export const DAILY_VERSES: { book: number; chapter: number; start: number; end?: number }[] = [
  { book: 43, chapter: 3, start: 16 },
  { book: 19, chapter: 23, start: 1, end: 3 },
  { book: 45, chapter: 8, start: 38, end: 39 },
  { book: 23, chapter: 41, start: 10 },
  { book: 40, chapter: 11, start: 28, end: 30 },
  { book: 20, chapter: 3, start: 5, end: 6 },
  { book: 50, chapter: 4, start: 6, end: 7 },
  { book: 24, chapter: 29, start: 11 },
  { book: 19, chapter: 46, start: 2 },
  { book: 62, chapter: 4, start: 16 },
  { book: 25, chapter: 3, start: 22, end: 23 },
  { book: 6, chapter: 1, start: 9 },
  { book: 45, chapter: 12, start: 2 },
  { book: 40, chapter: 6, start: 33, end: 34 },
  { book: 19, chapter: 119, start: 105 },
  { book: 48, chapter: 5, start: 22, end: 23 },
  { book: 23, chapter: 40, start: 31 },
  { book: 60, chapter: 5, start: 7 },
  { book: 43, chapter: 14, start: 6 },
  { book: 45, chapter: 5, start: 8 },
  { book: 19, chapter: 139, start: 13, end: 14 },
  { book: 58, chapter: 11, start: 1 },
  { book: 40, chapter: 28, start: 19, end: 20 },
  { book: 47, chapter: 5, start: 17 },
  { book: 19, chapter: 34, start: 19 },
  { book: 59, chapter: 1, start: 5 },
  { book: 43, chapter: 15, start: 5 },
  { book: 49, chapter: 2, start: 8, end: 9 },
  { book: 19, chapter: 27, start: 1 },
  { book: 23, chapter: 43, start: 1, end: 2 },
  { book: 45, chapter: 15, start: 13 },
  { book: 51, chapter: 3, start: 23 },
  { book: 19, chapter: 37, start: 4, end: 5 },
  { book: 40, chapter: 5, start: 14, end: 16 },
  { book: 43, chapter: 16, start: 33 },
  { book: 61, chapter: 3, start: 9 },
  { book: 19, chapter: 103, start: 1, end: 5 },
  { book: 46, chapter: 13, start: 4, end: 7 },
  { book: 35, chapter: 3, start: 17, end: 18 },
  { book: 43, chapter: 10, start: 10 },
  { book: 19, chapter: 91, start: 1, end: 2 },
  { book: 23, chapter: 53, start: 5 },
  { book: 54, chapter: 4, start: 12 },
  { book: 19, chapter: 1, start: 1, end: 3 },
  { book: 36, chapter: 3, start: 17 },
  { book: 42, chapter: 1, start: 37 },
  { book: 45, chapter: 10, start: 9 },
  { book: 19, chapter: 121, start: 1, end: 2 },
  { book: 48, chapter: 2, start: 20 },
  { book: 40, chapter: 7, start: 7, end: 8 },
  { book: 43, chapter: 8, start: 12 },
  { book: 20, chapter: 18, start: 10 },
  { book: 66, chapter: 21, start: 4 },
  { book: 23, chapter: 26, start: 3 },
  { book: 19, chapter: 90, start: 12 },
  { book: 44, chapter: 1, start: 8 },
  { book: 49, chapter: 3, start: 17, end: 19 },
  { book: 42, chapter: 6, start: 31 },
  { book: 19, chapter: 62, start: 2, end: 3 },
  { book: 33, chapter: 6, start: 8 },
];

export function dailyVerseIndex(date = new Date()): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start) / 86_400_000);
  return (dayOfYear + date.getUTCFullYear()) % DAILY_VERSES.length;
}

export async function getVerseOfTheDay(translationId: string, date = new Date()) {
  const pick = DAILY_VERSES[dailyVerseIndex(date)];
  const book = getBookByNumber(pick.book)!;
  const verses = await getVerses(translationId, pick.book, pick.chapter, pick.start, pick.end ?? pick.start);
  const translation = await getTranslation(translationId);
  return { book, chapter: pick.chapter, verseStart: pick.start, verseEnd: pick.end, verses, translation };
}
