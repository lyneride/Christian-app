import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  REPORT_REASONS,
  REPORT_REASON_LABELS,
  REPORT_TARGET_LABELS,
  REPORT_TARGET_TYPES,
  createReportSchema,
} from "./report";

function fieldErrors(result: z.ZodSafeParseResult<unknown>) {
  if (result.success) throw new Error("expected a validation failure");
  return z.flattenError(result.error).fieldErrors as Record<string, string[] | undefined>;
}

describe("createReportSchema", () => {
  it("accepts a known target and reason, details optional", () => {
    expect(createReportSchema.parse({ targetType: "prayer", targetId: "p1", reason: "spam" })).toEqual({
      targetType: "prayer",
      targetId: "p1",
      reason: "spam",
      details: "",
    });
  });

  it("rejects unknown reasons and overlong details", () => {
    expect(
      fieldErrors(createReportSchema.safeParse({ targetType: "post", targetId: "x", reason: "egal" })).reason,
    ).toEqual(["Bitte einen Grund wählen."]);
    expect(
      createReportSchema.safeParse({ targetType: "post", targetId: "x", reason: "anderes", details: "x".repeat(1001) })
        .success,
    ).toBe(false);
  });

  it("has labels for every reason and target type", () => {
    for (const r of REPORT_REASONS) expect(REPORT_REASON_LABELS[r].length).toBeGreaterThan(0);
    for (const t of REPORT_TARGET_TYPES) expect(REPORT_TARGET_LABELS[t].length).toBeGreaterThan(0);
  });
});
