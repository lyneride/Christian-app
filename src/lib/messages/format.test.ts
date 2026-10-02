import { describe, expect, it } from "vitest";
import { dayLabel, groupByDay, messagePreview, parseBefore, unreadLabel } from "./format";

describe("messagePreview", () => {
  it("collapses whitespace and line breaks", () => {
    expect(messagePreview("Hallo\n\n  Maria,   wie geht's?")).toBe("Hallo Maria, wie geht's?");
  });

  it("cuts long text at a word boundary with an ellipsis", () => {
    const text = "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore";
    const preview = messagePreview(text, 40);
    expect(preview.length).toBeLessThanOrEqual(42);
    expect(preview.endsWith(" …")).toBe(true);
    expect(preview).toBe("Lorem ipsum dolor sit amet consectetur …");
  });

  it("falls back to a hard cut when there is no usable word boundary", () => {
    expect(messagePreview("x".repeat(100), 10)).toBe("xxxxxxxxxx …");
  });
});

describe("dayLabel", () => {
  it("names today and yesterday and formats other days in German", () => {
    const now = new Date();
    expect(dayLabel(now, now)).toBe("Heute");
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    expect(dayLabel(yesterday, now)).toBe("Gestern");
    expect(dayLabel(new Date(2025, 2, 12, 10), new Date(2026, 9, 2))).toBe("12. März 2025");
  });
});

describe("groupByDay", () => {
  it("groups consecutive messages of the same day", () => {
    const items = [
      { id: "a", createdAt: new Date(2025, 0, 1, 9) },
      { id: "b", createdAt: new Date(2025, 0, 1, 18) },
      { id: "c", createdAt: new Date(2025, 0, 2, 8) },
    ];
    const groups = groupByDay(items, new Date(2026, 9, 2));
    expect(groups.map((g) => g.items.map((i) => i.id))).toEqual([["a", "b"], ["c"]]);
    expect(groups[0]!.key).toBe("2025-01-01");
    expect(groups[0]!.label).toBe("1. Januar 2025");
    expect(groupByDay([])).toEqual([]);
  });
});

describe("parseBefore / unreadLabel", () => {
  it("parses ISO timestamps and ignores junk", () => {
    expect(parseBefore("2026-10-02T10:00:00.000Z")?.toISOString()).toBe("2026-10-02T10:00:00.000Z");
    expect(parseBefore("gestern")).toBeUndefined();
    expect(parseBefore(undefined)).toBeUndefined();
    expect(parseBefore(["2026-10-02T10:00:00.000Z"])?.getTime()).toBe(Date.UTC(2026, 9, 2, 10));
  });

  it("pluralises the unread label", () => {
    expect(unreadLabel(1)).toBe("1 ungelesene Nachricht");
    expect(unreadLabel(4)).toBe("4 ungelesene Nachrichten");
  });
});
