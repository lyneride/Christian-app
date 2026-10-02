import { describe, expect, it } from "vitest";
import {
  chaptersSummary,
  dateFromString,
  dueSummary,
  formatJournalDate,
  monthLabel,
  toDateString,
  weekSummary,
} from "./format";

describe("study format helpers", () => {
  it("formats journal dates and months in German without timezone shifts", () => {
    expect(formatJournalDate("2026-10-02")).toBe("Freitag, 2. Oktober 2026");
    expect(formatJournalDate("2026-01-01", "d. MMM")).toBe("1. Jan.");
    expect(monthLabel("2026-10")).toBe("Oktober 2026");
    expect(dateFromString("2024-02-29").getDate()).toBe(29);
  });

  it("builds a local YYYY-MM-DD string", () => {
    expect(toDateString(new Date(2026, 9, 2, 23, 59))).toBe("2026-10-02");
    expect(toDateString(new Date(2026, 0, 5, 0, 1))).toBe("2026-01-05");
  });

  it("produces warm summaries", () => {
    expect(weekSummary(5)).toBe("Diese Woche: 5 Kapitel");
    expect(chaptersSummary(12, 1189)).toBe("12 von 1189 Kapiteln gelesen");
    expect(dueSummary(0)).toBe("Heute ist nichts dran.");
    expect(dueSummary(1)).toBe("Ein Vers ist heute dran.");
    expect(dueSummary(3)).toBe("3 Verse sind heute dran.");
  });
});
