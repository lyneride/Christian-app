import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  FEED_TABS,
  FEED_TAB_LABELS,
  POST_KINDS,
  POST_KIND_LABELS,
  REACTION_KINDS,
  REACTION_LABELS,
  VERSE_REF_INVALID,
  VERSE_REF_NEEDS_VERSE,
  isReactionKind,
  parseFeedTab,
  parseKindParam,
  postPath,
  postSchema,
  reactionSchema,
  verseKeyToInput,
  verseRefToKey,
} from "./community";

function fieldErrors(result: z.ZodSafeParseResult<unknown>) {
  if (result.success) throw new Error("expected a validation failure");
  return z.flattenError(result.error).fieldErrors as Record<string, string[] | undefined>;
}

const valid = {
  kind: "POST",
  title: "",
  body: "Heute morgen habe ich Psalm 23 gelesen und war einfach dankbar.",
  verseRef: "",
  visibility: "MEMBERS",
  groupId: "",
};

describe("labels", () => {
  it("has German labels for every kind, tab and reaction", () => {
    for (const k of POST_KINDS) expect(POST_KIND_LABELS[k].label.length).toBeGreaterThan(0);
    for (const t of FEED_TABS) expect(FEED_TAB_LABELS[t].length).toBeGreaterThan(0);
    for (const r of REACTION_KINDS) expect(REACTION_LABELS[r].label.length).toBeGreaterThan(0);
  });
});

describe("verseRefToKey", () => {
  it("parses German and English notation into a verse key", () => {
    expect(verseRefToKey("Röm 8,28")).toEqual({ key: "45:8:28" });
    expect(verseRefToKey(" John 3:16 ")).toEqual({ key: "43:3:16" });
    expect(verseRefToKey("1. Mose 1,1")).toEqual({ key: "1:1:1" });
  });
  it("keeps the first verse of a range", () => {
    expect(verseRefToKey("Joh 3,16-18")).toEqual({ key: "43:3:16" });
  });
  it("formats a stored key back for the form", () => {
    expect(verseKeyToInput("45:8:28")).toBe("Römer 8,28");
    expect(verseKeyToInput("99:1:1")).toBe("");
    expect(verseKeyToInput(null)).toBe("");
  });
  it("returns null for empty input and errors for unknown or chapter-only references", () => {
    expect(verseRefToKey("   ")).toBeNull();
    expect(verseRefToKey("Buch der Geheimnisse 3,4")).toEqual({ error: VERSE_REF_INVALID });
    expect(verseRefToKey("Psalm 23")).toEqual({ error: VERSE_REF_NEEDS_VERSE });
  });
});

describe("postSchema", () => {
  it("normalises a plain post: empty title and verse become null, groupId is cleared", () => {
    expect(postSchema.parse({ ...valid, groupId: "g1" })).toEqual({
      kind: "POST",
      title: null,
      body: valid.body,
      verseRef: null,
      visibility: "MEMBERS",
      groupId: null,
    });
  });

  it("stores a parsed verse reference as a key", () => {
    expect(postSchema.parse({ ...valid, verseRef: "Röm 8,28" }).verseRef).toBe("45:8:28");
  });

  it("rejects unknown or chapter-only verse references with a field error", () => {
    expect(fieldErrors(postSchema.safeParse({ ...valid, verseRef: "Nirgendwo 1,1" })).verseRef).toEqual([VERSE_REF_INVALID]);
    expect(fieldErrors(postSchema.safeParse({ ...valid, verseRef: "Röm 8" })).verseRef).toEqual([VERSE_REF_NEEDS_VERSE]);
  });

  it("requires a title for testimonies and questions only", () => {
    expect(fieldErrors(postSchema.safeParse({ ...valid, kind: "TESTIMONY" })).title).toEqual(["Dein Zeugnis braucht einen Titel."]);
    expect(fieldErrors(postSchema.safeParse({ ...valid, kind: "QUESTION" })).title).toBeDefined();
    expect(postSchema.safeParse({ ...valid, kind: "IMPULSE" }).success).toBe(true);
    expect(postSchema.parse({ ...valid, kind: "TESTIMONY", title: "  Geheilt  " }).title).toBe("Geheilt");
  });

  it("enforces title and body lengths with German messages", () => {
    expect(fieldErrors(postSchema.safeParse({ ...valid, title: "ab" })).title).toEqual(["Der Titel braucht mindestens 3 Zeichen."]);
    expect(fieldErrors(postSchema.safeParse({ ...valid, title: "x".repeat(121) })).title).toBeDefined();
    expect(fieldErrors(postSchema.safeParse({ ...valid, body: "ab" })).body).toEqual(["Bitte schreib mindestens 3 Zeichen."]);
    expect(postSchema.safeParse({ ...valid, body: "x".repeat(8000) }).success).toBe(true);
    expect(fieldErrors(postSchema.safeParse({ ...valid, body: "x".repeat(8001) })).body).toBeDefined();
  });

  it("requires a group for GROUP visibility and keeps it only then", () => {
    expect(fieldErrors(postSchema.safeParse({ ...valid, visibility: "GROUP" })).groupId).toEqual(["Bitte eine Gruppe wählen."]);
    expect(postSchema.parse({ ...valid, visibility: "GROUP", groupId: "g1" }).groupId).toBe("g1");
  });

  it("rejects PRIVATE visibility and unknown kinds", () => {
    expect(fieldErrors(postSchema.safeParse({ ...valid, visibility: "PRIVATE" })).visibility).toBeDefined();
    expect(fieldErrors(postSchema.safeParse({ ...valid, kind: "SERMON" })).kind).toEqual(["Bitte wähle, was du teilen möchtest."]);
  });
});

describe("reactionSchema / isReactionKind", () => {
  it("accepts the three reaction kinds only", () => {
    expect(reactionSchema.safeParse({ postId: "p1", kind: "AMEN" }).success).toBe(true);
    expect(reactionSchema.safeParse({ postId: "p1", kind: "LIKE" }).success).toBe(false);
    expect(reactionSchema.safeParse({ postId: "", kind: "PRAY" }).success).toBe(false);
    expect(isReactionKind("HEART")).toBe(true);
    expect(isReactionKind("heart")).toBe(false);
  });
});

describe("parseFeedTab / parseKindParam / postPath", () => {
  it("falls back to 'alle' for unknown tabs and member-only tabs without a viewer", () => {
    expect(parseFeedTab(undefined, false)).toBe("alle");
    expect(parseFeedTab("unsinn", true)).toBe("alle");
    expect(parseFeedTab(["zeugnisse"], false)).toBe("zeugnisse");
    expect(parseFeedTab("gefolgt", false)).toBe("alle");
    expect(parseFeedTab("gefolgt", true)).toBe("gefolgt");
    expect(parseFeedTab("meine", true)).toBe("meine");
  });

  it("maps ?art= to a post kind", () => {
    expect(parseKindParam("zeugnis")).toBe("TESTIMONY");
    expect(parseKindParam(["Frage"])).toBe("QUESTION");
    expect(parseKindParam("impuls")).toBe("IMPULSE");
    expect(parseKindParam("egal")).toBeUndefined();
    expect(parseKindParam(undefined)).toBeUndefined();
  });

  it("builds detail paths", () => {
    expect(postPath("abc")).toBe("/gemeinschaft/beitrag/abc");
  });
});
