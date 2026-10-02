import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  CATEGORY_LABELS,
  FILTER_LABELS,
  PRAYER_CATEGORIES,
  PRAYER_FILTERS,
  markAnsweredSchema,
  parsePrayerCategory,
  parsePrayerFilter,
  prayerRequestSchema,
} from "./prayer";

function fieldErrors(result: z.ZodSafeParseResult<unknown>) {
  if (result.success) throw new Error("expected a validation failure");
  return z.flattenError(result.error).fieldErrors as Record<string, string[] | undefined>;
}

const valid = {
  title: "  Für meine Mutter  ",
  body: "Sie hat nächste Woche eine wichtige Untersuchung.",
  category: "gesundheit",
  visibility: "MEMBERS",
};

describe("CATEGORY_LABELS", () => {
  it("has a German label and description for every category", () => {
    for (const c of PRAYER_CATEGORIES) {
      expect(CATEGORY_LABELS[c].label.length).toBeGreaterThan(0);
      expect(CATEGORY_LABELS[c].description.length).toBeGreaterThan(0);
    }
    for (const f of PRAYER_FILTERS) expect(FILTER_LABELS[f].length).toBeGreaterThan(0);
  });
});

describe("prayerRequestSchema", () => {
  it("trims, defaults isAnonymous to false and clears groupId outside GROUP visibility", () => {
    const r = prayerRequestSchema.parse({ ...valid, groupId: "g1" });
    expect(r).toEqual({
      title: "Für meine Mutter",
      body: "Sie hat nächste Woche eine wichtige Untersuchung.",
      category: "gesundheit",
      isAnonymous: false,
      visibility: "MEMBERS",
      groupId: null,
    });
  });

  it("reads the checkbox value 'on' as true", () => {
    expect(prayerRequestSchema.parse({ ...valid, isAnonymous: "on" }).isAnonymous).toBe(true);
    expect(prayerRequestSchema.parse({ ...valid, isAnonymous: "" }).isAnonymous).toBe(false);
    expect(prayerRequestSchema.parse({ ...valid, isAnonymous: true }).isAnonymous).toBe(true);
  });

  it("requires a group when visibility is GROUP", () => {
    expect(fieldErrors(prayerRequestSchema.safeParse({ ...valid, visibility: "GROUP" })).groupId).toEqual([
      "Bitte eine Gruppe wählen.",
    ]);
    expect(
      fieldErrors(prayerRequestSchema.safeParse({ ...valid, visibility: "GROUP", groupId: "" })).groupId,
    ).toBeDefined();
    expect(prayerRequestSchema.parse({ ...valid, visibility: "GROUP", groupId: "g1" }).groupId).toBe("g1");
  });

  it("rejects PRIVATE visibility and unknown categories", () => {
    expect(fieldErrors(prayerRequestSchema.safeParse({ ...valid, visibility: "PRIVATE" })).visibility).toEqual([
      "Bitte wähle, wer das Anliegen sehen darf.",
    ]);
    expect(fieldErrors(prayerRequestSchema.safeParse({ ...valid, category: "sport" })).category).toEqual([
      "Bitte eine Kategorie wählen.",
    ]);
  });

  it("enforces title and body lengths with German messages", () => {
    const errors = fieldErrors(prayerRequestSchema.safeParse({ ...valid, title: "ab", body: "zu kurz" }));
    expect(errors.title).toEqual(["Der Titel braucht mindestens 3 Zeichen."]);
    expect(errors.body).toEqual(["Bitte beschreibe dein Anliegen mit mindestens 10 Zeichen."]);
    expect(fieldErrors(prayerRequestSchema.safeParse({ ...valid, title: "x".repeat(121) })).title).toBeDefined();
    expect(prayerRequestSchema.safeParse({ ...valid, body: "x".repeat(4000) }).success).toBe(true);
    expect(fieldErrors(prayerRequestSchema.safeParse({ ...valid, body: "x".repeat(4001) })).body).toBeDefined();
  });
});

describe("markAnsweredSchema", () => {
  it("allows an empty note and caps it at 2000 characters", () => {
    expect(markAnsweredSchema.parse({ answerNote: "  " })).toEqual({ answerNote: "" });
    expect(markAnsweredSchema.safeParse({ answerNote: "x".repeat(2000) }).success).toBe(true);
    expect(markAnsweredSchema.safeParse({ answerNote: "x".repeat(2001) }).success).toBe(false);
  });
});

describe("parsePrayerFilter / parsePrayerCategory", () => {
  it("falls back to 'alle' for unknown values and member-only filters without a viewer", () => {
    expect(parsePrayerFilter(undefined, false)).toBe("alle");
    expect(parsePrayerFilter("unsinn", true)).toBe("alle");
    expect(parsePrayerFilter("offen", false)).toBe("offen");
    expect(parsePrayerFilter(["erhoert"], false)).toBe("erhoert");
    expect(parsePrayerFilter("meine", false)).toBe("alle");
    expect(parsePrayerFilter("meine", true)).toBe("meine");
    expect(parsePrayerFilter("gebetet", true)).toBe("gebetet");
  });

  it("only accepts known categories", () => {
    expect(parsePrayerCategory("dank")).toBe("dank");
    expect(parsePrayerCategory(["welt"])).toBe("welt");
    expect(parsePrayerCategory("xyz")).toBeUndefined();
    expect(parsePrayerCategory(undefined)).toBeUndefined();
  });
});
