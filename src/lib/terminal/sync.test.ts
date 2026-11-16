import { describe, expect, it } from "vitest";
import { changeIdOf, clampChangeTime, MAX_CHANGE_AGE_MS, sortChanges, utcDayRange } from "./sync";
import { terminalChangeSchema, terminalLoginSchema, terminalSyncSchema } from "@/lib/validation/terminal";

const NOW = new Date("2026-11-16T12:00:00.000Z");

describe("clampChangeTime", () => {
  it("keeps a plausible device time", () => {
    expect(clampChangeTime("2026-11-15T08:30:00Z", NOW).toISOString()).toBe("2026-11-15T08:30:00.000Z");
    expect(clampChangeTime("2026-11-15T09:30:00+01:00", NOW).toISOString()).toBe("2026-11-15T08:30:00.000Z");
  });

  it("never lies in the future", () => {
    expect(clampChangeTime("2027-01-01T00:00:00Z", NOW).toISOString()).toBe(NOW.toISOString());
  });

  it("caps very old times", () => {
    expect(clampChangeTime("2020-01-01T00:00:00Z", NOW).getTime()).toBe(NOW.getTime() - MAX_CHANGE_AGE_MS);
  });

  it("falls back to now for garbage", () => {
    expect(clampChangeTime("gestern", NOW).toISOString()).toBe(NOW.toISOString());
  });
});

describe("utcDayRange", () => {
  it("spans exactly one UTC day", () => {
    const { start, end } = utcDayRange(new Date("2026-11-16T23:59:59.000Z"));
    expect(start.toISOString()).toBe("2026-11-16T00:00:00.000Z");
    expect(end.toISOString()).toBe("2026-11-17T00:00:00.000Z");
  });
});

describe("sortChanges", () => {
  it("orders by time and keeps the order of equal times", () => {
    const a = { id: "a", at: "2026-11-16T10:00:00Z" };
    const b = { id: "b", at: "2026-11-16T09:00:00Z" };
    const c = { id: "c", at: "2026-11-16T10:00:00Z" };
    expect(sortChanges([a, b, c]).map((x) => x.id)).toEqual(["b", "a", "c"]);
  });
});

describe("changeIdOf", () => {
  it("reads the id of a broken change", () => {
    expect(changeIdOf({ id: "abc-123", type: "nonsense" })).toBe("abc-123");
    expect(changeIdOf(null)).toBeNull();
    expect(changeIdOf({ id: 5 })).toBeNull();
  });
});

describe("terminal validation", () => {
  it("accepts a plan day and a chapter change", () => {
    expect(
      terminalChangeSchema.safeParse({
        id: "9F2C1E7A-1B2C-4D5E-8F90-1234567890AB",
        type: "planDay",
        planId: "cmabc123def456ghi789jkl0",
        day: 3,
        done: true,
        at: "2026-11-16T07:15:00Z",
      }).success,
    ).toBe(true);
    expect(
      terminalChangeSchema.safeParse({
        id: "9F2C1E7A-1B2C-4D5E-8F90-1234567890AC",
        type: "chapter",
        book: 43,
        chapter: 3,
        translation: "LUT1912",
        at: "2026-11-16T07:15:00.123Z",
      }).success,
    ).toBe(true);
  });

  it("rejects impossible values", () => {
    const base = { id: "9F2C1E7A-1B2C", type: "chapter", translation: "LUT1912", at: "2026-11-16T07:15:00Z" };
    expect(terminalChangeSchema.safeParse({ ...base, book: 67, chapter: 1 }).success).toBe(false);
    expect(terminalChangeSchema.safeParse({ ...base, book: 1, chapter: 0 }).success).toBe(false);
    expect(terminalChangeSchema.safeParse({ ...base, book: 1, chapter: 1, at: "heute" }).success).toBe(false);
    expect(terminalChangeSchema.safeParse({ ...base, id: "x;drop", book: 1, chapter: 1 }).success).toBe(false);
  });

  it("limits the batch size", () => {
    expect(terminalSyncSchema.safeParse({ changes: [] }).success).toBe(true);
    expect(terminalSyncSchema.safeParse({}).success).toBe(true);
    expect(terminalSyncSchema.safeParse({ changes: Array.from({ length: 501 }, () => ({})) }).success).toBe(false);
  });

  it("needs e-mail and password to sign in", () => {
    expect(terminalLoginSchema.safeParse({ email: "kolja@example.org", password: "geheim", device: "iPhone 8" }).success).toBe(true);
    expect(terminalLoginSchema.safeParse({ email: "kein-mail", password: "geheim" }).success).toBe(false);
    expect(terminalLoginSchema.safeParse({ email: "kolja@example.org", password: "" }).success).toBe(false);
  });
});
