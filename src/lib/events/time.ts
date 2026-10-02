import { format, isSameDay } from "date-fns";
import { de } from "date-fns/locale";

/**
 * Time helpers for events. Dates are stored in UTC; members enter and read
 * them as wall-clock time in Europe/Berlin. Conversions use Intl only (no
 * extra packages), so they work however the server's own time zone is set.
 */

export const EVENT_TIME_ZONE = "Europe/Berlin";

/** Events without an explicit end are assumed to last this long (calendar export, "vorbei"). */
export const DEFAULT_EVENT_DURATION_MS = 2 * 60 * 60 * 1000;

export interface WallClock {
  year: number;
  month: number; // 1–12
  day: number;
  hour: number; // 0–23
  minute: number;
  second: number;
}

const formatters = new Map<string, Intl.DateTimeFormat>();

function partsFormatter(timeZone: string): Intl.DateTimeFormat {
  let f = formatters.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    formatters.set(timeZone, f);
  }
  return f;
}

/** The wall-clock components of `date` in `timeZone`. */
export function wallClock(date: Date, timeZone = EVENT_TIME_ZONE): WallClock {
  const parts = partsFormatter(timeZone).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((p) => p.type === type)?.value ?? Number.NaN);
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour") % 24,
    minute: get("minute"),
    second: get("second"),
  };
}

/** Milliseconds the zone is ahead of UTC at the given instant (e.g. +7 200 000 for CEST). */
function offsetMs(utcMs: number, timeZone: string): number {
  const w = wallClock(new Date(utcMs), timeZone);
  return Date.UTC(w.year, w.month - 1, w.day, w.hour, w.minute, w.second) - utcMs;
}

const LOCAL_RE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/;

/**
 * Parses an `<input type="datetime-local">` value ("2026-10-09T19:30") as wall-clock
 * time in `timeZone` and returns the UTC instant, or null for malformed or
 * impossible dates (31. Februar). Times inside a DST gap are moved forward.
 */
export function zonedLocalToUtc(local: string, timeZone = EVENT_TIME_ZONE): Date | null {
  const m = LOCAL_RE.exec(local.trim());
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const hour = Number(m[4]);
  const minute = Number(m[5]);
  const second = m[6] ? Number(m[6]) : 0;
  if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59 || second > 59) return null;
  const naive = Date.UTC(year, month - 1, day, hour, minute, second);
  const check = new Date(naive);
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) return null;
  // Two passes settle the offset across DST transitions.
  let utc = naive - offsetMs(naive, timeZone);
  utc = naive - offsetMs(utc, timeZone);
  return new Date(utc);
}

const pad2 = (n: number) => String(n).padStart(2, "0");

/** The value for an `<input type="datetime-local">` showing `date` in `timeZone`. */
export function utcToZonedLocal(date: Date, timeZone = EVENT_TIME_ZONE): string {
  const w = wallClock(date, timeZone);
  return `${w.year}-${pad2(w.month)}-${pad2(w.day)}T${pad2(w.hour)}:${pad2(w.minute)}`;
}

/**
 * A Date whose *local* components equal the wall clock of `date` in `timeZone`,
 * so date-fns `format` (which reads local time) prints Berlin time on any server.
 */
export function toWallClockDate(date: Date, timeZone = EVENT_TIME_ZONE): Date {
  const w = wallClock(date, timeZone);
  return new Date(w.year, w.month - 1, w.day, w.hour, w.minute, w.second);
}

const DATE_TIME = "EEE, d. MMM yyyy, HH:mm";

/** "Do., 9. Okt. 2026, 19:30–21:00 Uhr" (multi-day: "… Uhr – Fr., 10. Okt. 2026, 10:00 Uhr"). */
export function formatEventDate(startsAt: Date, endsAt?: Date | null, timeZone = EVENT_TIME_ZONE): string {
  const start = toWallClockDate(startsAt, timeZone);
  const base = format(start, DATE_TIME, { locale: de });
  if (!endsAt) return `${base} Uhr`;
  const end = toWallClockDate(endsAt, timeZone);
  if (isSameDay(start, end)) return `${base}–${format(end, "HH:mm")} Uhr`;
  return `${base} Uhr – ${format(end, DATE_TIME, { locale: de })} Uhr`;
}

/** "Freitag, 9. Oktober 2026" */
export function formatEventDay(date: Date, timeZone = EVENT_TIME_ZONE): string {
  return format(toWallClockDate(date, timeZone), "EEEE, d. MMMM yyyy", { locale: de });
}

/** "19:30" */
export function formatEventTime(date: Date, timeZone = EVENT_TIME_ZONE): string {
  return format(toWallClockDate(date, timeZone), "HH:mm");
}

export interface DateBlockParts {
  weekday: string; // "Fr."
  day: string; // "9"
  month: string; // "Okt."
  iso: string;
}

export function dateBlockParts(date: Date, timeZone = EVENT_TIME_ZONE): DateBlockParts {
  const w = toWallClockDate(date, timeZone);
  return {
    weekday: format(w, "EEE", { locale: de }),
    day: format(w, "d"),
    month: format(w, "MMM", { locale: de }),
    iso: date.toISOString(),
  };
}

/** "2026-10" – grouping key for list pages. */
export function monthKey(date: Date, timeZone = EVENT_TIME_ZONE): string {
  const w = wallClock(date, timeZone);
  return `${w.year}-${pad2(w.month)}`;
}

/** "Oktober 2026" */
export function monthLabel(date: Date, timeZone = EVENT_TIME_ZONE): string {
  return format(toWallClockDate(date, timeZone), "MMMM yyyy", { locale: de });
}

/** An event is over once its end (or, without an end, its start) has passed. */
export function isPastEvent(event: { startsAt: Date; endsAt: Date | null }, now: Date = new Date()): boolean {
  const end = event.endsAt ?? event.startsAt;
  return end.getTime() < now.getTime();
}
