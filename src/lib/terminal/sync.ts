/**
 * Pure helpers for the Bleibe-Terminal sync. No I/O, safe for unit tests.
 *
 * The terminal works offline and queues what the member does (day of a plan
 * read, chapter read). When it is online again it sends the queue; the server
 * applies the changes in the order they happened, with the device's time.
 */

/** Changes older than this are applied with this age at most (a device clock that is far off must not rewrite history). */
export const MAX_CHANGE_AGE_MS = 90 * 86_400_000;

/** Device time → server time: never in the future, never older than MAX_CHANGE_AGE_MS. Invalid input → now. */
export function clampChangeTime(iso: string, now: Date = new Date()): Date {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return now;
  const min = now.getTime() - MAX_CHANGE_AGE_MS;
  return new Date(Math.min(Math.max(t, min), now.getTime()));
}

/** Start (inclusive) and end (exclusive) of the UTC day of `date` – the reading log counts a chapter once per day. */
export function utcDayRange(date: Date): { start: Date; end: Date } {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  return { start, end: new Date(start.getTime() + 86_400_000) };
}

/** Chronological order (stable for equal times), so the last action on the same day wins. */
export function sortChanges<T extends { at: string }>(changes: readonly T[]): T[] {
  return changes
    .map((change, index) => ({ change, index, t: Date.parse(change.at) }))
    .sort((a, b) => (Number.isNaN(a.t) || Number.isNaN(b.t) || a.t === b.t ? a.index - b.index : a.t - b.t))
    .map((entry) => entry.change);
}

/** Best-effort id of an unparsable change, so the client can drop it from its queue. */
export function changeIdOf(item: unknown): string | null {
  if (!item || typeof item !== "object") return null;
  const id = (item as Record<string, unknown>).id;
  return typeof id === "string" && id.length <= 64 ? id : null;
}
