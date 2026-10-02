import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  AUDIT_ACTIONS,
  AUDIT_ACTION_LABELS,
  REPORT_STATUSES,
  REPORT_STATUS_LABELS,
  ROLE_LABELS,
  USER_ROLES,
  USER_STATUS_FILTERS,
  USER_STATUS_LABELS,
  auditActionLabel,
  parseReportStatus,
  parseRoleFilter,
  parseSearchQuery,
  parseStatusFilter,
  parseTargetType,
  removeContentSchema,
  resolveReportSchema,
  setUserRoleSchema,
  setUserStatusSchema,
  suspendUserSchema,
} from "./admin";

function fieldErrors(result: z.ZodSafeParseResult<unknown>) {
  if (result.success) throw new Error("expected a validation failure");
  return z.flattenError(result.error).fieldErrors as Record<string, string[] | undefined>;
}

describe("labels", () => {
  it("has a German label for every status, role and audit action", () => {
    for (const s of REPORT_STATUSES) expect(REPORT_STATUS_LABELS[s].length).toBeGreaterThan(0);
    for (const r of USER_ROLES) expect(ROLE_LABELS[r].length).toBeGreaterThan(0);
    for (const s of USER_STATUS_FILTERS) expect(USER_STATUS_LABELS[s].length).toBeGreaterThan(0);
    for (const a of AUDIT_ACTIONS) expect(AUDIT_ACTION_LABELS[a].length).toBeGreaterThan(0);
  });

  it("falls back to the raw action name for unknown audit actions", () => {
    expect(auditActionLabel("user.suspend")).toBe("Mitglied gesperrt");
    expect(auditActionLabel("legacy.thing")).toBe("legacy.thing");
  });
});

describe("resolveReportSchema", () => {
  it("accepts RESOLVED and DISMISSED with a trimmed note", () => {
    expect(resolveReportSchema.parse({ status: "RESOLVED", resolution: "  Beitrag entfernt.  " })).toEqual({
      status: "RESOLVED",
      resolution: "Beitrag entfernt.",
    });
    expect(resolveReportSchema.parse({ status: "DISMISSED", resolution: "" }).status).toBe("DISMISSED");
  });

  it("rejects OPEN and unknown statuses", () => {
    expect(fieldErrors(resolveReportSchema.safeParse({ status: "OPEN", resolution: "" })).status).toEqual([
      "Bitte wähle, wie die Meldung abgeschlossen wird.",
    ]);
    expect(resolveReportSchema.safeParse({ status: "", resolution: "" }).success).toBe(false);
  });

  it("caps the note at 1000 characters", () => {
    expect(resolveReportSchema.safeParse({ status: "RESOLVED", resolution: "x".repeat(1000) }).success).toBe(true);
    expect(fieldErrors(resolveReportSchema.safeParse({ status: "RESOLVED", resolution: "x".repeat(1001) })).resolution).toEqual([
      "Die Notiz darf höchstens 1000 Zeichen lang sein.",
    ]);
  });
});

describe("setUserRoleSchema / setUserStatusSchema", () => {
  it("only accepts the three roles", () => {
    for (const role of USER_ROLES) expect(setUserRoleSchema.parse({ role })).toEqual({ role });
    expect(fieldErrors(setUserRoleSchema.safeParse({ role: "OWNER" })).role).toEqual(["Unbekannte Rolle."]);
  });

  it("only accepts ACTIVE and SUSPENDED as a status (never DELETED)", () => {
    expect(setUserStatusSchema.parse({ status: "SUSPENDED", reason: " Spam " })).toEqual({ status: "SUSPENDED", reason: "Spam" });
    expect(setUserStatusSchema.parse({ status: "ACTIVE", reason: "" }).status).toBe("ACTIVE");
    expect(fieldErrors(setUserStatusSchema.safeParse({ status: "DELETED", reason: "" })).status).toEqual(["Unbekannter Status."]);
    expect(fieldErrors(setUserStatusSchema.safeParse({ status: "SUSPENDED", reason: "x".repeat(501) })).reason).toEqual([
      "Die Begründung darf höchstens 500 Zeichen lang sein.",
    ]);
  });
});

describe("suspendUserSchema / removeContentSchema", () => {
  it("requires a short reason and caps it at 500 characters", () => {
    expect(suspendUserSchema.parse({ reason: "  Wiederholter Spam  " })).toEqual({ reason: "Wiederholter Spam" });
    expect(fieldErrors(suspendUserSchema.safeParse({ reason: "  " })).reason).toEqual([
      "Bitte gib eine kurze Begründung an (mindestens 3 Zeichen).",
    ]);
    expect(suspendUserSchema.safeParse({ reason: "x".repeat(500) }).success).toBe(true);
    expect(suspendUserSchema.safeParse({ reason: "x".repeat(501) }).success).toBe(false);
  });

  it("validates the target of a removal", () => {
    expect(removeContentSchema.parse({ targetType: "post", targetId: " p1 ", reason: "Werbung" })).toEqual({
      targetType: "post",
      targetId: "p1",
      reason: "Werbung",
    });
    const errors = fieldErrors(removeContentSchema.safeParse({ targetType: "video", targetId: "", reason: "" }));
    expect(errors.targetType).toEqual(["Unbekannter Inhaltstyp."]);
    expect(errors.targetId).toEqual(["Unbekannter Inhalt."]);
    expect(errors.reason).toBeDefined();
  });
});

describe("search-param parsers", () => {
  it("parses the report status with OPEN as fallback", () => {
    expect(parseReportStatus(undefined)).toBe("OPEN");
    expect(parseReportStatus("RESOLVED")).toBe("RESOLVED");
    expect(parseReportStatus(["DISMISSED"])).toBe("DISMISSED");
    expect(parseReportStatus("egal")).toBe("OPEN");
  });

  it("parses role and status filters, undefined for unknown values", () => {
    expect(parseRoleFilter("ADMIN")).toBe("ADMIN");
    expect(parseRoleFilter("king")).toBeUndefined();
    expect(parseRoleFilter(undefined)).toBeUndefined();
    expect(parseStatusFilter("DELETED")).toBe("DELETED");
    expect(parseStatusFilter(["SUSPENDED"])).toBe("SUSPENDED");
    expect(parseStatusFilter("nope")).toBeUndefined();
  });

  it("normalises the search query", () => {
    expect(parseSearchQuery("  maria   müller ")).toBe("maria müller");
    expect(parseSearchQuery(undefined)).toBe("");
    expect(parseSearchQuery("x".repeat(100)).length).toBe(80);
  });

  it("only accepts known target types", () => {
    expect(parseTargetType("comment")).toBe("comment");
    expect(parseTargetType("video")).toBeNull();
    expect(parseTargetType(42)).toBeNull();
  });
});
