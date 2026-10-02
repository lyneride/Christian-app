import { describe, expect, it } from "vitest";
import { BOOKS } from "@/lib/bible/books";
import { distribute, generatePlans } from "./generate";

describe("distribute", () => {
  it("splits into contiguous, nearly equal groups covering everything", () => {
    const items = Array.from({ length: 10 }, (_, i) => ({ book: 1, chapter: i + 1 }));
    const days = distribute(items, 4);
    expect(days).toHaveLength(4);
    expect(days.flat()).toEqual(items);
    const sizes = days.map((d) => d.length);
    expect(Math.max(...sizes) - Math.min(...sizes)).toBeLessThanOrEqual(1);
  });
  it("handles more days than items", () => {
    const days = distribute([{ book: 1, chapter: 1 }], 3);
    expect(days.flat()).toHaveLength(1);
  });
});

describe("generatePlans", () => {
  const plans = generatePlans();
  it("has unique slugs and non-empty days", () => {
    const slugs = plans.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const p of plans) {
      expect(p.days.length).toBeGreaterThan(0);
      for (const day of p.days) expect(day.length).toBeGreaterThan(0);
    }
  });
  it("bible in a year covers all 1189 chapters exactly once", () => {
    const plan = plans.find((p) => p.slug === "bibel-in-einem-jahr")!;
    expect(plan.days).toHaveLength(365);
    const all = plan.days.flat();
    expect(all).toHaveLength(1189);
    const keys = new Set(all.map((r) => `${r.book}:${r.chapter}`));
    expect(keys.size).toBe(1189);
    // every day has an OT reading; the 260 NT chapters are spread over ≥ 70 % of the days
    for (const day of plan.days) expect(day.some((r) => r.book <= 39)).toBe(true);
    const ntDays = plan.days.filter((day) => day.some((r) => r.book >= 40)).length;
    expect(ntDays / plan.days.length).toBeGreaterThanOrEqual(0.7);
  });
  it("references only existing chapters", () => {
    for (const p of plans) {
      for (const r of p.days.flat()) {
        const book = BOOKS[r.book - 1];
        expect(book, `${p.slug} book ${r.book}`).toBeDefined();
        expect(r.chapter).toBeGreaterThanOrEqual(1);
        expect(r.chapter, `${p.slug} ${book.id} ${r.chapter}`).toBeLessThanOrEqual(book.chapters);
      }
    }
  });
  it("psalms and proverbs plan covers all psalms", () => {
    const plan = plans.find((p) => p.slug === "psalmen-und-sprueche-in-einem-monat")!;
    const psalms = plan.days.flat().filter((r) => r.book === 19).map((r) => r.chapter);
    expect(new Set(psalms).size).toBe(150);
  });
});
