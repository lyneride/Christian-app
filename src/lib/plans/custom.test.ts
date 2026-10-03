import { describe, expect, it } from "vitest";
import { buildCustomPlan, normalizeRange, rangeLabel, rangesToReadings } from "./custom";

describe("normalizeRange", () => {
  it("clamps chapters to the book and orders from/to", () => {
    expect(normalizeRange({ book: 43, from: 30, to: 2 })).toEqual({ book: 43, from: 2, to: 21 });
    expect(normalizeRange({ book: 43 })).toEqual({ book: 43, from: 1, to: 21 });
    expect(normalizeRange({ book: 99, from: 1, to: 2 })).toBeNull();
  });
});

describe("buildCustomPlan", () => {
  it("spreads the chapters over the days without empty days", () => {
    const plan = buildCustomPlan({ ranges: [{ book: 43, from: 1, to: 21 }], days: 7 });
    expect(plan).not.toBeNull();
    expect(plan!.days).toHaveLength(7);
    expect(plan!.days.every((d) => d.length === 3)).toBe(true);
    expect(plan!.preview.pace).toBe("3 Kapitel pro Tag");
    expect(plan!.preview.title).toBe("Johannes");
  });
  it("never creates more days than chapters", () => {
    const plan = buildCustomPlan({ ranges: [{ book: 57, from: 1, to: 1 }], days: 30 });
    expect(plan!.days).toHaveLength(1);
    expect(plan!.preview.description).toBe("Philemon in 1 Tag – 1 Kapitel pro Tag.");
  });
  it("joins several ranges in order", () => {
    const readings = rangesToReadings([
      { book: 19, from: 1, to: 3 },
      { book: 45, from: 8, to: 8 },
    ]);
    expect(readings).toEqual([
      { book: 19, chapter: 1 },
      { book: 19, chapter: 2 },
      { book: 19, chapter: 3 },
      { book: 45, chapter: 8 },
    ]);
    expect(rangeLabel({ book: 45, from: 8, to: 8 })).toBe("Römer 8");
    expect(rangeLabel({ book: 19, from: 1, to: 3 })).toBe("Psalmen 1–3");
  });
  it("returns null without chapters", () => {
    expect(buildCustomPlan({ ranges: [], days: 5 })).toBeNull();
  });
});
