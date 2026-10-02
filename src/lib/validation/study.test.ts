import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  HIGHLIGHT_COLOR_VALUES,
  NOTE_VISIBILITY_LABELS,
  bookmarkSchema,
  chapterReadSchema,
  isHighlightColor,
  isValidDateString,
  journalEntrySchema,
  memoryReviewSchema,
  memoryVerseAddSchema,
  noteSchema,
  parseMonth,
  setHighlightSchema,
  verseKeySchema,
  verseOfKey,
} from "./study";

function fieldErrors(result: z.ZodSafeParseResult<unknown>) {
  if (result.success) throw new Error("expected a validation failure");
  return z.flattenError(result.error).fieldErrors as Record<string, string[] | undefined>;
}

describe("verseKeySchema", () => {
  it("accepts canonical keys and trims", () => {
    expect(verseKeySchema.parse(" 43:3:16 ")).toBe("43:3:16");
    expect(verseKeySchema.parse("1:1:1")).toBe("1:1:1");
    expect(verseKeySchema.parse("66:22:21")).toBe("66:22:21");
    expect(verseOfKey("19:119:105")).toBe(105);
  });

  it("rejects malformed keys and books outside 1–66", () => {
    for (const bad of [
      "",
      "43:3",
      "43-3-16",
      "john:3:16",
      "0:1:1",
      "67:1:1",
      "43:0:1",
      "43:1:0",
      "123:1:1",
      "43:1:1000",
    ]) {
      expect(verseKeySchema.safeParse(bad).success).toBe(false);
    }
  });
});

describe("setHighlightSchema", () => {
  it("accepts a colour or null (remove) and limits the batch size", () => {
    expect(setHighlightSchema.parse({ verseKeys: ["43:3:16", "43:3:17"], color: "green" })).toEqual({
      verseKeys: ["43:3:16", "43:3:17"],
      color: "green",
    });
    expect(setHighlightSchema.parse({ verseKeys: ["43:3:16"], color: null }).color).toBeNull();
    expect(fieldErrors(setHighlightSchema.safeParse({ verseKeys: [], color: "yellow" })).verseKeys).toBeDefined();
    expect(fieldErrors(setHighlightSchema.safeParse({ verseKeys: ["43:3:16"], color: "red" })).color).toEqual([
      "Bitte eine Farbe wählen.",
    ]);
    const tooMany = Array.from({ length: 201 }, (_, i) => `43:3:${i + 1}`);
    expect(setHighlightSchema.safeParse({ verseKeys: tooMany, color: "yellow" }).success).toBe(false);
  });

  it("knows all colours", () => {
    for (const c of HIGHLIGHT_COLOR_VALUES) expect(isHighlightColor(c)).toBe(true);
    expect(isHighlightColor("red")).toBe(false);
    expect(isHighlightColor(undefined)).toBe(false);
  });
});

describe("noteSchema", () => {
  const valid = {
    verseKey: "43:3:16",
    verseEnd: "",
    title: "",
    body: "  Gott liebt die Welt.  ",
    visibility: "PRIVATE",
  };

  it("trims, turns empty optional fields into undefined and coerces verseEnd", () => {
    expect(noteSchema.parse(valid)).toEqual({
      verseKey: "43:3:16",
      verseEnd: undefined,
      title: undefined,
      body: "Gott liebt die Welt.",
      visibility: "PRIVATE",
    });
    expect(noteSchema.parse({ ...valid, verseEnd: "18", title: " Kernvers " })).toMatchObject({
      verseEnd: 18,
      title: "Kernvers",
    });
  });

  it("requires a body, caps lengths and only allows PRIVATE or MEMBERS", () => {
    expect(fieldErrors(noteSchema.safeParse({ ...valid, body: "   " })).body).toEqual([
      "Bitte schreib etwas in deine Notiz.",
    ]);
    expect(fieldErrors(noteSchema.safeParse({ ...valid, body: "x".repeat(5001) })).body).toBeDefined();
    expect(noteSchema.safeParse({ ...valid, body: "x".repeat(5000) }).success).toBe(true);
    expect(fieldErrors(noteSchema.safeParse({ ...valid, title: "x".repeat(121) })).title).toBeDefined();
    expect(fieldErrors(noteSchema.safeParse({ ...valid, visibility: "PUBLIC" })).visibility).toBeDefined();
    expect(fieldErrors(noteSchema.safeParse({ ...valid, visibility: "GROUP" })).visibility).toBeDefined();
    expect(Object.keys(NOTE_VISIBILITY_LABELS)).toEqual(["PRIVATE", "MEMBERS"]);
  });

  it("rejects an end verse before the start verse or a non-numeric one", () => {
    expect(fieldErrors(noteSchema.safeParse({ ...valid, verseEnd: "15" })).verseEnd).toEqual([
      "Der letzte Vers darf nicht vor dem ersten liegen.",
    ]);
    expect(noteSchema.safeParse({ ...valid, verseEnd: "16" }).success).toBe(true);
    expect(fieldErrors(noteSchema.safeParse({ ...valid, verseEnd: "abc" })).verseEnd).toBeDefined();
    expect(fieldErrors(noteSchema.safeParse({ ...valid, verseEnd: "1.5" })).verseEnd).toBeDefined();
  });
});

describe("bookmarkSchema", () => {
  it("accepts an optional label up to 80 characters", () => {
    expect(bookmarkSchema.parse({ verseKey: "19:23:1", label: "" })).toEqual({ verseKey: "19:23:1", label: undefined });
    expect(bookmarkSchema.parse({ verseKey: "19:23:1", label: " Trost " }).label).toBe("Trost");
    expect(bookmarkSchema.safeParse({ verseKey: "19:23:1", label: "x".repeat(81) }).success).toBe(false);
    expect(bookmarkSchema.safeParse({ verseKey: "19:23", label: "" }).success).toBe(false);
  });
});

describe("chapterReadSchema", () => {
  it("coerces numbers and validates ranges", () => {
    expect(chapterReadSchema.parse({ book: "43", chapter: "3", translation: "LUT1912" })).toEqual({
      book: 43,
      chapter: 3,
      translation: "LUT1912",
    });
    expect(chapterReadSchema.safeParse({ book: 67, chapter: 1, translation: "LUT1912" }).success).toBe(false);
    expect(chapterReadSchema.safeParse({ book: 1, chapter: 0, translation: "LUT1912" }).success).toBe(false);
    expect(chapterReadSchema.safeParse({ book: 1, chapter: 1, translation: "LUT 1912" }).success).toBe(false);
  });
});

describe("journalEntrySchema", () => {
  const valid = {
    date: "2026-10-02",
    title: "",
    body: "Heute war ein guter Tag.",
    gratitude: "",
    prayer: "",
    verseKey: "",
  };

  it("accepts a minimal entry and turns empty fields into undefined", () => {
    expect(journalEntrySchema.parse(valid)).toEqual({
      date: "2026-10-02",
      title: undefined,
      body: "Heute war ein guter Tag.",
      gratitude: undefined,
      prayer: undefined,
      verseKey: undefined,
    });
    expect(
      journalEntrySchema.parse({ ...valid, verseKey: "19:23:1", gratitude: "Für Freunde.", prayer: "Danke." }),
    ).toMatchObject({
      verseKey: "19:23:1",
      gratitude: "Für Freunde.",
      prayer: "Danke.",
    });
  });

  it("validates the date as a real calendar day", () => {
    expect(isValidDateString("2024-02-29")).toBe(true);
    expect(isValidDateString("2023-02-29")).toBe(false);
    expect(isValidDateString("2026-13-01")).toBe(false);
    expect(isValidDateString("2.10.2026")).toBe(false);
    expect(fieldErrors(journalEntrySchema.safeParse({ ...valid, date: "2026-02-30" })).date).toEqual([
      "Bitte ein gültiges Datum wählen.",
    ]);
  });

  it("enforces lengths and a valid verse key", () => {
    expect(fieldErrors(journalEntrySchema.safeParse({ ...valid, body: "" })).body).toEqual([
      "Bitte schreib auf, was dich bewegt.",
    ]);
    expect(journalEntrySchema.safeParse({ ...valid, body: "x".repeat(10_000) }).success).toBe(true);
    expect(fieldErrors(journalEntrySchema.safeParse({ ...valid, body: "x".repeat(10_001) })).body).toBeDefined();
    expect(
      fieldErrors(journalEntrySchema.safeParse({ ...valid, gratitude: "x".repeat(2001) })).gratitude,
    ).toBeDefined();
    expect(fieldErrors(journalEntrySchema.safeParse({ ...valid, prayer: "x".repeat(2001) })).prayer).toBeDefined();
    expect(fieldErrors(journalEntrySchema.safeParse({ ...valid, title: "x".repeat(121) })).title).toBeDefined();
    expect(fieldErrors(journalEntrySchema.safeParse({ ...valid, verseKey: "Psalm 23" })).verseKey).toBeDefined();
  });

  it("parses the month filter", () => {
    expect(parseMonth("2026-10")).toBe("2026-10");
    expect(parseMonth(["2026-01"])).toBe("2026-01");
    expect(parseMonth("2026-13")).toBeUndefined();
    expect(parseMonth("abc")).toBeUndefined();
    expect(parseMonth(undefined)).toBeUndefined();
  });
});

describe("memoryVerseAddSchema", () => {
  it("parses German and English references with an optional range", () => {
    expect(memoryVerseAddSchema.parse({ reference: "Joh 3,16", translation: "LUT1912" })).toEqual({
      reference: { book: 43, chapter: 3, verseStart: 16 },
      translation: "LUT1912",
    });
    expect(memoryVerseAddSchema.parse({ reference: "Psalm 23:1-3", translation: "kjv" }).reference).toEqual({
      book: 19,
      chapter: 23,
      verseStart: 1,
      verseEnd: 3,
    });
    expect(memoryVerseAddSchema.parse({ reference: "Röm 8,28-28", translation: "ELB1905" }).reference).toEqual({
      book: 45,
      chapter: 8,
      verseStart: 28,
    });
  });

  it("requires a verse and a known book", () => {
    const msg = "Bitte eine Bibelstelle mit Vers angeben, z. B. Johannes 3,16 oder Psalm 23,1-3.";
    expect(
      fieldErrors(memoryVerseAddSchema.safeParse({ reference: "Psalm 23", translation: "LUT1912" })).reference,
    ).toEqual([msg]);
    expect(
      fieldErrors(memoryVerseAddSchema.safeParse({ reference: "Harry 3,16", translation: "LUT1912" })).reference,
    ).toEqual([msg]);
    expect(fieldErrors(memoryVerseAddSchema.safeParse({ reference: "", translation: "LUT1912" })).reference).toEqual([
      "Bitte eine Bibelstelle eingeben.",
    ]);
    expect(
      fieldErrors(memoryVerseAddSchema.safeParse({ reference: "Joh 3,16", translation: "" })).translation,
    ).toBeDefined();
  });
});

describe("memoryReviewSchema", () => {
  it("accepts only known/unknown", () => {
    expect(memoryReviewSchema.parse({ id: "abc", result: "known" })).toEqual({ id: "abc", result: "known" });
    expect(memoryReviewSchema.safeParse({ id: "abc", result: "maybe" }).success).toBe(false);
    expect(memoryReviewSchema.safeParse({ id: "", result: "known" }).success).toBe(false);
  });
});
