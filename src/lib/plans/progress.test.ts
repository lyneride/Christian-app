import { describe, expect, it } from "vitest";
import {
  categoryLabel,
  encouragement,
  estimatedFinish,
  fullChapters,
  mergeReadings,
  nextOpenDay,
  parseReadings,
  percent,
  planStatus,
  readingLabel,
  readingsLabel,
  readingsSummary,
  spanLabel,
  spanPath,
  weeksOf,
} from "./progress";

describe("parseReadings", () => {
  it("parses the stored JSON and keeps optional verse ranges", () => {
    const json = JSON.stringify([
      { book: 1, chapter: 1 },
      { book: 43, chapter: 3, verseStart: 1, verseEnd: 21 },
    ]);
    expect(parseReadings(json)).toEqual([
      { book: 1, chapter: 1 },
      { book: 43, chapter: 3, verseStart: 1, verseEnd: 21 },
    ]);
  });
  it("drops malformed entries and tolerates broken JSON", () => {
    expect(parseReadings("not json")).toEqual([]);
    expect(parseReadings('{"book":1}')).toEqual([]);
    expect(parseReadings("")).toEqual([]);
    expect(parseReadings(undefined)).toEqual([]);
    const json = JSON.stringify([
      { book: 0, chapter: 1 },
      { book: 67, chapter: 1 },
      { book: 1, chapter: "2" },
      null,
      { book: 19, chapter: 23, verseStart: 5, verseEnd: 2 },
      { book: 19, chapter: 23, verseStart: 1.5 },
    ]);
    expect(parseReadings(json)).toEqual([{ book: 19, chapter: 23, verseStart: 5 }, { book: 19, chapter: 23 }]);
  });
});

describe("mergeReadings", () => {
  it("merges consecutive full chapters of one book", () => {
    const spans = mergeReadings([
      { book: 1, chapter: 1 },
      { book: 1, chapter: 2 },
      { book: 1, chapter: 3 },
      { book: 40, chapter: 1 },
    ]);
    expect(spans).toEqual([
      { book: 1, chapterStart: 1, chapterEnd: 3 },
      { book: 40, chapterStart: 1, chapterEnd: 1 },
    ]);
  });
  it("does not merge gaps, book changes or verse ranges", () => {
    const spans = mergeReadings([
      { book: 19, chapter: 1 },
      { book: 19, chapter: 3 },
      { book: 19, chapter: 4, verseStart: 1, verseEnd: 5 },
      { book: 19, chapter: 5 },
    ]);
    expect(spans).toEqual([
      { book: 19, chapterStart: 1, chapterEnd: 1 },
      { book: 19, chapterStart: 3, chapterEnd: 3 },
      { book: 19, chapterStart: 4, chapterEnd: 4, verseStart: 1, verseEnd: 5 },
      { book: 19, chapterStart: 5, chapterEnd: 5 },
    ]);
  });
  it("returns an empty list for no readings", () => {
    expect(mergeReadings([])).toEqual([]);
  });
});

describe("labels", () => {
  it("formats chapter spans with an en dash and single chapters via formatReference", () => {
    expect(spanLabel({ book: 1, chapterStart: 1, chapterEnd: 2 })).toBe("1. Mose 1–2");
    expect(spanLabel({ book: 1, chapterStart: 1, chapterEnd: 2 }, "en")).toBe("Genesis 1–2");
    expect(readingLabel({ book: 43, chapter: 3 })).toBe("Johannes 3");
    expect(readingLabel({ book: 43, chapter: 3, verseStart: 16 })).toBe("Johannes 3,16");
    expect(readingLabel({ book: 43, chapter: 3, verseStart: 1, verseEnd: 21 })).toBe("Johannes 3,1-21");
    expect(readingLabel({ book: 43, chapter: 3, verseStart: 1, verseEnd: 21 }, "en")).toBe("John 3:1-21");
  });
  it("joins a day's readings", () => {
    expect(
      readingsLabel([
        { book: 1, chapter: 1 },
        { book: 1, chapter: 2 },
        { book: 40, chapter: 1 },
      ]),
    ).toBe("1. Mose 1–2; Matthäus 1");
  });
  it("falls back for unknown books", () => {
    expect(spanLabel({ book: 99, chapterStart: 1, chapterEnd: 1 })).toBe("Buch 99, Kapitel 1");
    expect(spanPath({ book: 99, chapterStart: 1, chapterEnd: 1 })).toBeNull();
  });
  it("links to the reader, first chapter of a span, with verses and translation", () => {
    expect(spanPath({ book: 1, chapterStart: 3, chapterEnd: 5 })).toBe("/bibel/gen/3");
    expect(spanPath({ book: 43, chapterStart: 3, chapterEnd: 3, verseStart: 1, verseEnd: 21 }, "ELB1905")).toBe(
      "/bibel/john/3?v=1-21&t=ELB1905",
    );
  });
  it("summarises a plan in chapters or sections", () => {
    expect(readingsSummary([[{ book: 1, chapter: 1 }], [{ book: 1, chapter: 2 }, { book: 1, chapter: 2 }]])).toBe("2 Kapitel");
    expect(readingsSummary([[{ book: 1, chapter: 1, verseStart: 1, verseEnd: 5 }]])).toBe("1 Abschnitt");
    expect(readingsSummary([[{ book: 1, chapter: 1 }], [{ book: 1, chapter: 1, verseStart: 1 }]])).toBe("2 Abschnitte");
  });
  it("labels categories", () => {
    expect(categoryLabel("ganze-bibel")).toBe("Ganze Bibel");
    expect(categoryLabel("buch")).toBe("Ein Buch");
    expect(categoryLabel("unbekannt")).toBe("Weitere");
  });
});

describe("fullChapters", () => {
  it("keeps whole chapters once and skips verse ranges", () => {
    expect(
      fullChapters([
        { book: 1, chapter: 1 },
        { book: 1, chapter: 1 },
        { book: 43, chapter: 3, verseStart: 16 },
        { book: 40, chapter: 5 },
      ]),
    ).toEqual([
      { book: 1, chapter: 1 },
      { book: 40, chapter: 5 },
    ]);
  });
});

describe("nextOpenDay", () => {
  it("returns the first missing day regardless of order", () => {
    expect(nextOpenDay([], 5)).toBe(1);
    expect(nextOpenDay([1, 2], 5)).toBe(3);
    expect(nextOpenDay([2, 3, 1], 5)).toBe(4);
    expect(nextOpenDay([1, 3], 5)).toBe(2);
  });
  it("returns null when finished or the plan is empty", () => {
    expect(nextOpenDay([1, 2, 3], 3)).toBeNull();
    expect(nextOpenDay([], 0)).toBeNull();
  });
});

describe("percent", () => {
  it("rounds and clamps", () => {
    expect(percent(0, 10)).toBe(0);
    expect(percent(1, 3)).toBe(33);
    expect(percent(2, 3)).toBe(67);
    expect(percent(10, 10)).toBe(100);
    expect(percent(12, 10)).toBe(100);
    expect(percent(-1, 10)).toBe(0);
    expect(percent(5, 0)).toBe(0);
  });
});

describe("estimatedFinish", () => {
  const today = new Date(2026, 9, 2, 14, 30); // 2 October 2026
  it("counts today as the next reading day", () => {
    expect(estimatedFinish(0, 1, { today })).toEqual(new Date(2026, 9, 2));
    expect(estimatedFinish(2, 5, { today })).toEqual(new Date(2026, 9, 4));
  });
  it("starts tomorrow when something was already read today", () => {
    expect(estimatedFinish(2, 5, { today, lastCompletedAt: new Date(2026, 9, 2, 8) })).toEqual(new Date(2026, 9, 5));
    expect(estimatedFinish(2, 5, { today, lastCompletedAt: new Date(2026, 9, 1, 23) })).toEqual(new Date(2026, 9, 4));
  });
  it("crosses month boundaries and returns null when done", () => {
    expect(estimatedFinish(0, 31, { today })).toEqual(new Date(2026, 10, 1));
    expect(estimatedFinish(5, 5, { today })).toBeNull();
    expect(estimatedFinish(6, 5, { today })).toBeNull();
  });
});

describe("weeksOf", () => {
  it("groups days into weeks with a shorter last week", () => {
    expect(weeksOf(16)).toEqual([
      { week: 1, days: [1, 2, 3, 4, 5, 6, 7] },
      { week: 2, days: [8, 9, 10, 11, 12, 13, 14] },
      { week: 3, days: [15, 16] },
    ]);
    expect(weeksOf(0)).toEqual([]);
    expect(weeksOf(3, 5)).toEqual([{ week: 1, days: [1, 2, 3] }]);
  });
});

describe("encouragement", () => {
  it("stays warm and never scolds", () => {
    const texts = [0, 1, 5, 10, 16, 19, 20].map((n) => encouragement(n, 20));
    for (const t of texts) {
      expect(t).not.toMatch(/verpasst|versäumt|Rückstand/i);
      expect(t.length).toBeGreaterThan(0);
    }
    expect(encouragement(20, 20)).toMatch(/Geschafft/);
    expect(encouragement(19, 20)).toMatch(/ein Tag/);
    expect(encouragement(0, 0)).toBe("");
  });
});

describe("planStatus", () => {
  it("prefers archived over finished", () => {
    expect(planStatus({ completedAt: null, archivedAt: null })).toBe("active");
    expect(planStatus({ completedAt: new Date(), archivedAt: null })).toBe("finished");
    expect(planStatus({ completedAt: new Date(), archivedAt: new Date() })).toBe("archived");
  });
});
