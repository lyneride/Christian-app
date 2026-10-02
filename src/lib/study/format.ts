/**
 * Pure date/label helpers for the study pages (no I/O, unit-tested).
 */
import { format } from "date-fns";
import { de } from "date-fns/locale";

/** Local Date at noon for a "YYYY-MM-DD" string (noon avoids DST/UTC day shifts when formatting). */
export function dateFromString(date: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 12, 0, 0, 0);
}

/** "Freitag, 2. Oktober 2026" */
export function formatJournalDate(date: string, pattern = "EEEE, d. MMMM yyyy"): string {
  return format(dateFromString(date), pattern, { locale: de });
}

/** "Oktober 2026" for "2026-10" */
export function monthLabel(month: string): string {
  return format(dateFromString(`${month}-01`), "LLLL yyyy", { locale: de });
}

/** Local "YYYY-MM-DD" of `now`. */
export function toDateString(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** "Diese Woche: 5 Kapitel" – progress without streak pressure. */
export function weekSummary(count: number): string {
  return `Diese Woche: ${count} ${count === 1 ? "Kapitel" : "Kapitel"}`;
}

/** "12 von 1189 Kapiteln gelesen" */
export function chaptersSummary(read: number, total: number): string {
  return `${read} von ${total} Kapiteln gelesen`;
}

/** "3 Verse sind heute dran" / "Ein Vers ist heute dran" / "Heute ist nichts dran" */
export function dueSummary(count: number): string {
  if (count === 0) return "Heute ist nichts dran.";
  if (count === 1) return "Ein Vers ist heute dran.";
  return `${count} Verse sind heute dran.`;
}
