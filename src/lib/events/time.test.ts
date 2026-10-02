import { describe, expect, it } from "vitest";
import {
  dateBlockParts,
  formatEventDate,
  formatEventDay,
  formatEventTime,
  isPastEvent,
  monthKey,
  monthLabel,
  toWallClockDate,
  utcToZonedLocal,
  wallClock,
  zonedLocalToUtc,
} from "./time";

describe("zonedLocalToUtc", () => {
  it("interprets datetime-local values as Europe/Berlin (CEST and CET)", () => {
    expect(zonedLocalToUtc("2026-10-09T19:30")?.toISOString()).toBe("2026-10-09T17:30:00.000Z");
    expect(zonedLocalToUtc("2026-12-09T19:30")?.toISOString()).toBe("2026-12-09T18:30:00.000Z");
    expect(zonedLocalToUtc("2026-01-01T00:00:30")?.toISOString()).toBe("2025-12-31T23:00:30.000Z");
  });

  it("handles the DST switch days", () => {
    // 29.03.2026: 02:00 → 03:00. 01:30 is still CET, 03:30 already CEST.
    expect(zonedLocalToUtc("2026-03-29T01:30")?.toISOString()).toBe("2026-03-29T00:30:00.000Z");
    expect(zonedLocalToUtc("2026-03-29T03:30")?.toISOString()).toBe("2026-03-29T01:30:00.000Z");
    // Inside the gap: moved forward, never null.
    expect(zonedLocalToUtc("2026-03-29T02:30")?.toISOString()).toBe("2026-03-29T01:30:00.000Z");
    // 25.10.2026: 03:00 → 02:00. 04:00 is CET again.
    expect(zonedLocalToUtc("2026-10-25T04:00")?.toISOString()).toBe("2026-10-25T03:00:00.000Z");
  });

  it("rejects malformed and impossible values", () => {
    expect(zonedLocalToUtc("")).toBeNull();
    expect(zonedLocalToUtc("2026-10-09")).toBeNull();
    expect(zonedLocalToUtc("09.10.2026 19:30")).toBeNull();
    expect(zonedLocalToUtc("2026-13-01T10:00")).toBeNull();
    expect(zonedLocalToUtc("2026-02-30T10:00")).toBeNull();
    expect(zonedLocalToUtc("2026-10-09T24:00")).toBeNull();
    expect(zonedLocalToUtc("2026-10-09T19:60")).toBeNull();
  });

  it("round-trips with utcToZonedLocal", () => {
    for (const local of ["2026-10-09T19:30", "2026-12-24T18:00", "2027-07-01T09:05"]) {
      expect(utcToZonedLocal(zonedLocalToUtc(local)!)).toBe(local);
    }
  });
});

describe("wallClock / toWallClockDate", () => {
  it("returns Berlin components regardless of the server zone", () => {
    const w = wallClock(new Date("2026-10-09T17:30:00Z"));
    expect(w).toEqual({ year: 2026, month: 10, day: 9, hour: 19, minute: 30, second: 0 });
    expect(wallClock(new Date("2026-12-31T23:30:00Z")).year).toBe(2027);
    const d = toWallClockDate(new Date("2026-10-09T17:30:00Z"));
    expect([d.getHours(), d.getMinutes(), d.getDate()]).toEqual([19, 30, 9]);
  });
});

describe("formatEventDate", () => {
  const start = new Date("2026-10-08T17:30:00Z"); // Do., 9. Okt.? No – 8.10.2026 is a Thursday.

  it("prints weekday, date and time range in German", () => {
    expect(formatEventDate(start, new Date("2026-10-08T19:00:00Z"))).toBe("Do., 8. Okt. 2026, 19:30–21:00 Uhr");
  });

  it("omits the range without an end", () => {
    expect(formatEventDate(start)).toBe("Do., 8. Okt. 2026, 19:30 Uhr");
    expect(formatEventDate(start, null)).toBe("Do., 8. Okt. 2026, 19:30 Uhr");
  });

  it("prints both dates for multi-day events", () => {
    expect(formatEventDate(start, new Date("2026-10-10T08:00:00Z"))).toBe(
      "Do., 8. Okt. 2026, 19:30 Uhr – Sa., 10. Okt. 2026, 10:00 Uhr",
    );
  });

  it("uses Berlin time for the other formatters too", () => {
    expect(formatEventTime(start)).toBe("19:30");
    expect(formatEventDay(start)).toBe("Donnerstag, 8. Oktober 2026");
    expect(dateBlockParts(start)).toEqual({ weekday: "Do.", day: "8", month: "Okt.", iso: "2026-10-08T17:30:00.000Z" });
    expect(monthKey(new Date("2026-10-31T23:30:00Z"))).toBe("2026-11");
    expect(monthLabel(new Date("2026-10-31T23:30:00Z"))).toBe("November 2026");
  });
});

describe("isPastEvent", () => {
  const now = new Date("2026-10-09T12:00:00Z");
  it("uses the end when present, otherwise the start", () => {
    expect(isPastEvent({ startsAt: new Date("2026-10-09T10:00:00Z"), endsAt: new Date("2026-10-09T13:00:00Z") }, now)).toBe(false);
    expect(isPastEvent({ startsAt: new Date("2026-10-09T10:00:00Z"), endsAt: new Date("2026-10-09T11:00:00Z") }, now)).toBe(true);
    expect(isPastEvent({ startsAt: new Date("2026-10-09T10:00:00Z"), endsAt: null }, now)).toBe(true);
    expect(isPastEvent({ startsAt: new Date("2026-10-09T14:00:00Z"), endsAt: null }, now)).toBe(false);
  });
});
