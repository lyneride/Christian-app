import { describe, expect, it } from "vitest";
import { BOOKS, getBookBySlug } from "./books";
import {
  buildBookUrl,
  buildCopyText,
  buildReaderUrl,
  buildSearchUrl,
  clampVerseRange,
  DEFAULT_READER_SETTINGS,
  excerpt,
  formatCrossReference,
  formatRangeReference,
  formatSelectionReference,
  formatVerseList,
  groupBooks,
  localeFor,
  MAX_RECENT_CHAPTERS,
  parseReaderSettings,
  parseRecentChapters,
  pushRecentChapter,
  readerSettingsStyle,
  selectionRange,
  verseParam,
  verseRuns,
} from "./ui";

const john = getBookBySlug("john")!;
const rom = getBookBySlug("rom")!;

describe("urls", () => {
  it("builds reader urls with optional params in a stable order", () => {
    expect(buildReaderUrl(john, 3)).toBe("/bibel/john/3");
    expect(buildReaderUrl("John", 3, { v: "16-18", t: "LUT1912", p: "KJV" })).toBe(
      "/bibel/john/3?t=LUT1912&p=KJV&v=16-18",
    );
    expect(buildReaderUrl(john, 3, { t: null, p: undefined, v: "" })).toBe("/bibel/john/3");
  });
  it("builds book and search urls", () => {
    expect(buildBookUrl(john)).toBe("/bibel/john");
    expect(buildBookUrl("1John", { t: "KJV" })).toBe("/bibel/1john?t=KJV");
    expect(buildSearchUrl({ q: "fürchte dich nicht", t: "LUT1912", bereich: "alle", seite: 1 })).toBe(
      "/bibel/suche?q=f%C3%BCrchte+dich+nicht&t=LUT1912",
    );
    expect(buildSearchUrl({ q: "liebe", bereich: "nt", seite: 3 })).toBe("/bibel/suche?q=liebe&bereich=nt&seite=3");
    expect(buildSearchUrl()).toBe("/bibel/suche");
  });
});

describe("verse selections", () => {
  it("clamps ranges to the chapter", () => {
    expect(clampVerseRange({ start: 16, end: 18 }, 36)).toEqual({ start: 16, end: 18 });
    expect(clampVerseRange({ start: 30, end: 99 }, 36)).toEqual({ start: 30, end: 36 });
    expect(clampVerseRange({ start: 99, end: 120 }, 36)).toEqual({ start: 36, end: 36 });
    expect(clampVerseRange(null, 36)).toBeNull();
    expect(clampVerseRange({ start: 1, end: 2 }, 0)).toBeNull();
  });
  it("splits into runs and formats lists", () => {
    expect(verseRuns([18, 16, 17, 20, 16])).toEqual([
      { start: 16, end: 18 },
      { start: 20, end: 20 },
    ]);
    expect(formatVerseList([16])).toBe("16");
    expect(formatVerseList([16, 17, 18])).toBe("16-18");
    expect(formatVerseList([16, 18])).toBe("16.18");
    expect(formatVerseList([16, 18], "en")).toBe("16,18");
    expect(formatVerseList([20, 16, 17])).toBe("16-17.20");
    expect(formatVerseList([])).toBe("");
  });
  it("picks the first contiguous run for study actions", () => {
    expect(selectionRange([])).toBeNull();
    expect(selectionRange([18, 16, 17])).toEqual({ start: 16, end: 18 });
    expect(selectionRange([20, 16, 17])).toEqual({ start: 16, end: 17 });
    expect(formatRangeReference("Johannes", 3, { start: 16, end: 18 })).toBe("Johannes 3,16-18");
    expect(formatRangeReference("John", 3, { start: 16, end: 16 }, "en")).toBe("John 3:16");
  });
  it("collapses the ?v= param to a single range", () => {
    expect(verseParam([])).toBeNull();
    expect(verseParam([16])).toBe("16");
    expect(verseParam([18, 16])).toBe("16-18");
  });
  it("formats selection and cross references", () => {
    expect(formatSelectionReference("Johannes", 3, [16, 17], "de")).toBe("Johannes 3,16-17");
    expect(formatSelectionReference("John", 3, [16, 18], "en")).toBe("John 3:16,18");
    expect(formatSelectionReference("Johannes", 3, [])).toBe("Johannes 3");
    expect(formatCrossReference({ book: rom, chapter: 5, verseStart: 8 })).toBe("Römer 5,8");
    expect(formatCrossReference({ book: rom, chapter: 5, verseStart: 8, verseEnd: 10 }, "en")).toBe("Romans 5:8-10");
    expect(formatCrossReference({ book: john, chapter: 11, verseStart: 25, verseEnd: 2, endChapter: 12 })).toBe(
      "Johannes 11,25-12,2",
    );
  });
  it("builds clipboard text", () => {
    expect(buildCopyText([{ verse: 16, text: "Also hat Gott … " }], "Johannes 3,16", "Luther 1912")).toBe(
      "Also hat Gott …\n— Johannes 3,16 (Luther 1912)",
    );
    expect(
      buildCopyText(
        [
          { verse: 1, text: "A" },
          { verse: 2, text: "B" },
        ],
        "Psalm 23,1-2",
        "ELB",
      ),
    ).toBe("1 A 2 B\n— Psalm 23,1-2 (ELB)");
  });
  it("excerpts at word boundaries", () => {
    expect(excerpt(["kurz"])).toBe("kurz");
    const long = excerpt(
      Array.from({ length: 40 }, () => "wort"),
      30,
    );
    expect(long.length).toBeLessThanOrEqual(31);
    expect(long.endsWith("…")).toBe(true);
    expect(long).not.toContain("  ");
  });
});

describe("reader settings", () => {
  it("parses tolerantly", () => {
    expect(parseReaderSettings(null)).toEqual(DEFAULT_READER_SETTINGS);
    expect(parseReaderSettings("{nope")).toEqual(DEFAULT_READER_SETTINGS);
    expect(parseReaderSettings('{"fontSize":"xl","font":"sans","layout":"flow"}')).toEqual({
      fontSize: "xl",
      font: "sans",
      layout: "flow",
    });
    expect(parseReaderSettings('{"fontSize":"huge","font":1}')).toEqual(DEFAULT_READER_SETTINGS);
  });
  it("maps to inline styles", () => {
    expect(readerSettingsStyle(DEFAULT_READER_SETTINGS)).toEqual({ fontSize: "1.125rem", lineHeight: "1.85" });
    expect(readerSettingsStyle({ fontSize: "xl", font: "sans", layout: "lines" }).fontFamily).toContain("--font-sans");
  });
});

describe("recent chapters", () => {
  it("parses and validates stored entries", () => {
    expect(parseRecentChapters(null)).toEqual([]);
    expect(parseRecentChapters("[1,{}]")).toEqual([]);
    const ok = { book: "john", chapter: 3, t: "LUT1912", at: 1 };
    expect(parseRecentChapters(JSON.stringify([ok, { book: "x" }]))).toEqual([ok]);
  });
  it("pushes to the front, dedupes and caps", () => {
    let list = pushRecentChapter([], { book: "john", chapter: 3, t: "LUT1912", at: 1 });
    list = pushRecentChapter(list, { book: "ps", chapter: 23, t: "LUT1912", at: 2 });
    list = pushRecentChapter(list, { book: "john", chapter: 3, t: "KJV", at: 3 });
    expect(list.map((e) => `${e.book}/${e.chapter}/${e.t}`)).toEqual(["john/3/KJV", "ps/23/LUT1912"]);
    for (let i = 0; i < 20; i++) list = pushRecentChapter(list, { book: "gen", chapter: i + 1, t: "LUT1912", at: i });
    expect(list).toHaveLength(MAX_RECENT_CHAPTERS);
    expect(list[0].chapter).toBe(20);
  });
});

describe("groupBooks", () => {
  it("groups all 66 books by testament and genre", () => {
    const groups = groupBooks();
    expect(groups.map((g) => g.testament)).toEqual(["OT", "NT"]);
    expect(groups[0].books).toHaveLength(39);
    expect(groups[1].books).toHaveLength(27);
    expect(groups[0].groups.map((g) => g.genre)).toEqual(["law", "history", "wisdom", "prophets"]);
    expect(groups[1].groups.map((g) => g.genre)).toEqual(["gospel", "history", "letters", "apocalypse"]);
    expect(groups.flatMap((g) => g.groups.flatMap((x) => x.books))).toHaveLength(BOOKS.length);
    expect(localeFor("en")).toBe("en");
    expect(localeFor(undefined)).toBe("de");
  });
});
