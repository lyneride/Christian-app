import { format, isSameDay, isToday, isYesterday } from "date-fns";
import { de } from "date-fns/locale";

/**
 * Pure helpers for the messaging UI (no database access, unit-tested).
 */

export const PREVIEW_MAX = 80;

/** One-line plain-text preview of a message body (whitespace collapsed, cut at a word boundary). */
export function messagePreview(body: string, max = PREVIEW_MAX): string {
  const text = body.replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const atWord = cut.replace(/\s+\S*$/, "").trimEnd();
  return (atWord.length >= max / 2 ? atWord : cut.trimEnd()) + " …";
}

/** "Heute", "Gestern", "Montag, 2. Oktober" (this year) or "2. Oktober 2025". */
export function dayLabel(date: Date, now: Date = new Date()): string {
  if (isToday(date)) return "Heute";
  if (isYesterday(date)) return "Gestern";
  const pattern = date.getFullYear() === now.getFullYear() ? "EEEE, d. MMMM" : "d. MMMM yyyy";
  return format(date, pattern, { locale: de });
}

/** "14:05" */
export function timeLabel(date: Date): string {
  return format(date, "HH:mm");
}

export interface DayGroup<T> {
  key: string;
  label: string;
  items: T[];
}

/** Groups chronologically sorted items into consecutive runs of the same calendar day. */
export function groupByDay<T extends { createdAt: Date }>(items: T[], now: Date = new Date()): DayGroup<T>[] {
  const groups: DayGroup<T>[] = [];
  for (const item of items) {
    const last = groups[groups.length - 1];
    if (last && isSameDay(last.items[0]!.createdAt, item.createdAt)) {
      last.items.push(item);
    } else {
      groups.push({ key: format(item.createdAt, "yyyy-MM-dd"), label: dayLabel(item.createdAt, now), items: [item] });
    }
  }
  return groups;
}

/** Parses the `?vor=` cursor (ISO timestamp) for loading older messages. */
export function parseBefore(value: string | string[] | undefined): Date | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return undefined;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

/** Label for the unread badge, e.g. "3 ungelesene Nachrichten". */
export function unreadLabel(count: number): string {
  return count === 1 ? "1 ungelesene Nachricht" : `${count} ungelesene Nachrichten`;
}
