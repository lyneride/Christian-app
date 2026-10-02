import { describe, expect, it } from "vitest";
import {
  dailyVerseIndex,
  getAdjacentChapters,
  getChapter,
  getCrossReferences,
  getVerse,
  getVerseOfTheDay,
  listTranslations,
  resolveTranslationId,
  searchVerses,
} from "./data";

describe("bible data", () => {
  it("lists translations ordered with the default first", async () => {
    const t = await listTranslations();
    expect(t.length).toBeGreaterThanOrEqual(5);
    expect(t[0].id).toBe("LUT1912");
    expect(await resolveTranslationId("elb1905")).toBe("ELB1905");
    expect(await resolveTranslationId("nope")).toBe("LUT1912");
  });

  it("loads a chapter", async () => {
    const ch = await getChapter("LUT1912", 43, 3);
    expect(ch?.verses).toHaveLength(36);
    expect(ch?.verses[15].text).toContain("Also hat Gott die Welt geliebt");
    expect(ch?.chapterCount).toBe(21);
    expect(await getChapter("LUT1912", 43, 99)).toBeNull();
  });

  it("gets single verses in every translation", async () => {
    for (const id of ["LUT1912", "ELB1905", "SCH1951", "LUT1545", "BSB", "KJV"]) {
      const v = await getVerse(id, 43, 3, 16);
      expect(v?.text.length).toBeGreaterThan(50);
    }
  });

  it("navigates across book boundaries", async () => {
    expect(await getAdjacentChapters("LUT1912", 1, 1)).toEqual({ prev: null, next: { book: 1, chapter: 2 } });
    expect(await getAdjacentChapters("LUT1912", 1, 50)).toEqual({ prev: { book: 1, chapter: 49 }, next: { book: 2, chapter: 1 } });
    expect(await getAdjacentChapters("LUT1912", 66, 22)).toEqual({ prev: { book: 66, chapter: 21 }, next: null });
  });

  it("searches diacritic-insensitively with highlighting", async () => {
    const { hits, total } = await searchVerses("LUT1912", "liebe gott", { limit: 5 });
    expect(total).toBeGreaterThan(10);
    expect(hits).toHaveLength(5);
    expect(hits[0].snippet).toContain("<mark>");
    const phrase = await searchVerses("LUT1912", '"Fürchte dich nicht"', { limit: 3, testament: "OT" });
    expect(phrase.total).toBeGreaterThan(5);
    expect(phrase.hits.every((h) => h.book <= 39)).toBe(true);
  });

  it("returns cross references", async () => {
    const refs = await getCrossReferences(43, 3, 16);
    expect(refs.length).toBeGreaterThan(5);
    expect(refs[0].votes).toBeGreaterThanOrEqual(refs[1].votes);
  });

  it("verse of the day is deterministic per day", async () => {
    const a = dailyVerseIndex(new Date("2026-10-02T08:00:00Z"));
    const b = dailyVerseIndex(new Date("2026-10-02T22:00:00Z"));
    expect(a).toBe(b);
    const votd = await getVerseOfTheDay("LUT1912", new Date("2026-10-02T08:00:00Z"));
    expect(votd.verses.length).toBeGreaterThan(0);
  });
});
