import { describe, expect, it } from "vitest";
import { coversWholeVerse, mergeRanges, snapToWords, splitByRange } from "./ranges";

const text = "Also hat Gott die Welt geliebt, daß er seinen eingeborenen Sohn gab.";

describe("snapToWords", () => {
  it("widens partial words and trims spaces", () => {
    const start = text.indexOf("ott");
    const end = text.indexOf("Welt") + 2;
    expect(snapToWords(text, start, end)).toEqual({ start: text.indexOf("Gott"), end: text.indexOf("Welt") + 4 });
  });
  it("keeps exact word selections", () => {
    const s = text.indexOf("geliebt");
    expect(snapToWords(text, s - 1, s + 7)).toEqual({ start: s, end: s + 7 });
  });
  it("returns null for whitespace or punctuation only", () => {
    expect(snapToWords(text, 4, 5)).toBeNull();
    expect(snapToWords(text, text.indexOf(","), text.indexOf(",") + 1)).toBeNull();
  });
  it("clamps out-of-range offsets", () => {
    expect(snapToWords("Amen", -5, 99)).toEqual({ start: 0, end: 4 });
  });
});

describe("coversWholeVerse", () => {
  it("detects full coverage ignoring edge punctuation", () => {
    expect(coversWholeVerse(text, { start: 0, end: text.length - 1 })).toBe(true);
    expect(coversWholeVerse(text, { start: 5, end: text.length })).toBe(false);
  });
});

describe("mergeRanges", () => {
  it("handles new, whole and partial highlights", () => {
    expect(mergeRanges(undefined, { start: 2, end: 5 })).toEqual({ start: 2, end: 5 });
    expect(mergeRanges(null, { start: 2, end: 5 })).toBeNull();
    expect(mergeRanges({ start: 2, end: 5 }, null)).toBeNull();
    expect(mergeRanges({ start: 10, end: 20 }, { start: 2, end: 5 })).toEqual({ start: 2, end: 20 });
  });
});

describe("splitByRange", () => {
  it("splits and clamps", () => {
    expect(splitByRange("abcdef", { start: 2, end: 4 })).toEqual(["ab", "cd", "ef"]);
    expect(splitByRange("abc", { start: 1, end: 99 })).toEqual(["a", "bc", ""]);
  });
});
