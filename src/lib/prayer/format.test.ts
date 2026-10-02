import { describe, expect, it } from "vitest";
import { dayStart, moreSupportersLabel, supportSummary, todayKey } from "./format";

describe("todayKey", () => {
  it("formats the UTC date as YYYY-MM-DD", () => {
    expect(todayKey(new Date("2026-10-02T23:59:59.000Z"))).toBe("2026-10-02");
    expect(todayKey(new Date("2026-10-03T00:00:00.000Z"))).toBe("2026-10-03");
    expect(dayStart("2026-10-02").toISOString()).toBe("2026-10-02T00:00:00.000Z");
  });
});

describe("supportSummary", () => {
  it("describes no, single and several supporters without pressure", () => {
    expect(supportSummary({ total: 0, today: 0 })).toBe("Bisher hat noch niemand mitgebetet.");
    expect(supportSummary({ total: 1, today: 0 })).toBe("Eine Person hat mitgebetet.");
    expect(supportSummary({ total: 5, today: 0 })).toBe("5 Menschen haben mitgebetet.");
    expect(supportSummary({ total: 1, today: 1 })).toBe("Heute hat eine Person gebetet · eine Person insgesamt.");
    expect(supportSummary({ total: 12, today: 3 })).toBe("Heute haben 3 Menschen gebetet · 12 Menschen insgesamt.");
  });
});

describe("moreSupportersLabel", () => {
  it("returns null when nobody is hidden", () => {
    expect(moreSupportersLabel(0)).toBeNull();
    expect(moreSupportersLabel(1)).toBe("und eine weitere Person");
    expect(moreSupportersLabel(4)).toBe("und 4 weitere");
  });
});
