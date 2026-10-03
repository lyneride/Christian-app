/**
 * Pure helpers for reading plans: parsing the stored readings, merging them
 * into readable labels, and computing progress. No I/O, no "server-only",
 * safe to import from client components and unit tests.
 *
 * A plan is deliberately flexible: there is no calendar and no streak. The
 * "current day" is simply the first day that has not been completed yet.
 */
import { BOOKS, getBookByNumber } from "@/lib/bible/books";
import { formatReference, referencePath, type Locale } from "@/lib/bible/reference";
import type { PlanCategory, Reading } from "./generate";

export type { Reading } from "./generate";

/* ------------------------------------------------------------------ */
/* Categories                                                           */
/* ------------------------------------------------------------------ */

export const CATEGORY_ORDER: readonly PlanCategory[] = [
  "eigen",
  "einstieg",
  "thema",
  "buch",
  "neues-testament",
  "altes-testament",
  "ganze-bibel",
];

export const CATEGORY_LABELS: Record<PlanCategory, string> = {
  "ganze-bibel": "Ganze Bibel",
  "neues-testament": "Neues Testament",
  "altes-testament": "Altes Testament",
  einstieg: "Einstieg",
  thema: "Thema",
  buch: "Ein Buch",
  eigen: "Eigene Pläne",
};

export function isPlanCategory(value: unknown): value is PlanCategory {
  return typeof value === "string" && value in CATEGORY_LABELS;
}

/** Label for a category stored in the database (unknown values fall back to "Weitere"). */
export function categoryLabel(category: string): string {
  return isPlanCategory(category) ? CATEGORY_LABELS[category] : "Weitere";
}

/* ------------------------------------------------------------------ */
/* Readings                                                             */
/* ------------------------------------------------------------------ */

function isPositiveInt(v: unknown): v is number {
  return typeof v === "number" && Number.isInteger(v) && v >= 1;
}

/** Parses the JSON stored in `PlanDay.readings`; malformed entries are dropped. */
export function parseReadings(json: string | null | undefined): Reading[] {
  if (!json) return [];
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];
  const out: Reading[] = [];
  for (const item of data) {
    if (!item || typeof item !== "object") continue;
    const { book, chapter, verseStart, verseEnd } = item as Record<string, unknown>;
    if (!isPositiveInt(book) || book > BOOKS.length || !isPositiveInt(chapter)) continue;
    const reading: Reading = { book, chapter };
    if (isPositiveInt(verseStart)) {
      reading.verseStart = verseStart;
      if (isPositiveInt(verseEnd) && verseEnd >= verseStart) reading.verseEnd = verseEnd;
    }
    out.push(reading);
  }
  return out;
}

export function isFullChapter(reading: Reading): boolean {
  return reading.verseStart === undefined;
}

/** A span of consecutive full chapters of one book, or a single (partial) chapter. */
export interface ReadingSpan {
  book: number;
  chapterStart: number;
  chapterEnd: number;
  verseStart?: number;
  verseEnd?: number;
}

function toSpan(reading: Reading): ReadingSpan {
  const span: ReadingSpan = { book: reading.book, chapterStart: reading.chapter, chapterEnd: reading.chapter };
  if (reading.verseStart !== undefined) {
    span.verseStart = reading.verseStart;
    if (reading.verseEnd !== undefined) span.verseEnd = reading.verseEnd;
  }
  return span;
}

/** Merges consecutive full chapters of the same book: 1. Mose 1, 2, 3 → "1. Mose 1–3". */
export function mergeReadings(readings: readonly Reading[]): ReadingSpan[] {
  const spans: ReadingSpan[] = [];
  for (const reading of readings) {
    const last = spans[spans.length - 1];
    if (
      last &&
      isFullChapter(reading) &&
      last.verseStart === undefined &&
      last.book === reading.book &&
      reading.chapter === last.chapterEnd + 1
    ) {
      last.chapterEnd = reading.chapter;
      continue;
    }
    spans.push(toSpan(reading));
  }
  return spans;
}

/** "1. Mose 1–2", "Johannes 3,1-21", "Psalmen 23" */
export function spanLabel(span: ReadingSpan, locale: Locale = "de"): string {
  const book = getBookByNumber(span.book);
  if (!book) return `Buch ${span.book}, Kapitel ${span.chapterStart}`;
  if (span.chapterEnd > span.chapterStart) return `${book.name[locale]} ${span.chapterStart}–${span.chapterEnd}`;
  return formatReference({ book, chapter: span.chapterStart, verseStart: span.verseStart, verseEnd: span.verseEnd }, locale);
}

/** Label of a single reading (whole chapter or verse range). */
export function readingLabel(reading: Reading, locale: Locale = "de"): string {
  return spanLabel(toSpan(reading), locale);
}

/** All readings of a day as one string: "1. Mose 1–2; Matthäus 1". */
export function readingsLabel(readings: readonly Reading[], locale: Locale = "de"): string {
  return mergeReadings(readings)
    .map((span) => spanLabel(span, locale))
    .join("; ");
}

/** Reader link for a span (a multi-chapter span opens at its first chapter). */
export function spanPath(span: ReadingSpan, translation?: string): string | null {
  const book = getBookByNumber(span.book);
  if (!book) return null;
  return referencePath({ book, chapter: span.chapterStart, verseStart: span.verseStart, verseEnd: span.verseEnd }, translation);
}

/** Distinct whole chapters of a reading list (what goes into the ReadingLog). */
export function fullChapters(readings: readonly Reading[]): { book: number; chapter: number }[] {
  const seen = new Set<string>();
  const out: { book: number; chapter: number }[] = [];
  for (const r of readings) {
    if (!isFullChapter(r)) continue;
    const key = `${r.book}:${r.chapter}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ book: r.book, chapter: r.chapter });
  }
  return out;
}

/** "1189 Kapitel" or "7 Abschnitte" – a plan's size in its own unit. */
export function readingsSummary(days: readonly (readonly Reading[])[]): string {
  const all = days.flat();
  if (all.every(isFullChapter)) {
    const n = new Set(all.map((r) => `${r.book}:${r.chapter}`)).size;
    return `${n} Kapitel`;
  }
  return `${all.length} ${all.length === 1 ? "Abschnitt" : "Abschnitte"}`;
}

/* ------------------------------------------------------------------ */
/* Progress                                                             */
/* ------------------------------------------------------------------ */

/** First day that is not completed yet, or null when every day is done. */
export function nextOpenDay(completedDays: readonly number[], dayCount: number): number | null {
  if (dayCount <= 0) return null;
  const done = new Set(completedDays);
  for (let day = 1; day <= dayCount; day++) if (!done.has(day)) return day;
  return null;
}

/** Completed share in whole percent, clamped to 0 … 100. */
export function percent(completed: number, dayCount: number): number {
  if (dayCount <= 0) return 0;
  return Math.round(Math.min(Math.max(completed / dayCount, 0), 1) * 100);
}

function sameLocalDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/**
 * When the plan ends if one day is read per day from now on. The next open
 * day counts for today unless something was already read today; `null` when
 * the plan is finished.
 */
export function estimatedFinish(
  completed: number,
  dayCount: number,
  options: { today?: Date; lastCompletedAt?: Date | null } = {},
): Date | null {
  const remaining = dayCount - completed;
  if (remaining <= 0) return null;
  const today = options.today ?? new Date();
  const readToday = options.lastCompletedAt ? sameLocalDay(options.lastCompletedAt, today) : false;
  const offset = readToday ? remaining : remaining - 1;
  return new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
}

/** Groups day numbers into weeks of `perWeek` days: [{ week: 1, days: [1..7] }, …]. */
export function weeksOf(dayCount: number, perWeek = 7): { week: number; days: number[] }[] {
  const weeks: { week: number; days: number[] }[] = [];
  for (let start = 1; start <= dayCount; start += perWeek) {
    const end = Math.min(start + perWeek - 1, dayCount);
    weeks.push({ week: weeks.length + 1, days: Array.from({ length: end - start + 1 }, (_, i) => start + i) });
  }
  return weeks;
}

/** Warm, unpressured line for the progress card. Never mentions missed days. */
export function encouragement(completed: number, dayCount: number): string {
  if (dayCount <= 0) return "";
  if (completed >= dayCount) return "Geschafft – du hast den ganzen Plan gelesen.";
  if (completed === 0) return "Ein guter Anfang: Tag 1 wartet auf dich.";
  const p = completed / dayCount;
  if (p < 0.25) return "Schön, dass du dabei bist. Jeder Tag zählt.";
  if (p < 0.5) return "Du bist gut unterwegs.";
  if (p < 0.75) return "Mehr als die Hälfte liegt hinter dir.";
  if (dayCount - completed === 1) return "Nur noch ein Tag – fast geschafft.";
  return "Nur noch ein kleines Stück.";
}

export type PlanStatus = "active" | "finished" | "archived";

export function planStatus(sub: { completedAt: Date | null; archivedAt: Date | null }): PlanStatus {
  if (sub.archivedAt) return "archived";
  if (sub.completedAt) return "finished";
  return "active";
}
