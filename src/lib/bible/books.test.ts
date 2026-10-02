import { describe, expect, it } from "vitest";
import { BOOKS, findBook, getBookBySlug, normalizeBookToken } from "./books";

describe("books", () => {
  it("has 66 books in canonical order", () => {
    expect(BOOKS).toHaveLength(66);
    expect(BOOKS[0].id).toBe("Gen");
    expect(BOOKS[38].id).toBe("Mal");
    expect(BOOKS[39].id).toBe("Matt");
    expect(BOOKS[65].id).toBe("Rev");
    BOOKS.forEach((b, i) => expect(b.number).toBe(i + 1));
  });

  it("resolves German and English names and abbreviations", () => {
    expect(findBook("1. Mose")?.id).toBe("Gen");
    expect(findBook("1Mo")?.id).toBe("Gen");
    expect(findBook("Genesis")?.id).toBe("Gen");
    expect(findBook("Joh")?.id).toBe("John");
    expect(findBook("Johannes")?.id).toBe("John");
    expect(findBook("John")?.id).toBe("John");
    expect(findBook("Röm")?.id).toBe("Rom");
    expect(findBook("roemer")?.id).toBe("Rom");
    expect(findBook("Offb")?.id).toBe("Rev");
    expect(findBook("Song of Songs")?.id).toBe("Song");
    expect(findBook("Hoheslied")?.id).toBe("Song");
    expect(findBook("1 Kön")?.id).toBe("1Kgs");
    expect(findBook("Apg")?.id).toBe("Acts");
    expect(findBook("Nope")).toBeUndefined();
  });

  it("resolves slugs case-insensitively", () => {
    expect(getBookBySlug("john")?.number).toBe(43);
    expect(getBookBySlug("1john")?.number).toBe(62);
    expect(getBookBySlug("JOH")?.number).toBe(43);
  });

  it("normalizes tokens", () => {
    expect(normalizeBookToken("1. Mose")).toBe("1mose");
    expect(normalizeBookToken("Römer")).toBe("romer");
  });
});
