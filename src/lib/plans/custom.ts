/**
 * Self-made reading plans: "read these chapters in N days".
 * Pure helpers (no database) so the form preview and the server action
 * share one source of truth.
 */
import { BOOKS, getBookByNumber } from "@/lib/bible/books";
import { distribute, type Reading } from "./generate";

export interface ChapterRange {
  /** canonical book number 1–66 */
  book: number;
  /** first chapter (1-based, inclusive) */
  from: number;
  /** last chapter (inclusive) */
  to: number;
}

export const MAX_RANGES = 12;
export const MAX_DAYS = 730;

/** Clamps a range to the book's chapter count and orders from ≤ to; unknown books are dropped. */
export function normalizeRange(range: Partial<ChapterRange>): ChapterRange | null {
  const book = getBookByNumber(Number(range.book));
  if (!book) return null;
  const clamp = (n: unknown, fallback: number) => {
    const v = Math.trunc(Number(n));
    return Number.isFinite(v) && v >= 1 ? Math.min(v, book.chapters) : fallback;
  };
  let from = clamp(range.from, 1);
  let to = clamp(range.to, book.chapters);
  if (from > to) [from, to] = [to, from];
  return { book: book.number, from, to };
}

/** Expands the ranges to an ordered list of whole chapters. */
export function rangesToReadings(ranges: readonly ChapterRange[]): Reading[] {
  const out: Reading[] = [];
  for (const r of ranges) {
    for (let chapter = r.from; chapter <= r.to; chapter++) out.push({ book: r.book, chapter });
  }
  return out;
}

export function rangeLabel(range: ChapterRange): string {
  const book = getBookByNumber(range.book);
  if (!book) return "";
  if (range.from === 1 && range.to === book.chapters) return book.name.de;
  return range.from === range.to ? `${book.name.de} ${range.from}` : `${book.name.de} ${range.from}–${range.to}`;
}

export function rangesLabel(ranges: readonly ChapterRange[]): string {
  return ranges.map(rangeLabel).filter(Boolean).join(", ");
}

export interface CustomPlanDraft {
  ranges: ChapterRange[];
  days: number;
}

export interface CustomPlanPreview {
  chapterCount: number;
  days: number;
  perDay: number;
  /** e.g. "1–2 Kapitel pro Tag" */
  pace: string;
  minutesPerDay: number;
  title: string;
  description: string;
}

/** Builds the daily readings; days beyond the chapter count are collapsed so no day is empty. */
export function buildCustomPlan(draft: CustomPlanDraft): { days: Reading[][]; preview: CustomPlanPreview } | null {
  const ranges = draft.ranges.map(normalizeRange).filter((r): r is ChapterRange => r !== null).slice(0, MAX_RANGES);
  const readings = rangesToReadings(ranges);
  if (readings.length === 0) return null;
  const wanted = Math.trunc(Number(draft.days));
  const days = Math.max(1, Math.min(Number.isFinite(wanted) ? wanted : 1, MAX_DAYS, readings.length));
  const perDay = readings.length / days;
  const lo = Math.floor(perDay);
  const hi = Math.ceil(perDay);
  const pace = lo === hi ? `${lo} ${lo === 1 ? "Kapitel" : "Kapitel"} pro Tag` : `${lo}–${hi} Kapitel pro Tag`;
  const title = rangesLabel(ranges);
  return {
    days: distribute(readings, days),
    preview: {
      chapterCount: readings.length,
      days,
      perDay,
      pace,
      minutesPerDay: Math.max(3, Math.min(60, Math.round(perDay * 4))),
      title,
      description: `${title} in ${days} ${days === 1 ? "Tag" : "Tagen"} – ${pace}.`,
    },
  };
}

/** Books for the picker, in canonical order. */
export const BOOK_OPTIONS = BOOKS.map((b) => ({ number: b.number, name: b.name.de, chapters: b.chapters, testament: b.testament }));
