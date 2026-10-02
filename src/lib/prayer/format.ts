/**
 * Pure helpers for the prayer wall (no database access, unit-tested).
 */

/** "YYYY-MM-DD" in UTC – the key used for PrayerSupport.day (one support per person and day). */
export function todayKey(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/** Start of the UTC day a `todayKey()` value describes. */
export function dayStart(day: string): Date {
  return new Date(`${day}T00:00:00.000Z`);
}

/**
 * Warm, unpressured wording for the support counter:
 * total = distinct people who have prayed at all, today = people who prayed today.
 */
export function supportSummary({ total, today }: { total: number; today: number }): string {
  if (total === 0) return "Bisher hat noch niemand mitgebetet.";
  const todayText =
    today === 0 ? "" : today === 1 ? "Heute hat eine Person gebetet" : `Heute haben ${today} Menschen gebetet`;
  const totalText = total === 1 ? "eine Person insgesamt" : `${total} Menschen insgesamt`;
  if (!todayText) return total === 1 ? "Eine Person hat mitgebetet." : `${total} Menschen haben mitgebetet.`;
  return `${todayText} · ${totalText}.`;
}

/** "und 4 weitere" for the supporter list. */
export function moreSupportersLabel(hidden: number): string | null {
  if (hidden <= 0) return null;
  return hidden === 1 ? "und eine weitere Person" : `und ${hidden} weitere`;
}
