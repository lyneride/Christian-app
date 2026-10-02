import { describe, expect, it } from "vitest";
import { findReferencesInText, formatReference, parseReference, parseVerseKey, referencePath, verseKey } from "./reference";

describe("parseReference", () => {
  it("parses German notation", () => {
    const r = parseReference("Joh 3,16-18");
    expect(r?.book.id).toBe("John");
    expect(r?.chapter).toBe(3);
    expect(r?.verseStart).toBe(16);
    expect(r?.verseEnd).toBe(18);
  });
  it("parses English notation", () => {
    const r = parseReference("John 3:16");
    expect(r?.book.id).toBe("John");
    expect(r?.verseStart).toBe(16);
    expect(r?.verseEnd).toBeUndefined();
  });
  it("parses numbered books and whole chapters", () => {
    expect(parseReference("1. Mose 1")?.book.id).toBe("Gen");
    expect(parseReference("1 Mose 1")?.chapter).toBe(1);
    expect(parseReference("1Kor 13")?.book.id).toBe("1Cor");
    expect(parseReference("Psalm 23")?.verseStart).toBeUndefined();
  });
  it("rejects garbage", () => {
    expect(parseReference("hello")).toBeNull();
    expect(parseReference("Foo 3,16")).toBeNull();
    expect(parseReference("")).toBeNull();
  });
  it("ignores inverted ranges", () => {
    expect(parseReference("Joh 3,18-16")?.verseEnd).toBeUndefined();
  });
});

describe("formatReference / referencePath", () => {
  it("formats in German and English", () => {
    const r = parseReference("Röm 8,28-39")!;
    expect(formatReference(r, "de")).toBe("Römer 8,28-39");
    expect(formatReference(r, "en")).toBe("Romans 8:28-39");
    expect(formatReference(r, "de", true)).toBe("Röm 8,28-39");
    expect(referencePath(r)).toBe("/bibel/rom/8?v=28-39");
    expect(referencePath(parseReference("Ps 23")!, "ELB1905")).toBe("/bibel/ps/23?t=ELB1905");
  });
});

describe("findReferencesInText", () => {
  it("finds references inside free text", () => {
    const hits = findReferencesInText("Bitte betet für mich, siehe Phil 4,6-7 und Psalm 23:1. Danke!");
    expect(hits.map((h) => formatReference(h.ref, "de", true))).toEqual(["Phil 4,6-7", "Ps 23,1"]);
    expect(hits[0].raw).toBe("Phil 4,6-7");
  });
  it("does not match ordinary words", () => {
    expect(findReferencesInText("Um 3,16 Uhr treffen wir uns")).toHaveLength(0);
  });
});

describe("verseKey", () => {
  it("round-trips", () => {
    const key = verseKey(43, 3, 16);
    expect(key).toBe("43:3:16");
    const parsed = parseVerseKey(key);
    expect(parsed?.book.id).toBe("John");
    expect(parsed?.chapter).toBe(3);
    expect(parsed?.verse).toBe(16);
    expect(parseVerseKey("x")).toBeNull();
  });
});
