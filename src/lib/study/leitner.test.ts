import { describe, expect, it } from "vitest";
import {
  BOX_INTERVALS_DAYS,
  boxLabel,
  clampBox,
  compareTyped,
  dueCount,
  isDue,
  maskVerse,
  nextReviewLabel,
  nextState,
  normalizeWords,
  practicedLabel,
  similarityFeedback,
} from "./leitner";

const now = new Date("2026-10-02T15:30:00.000Z");

describe("nextState", () => {
  it("moves a known verse one box up with the interval of the new box (from the next UTC midnight)", () => {
    expect(nextState(1, "known", now)).toEqual({ box: 2, nextReviewAt: new Date("2026-10-05T00:00:00.000Z") });
    expect(nextState(2, "known", now)).toEqual({ box: 3, nextReviewAt: new Date("2026-10-09T00:00:00.000Z") });
    expect(nextState(4, "known", now)).toEqual({ box: 5, nextReviewAt: new Date("2026-11-01T00:00:00.000Z") });
  });

  it("caps at box 5", () => {
    const s = nextState(5, "known", now);
    expect(s.box).toBe(5);
    expect(s.nextReviewAt).toEqual(new Date("2026-11-01T00:00:00.000Z"));
  });

  it("sends an unknown verse back to box 1, due tomorrow", () => {
    expect(nextState(4, "unknown", now)).toEqual({ box: 1, nextReviewAt: new Date("2026-10-03T00:00:00.000Z") });
    expect(nextState(1, "unknown", now).box).toBe(1);
  });

  it("tolerates invalid boxes", () => {
    expect(clampBox(0)).toBe(1);
    expect(clampBox(9)).toBe(5);
    expect(clampBox(Number.NaN)).toBe(1);
    expect(nextState(0, "known", now).box).toBe(2);
    expect(BOX_INTERVALS_DAYS).toEqual([1, 3, 7, 14, 30]);
  });
});

describe("dueCount / isDue / labels", () => {
  it("counts verses whose next review is now or in the past", () => {
    const verses = [
      { nextReviewAt: new Date("2026-10-01T00:00:00.000Z") },
      { nextReviewAt: now },
      { nextReviewAt: new Date("2026-10-03T00:00:00.000Z") },
    ];
    expect(dueCount(verses, now)).toBe(2);
    expect(isDue(verses[2], now)).toBe(false);
    expect(dueCount([], now)).toBe(0);
  });

  it("formats box and next review labels in German", () => {
    expect(boxLabel(3)).toBe("Stufe 3");
    expect(nextReviewLabel(new Date("2026-09-30T00:00:00.000Z"), now)).toBe("heute dran");
    expect(nextReviewLabel(new Date("2026-10-03T00:00:00.000Z"), now)).toBe("morgen");
    expect(nextReviewLabel(new Date("2026-10-09T00:00:00.000Z"), now)).toBe("in 7 Tagen");
    expect(practicedLabel(1)).toBe("1 Vers geübt");
    expect(practicedLabel(3)).toBe("3 Verse geübt");
  });
});

describe("maskVerse", () => {
  const text = "Denn also hat Gott die Welt geliebt, dass er seinen eingeborenen Sohn gab.";

  it("returns the full text at level 0", () => {
    expect(maskVerse(text, 0)).toBe(text);
  });

  it("shows the first letter of every word at level 1 and keeps punctuation", () => {
    expect(maskVerse("Gott ist Liebe.", 1)).toBe("G___ i__ L____.");
    expect(maskVerse(text, 1).startsWith("D___ a___ h__ G___")).toBe(true);
  });

  it("hides every second word at level 2", () => {
    expect(maskVerse("Gott ist die Liebe, ja.", 2)).toBe("Gott ___ die _____, ja.");
  });

  it("hides everything but punctuation and spacing at level 3", () => {
    expect(maskVerse("Gott ist Liebe.", 3)).toBe("____ ___ _____.");
    expect(maskVerse("Fürchte dich nicht!", 3)).toBe("_______ ____ _____!");
    expect(maskVerse("", 3)).toBe("");
  });
});

describe("compareTyped", () => {
  const expected = "Denn also hat Gott die Welt geliebt, dass er seinen eingeborenen Sohn gab.";

  it("is 1 for identical text ignoring case and punctuation", () => {
    expect(compareTyped(expected, expected)).toBe(1);
    expect(compareTyped(expected, "denn also hat gott die welt geliebt dass er seinen eingeborenen sohn gab")).toBe(1);
    expect(compareTyped("Fürchte dich nicht!", "fuerchte dich nicht")).toBe(1);
  });

  it("drops with every wrong or missing word and is 0 for empty input", () => {
    const score = compareTyped(expected, "Denn also hat Gott die Welt geliebt, dass er seinen Sohn gab.");
    expect(score).toBeGreaterThan(0.85);
    expect(score).toBeLessThan(1);
    expect(compareTyped(expected, "Etwas ganz anderes steht hier")).toBeLessThan(0.2);
    expect(compareTyped(expected, "")).toBe(0);
    expect(compareTyped("", "")).toBe(1);
  });

  it("normalises words", () => {
    expect(normalizeWords("Groß, schön & frei!")).toEqual(["gross", "schoen", "frei"]);
  });

  it("gives feedback for every score band", () => {
    expect(similarityFeedback(1)).toBe("Wort für Wort richtig.");
    expect(similarityFeedback(0.9)).toContain("Fast perfekt");
    expect(similarityFeedback(0.7)).toContain("nah dran");
    expect(similarityFeedback(0.4)).toContain("Ein Teil sitzt");
    expect(similarityFeedback(0)).toContain("Noch nicht");
  });
});
