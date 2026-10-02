import { describe, expect, it } from "vitest";
import { z } from "zod";
import { slugify } from "@/lib/utils";
import {
  GROUP_FILTERS,
  GROUP_FILTER_LABELS,
  GROUP_KINDS,
  GROUP_KIND_LABELS,
  GROUP_ROLES,
  GROUP_ROLE_LABELS,
  GROUP_VISIBILITIES,
  GROUP_VISIBILITY_LABELS,
  changeRoleSchema,
  filterToKind,
  groupSchema,
  groupSlugBase,
  parseGroupFilter,
  parseTextFilter,
} from "./groups";

function fieldErrors(result: z.ZodSafeParseResult<unknown>) {
  if (result.success) throw new Error("expected a validation failure");
  return z.flattenError(result.error).fieldErrors as Record<string, string[] | undefined>;
}

const valid = {
  name: "  Hauskreis Nord  ",
  description: "Wir treffen uns jeden Dienstag zum Bibellesen und Beten.",
  kind: "ONLINE",
  city: "",
  visibility: "PUBLIC",
  imageUrl: "",
};

describe("labels", () => {
  it("has German labels for kinds, visibilities, roles and filters", () => {
    for (const k of GROUP_KINDS) expect(GROUP_KIND_LABELS[k].label.length).toBeGreaterThan(0);
    for (const v of GROUP_VISIBILITIES) expect(GROUP_VISIBILITY_LABELS[v].label.length).toBeGreaterThan(0);
    for (const r of GROUP_ROLES) expect(GROUP_ROLE_LABELS[r].length).toBeGreaterThan(0);
    for (const f of GROUP_FILTERS) expect(GROUP_FILTER_LABELS[f].length).toBeGreaterThan(0);
  });
});

describe("groupSchema", () => {
  it("trims and turns empty optionals into null", () => {
    expect(groupSchema.parse(valid)).toEqual({
      name: "Hauskreis Nord",
      description: valid.description,
      kind: "ONLINE",
      city: null,
      visibility: "PUBLIC",
      imageUrl: null,
    });
  });

  it("requires a city for local groups", () => {
    expect(fieldErrors(groupSchema.safeParse({ ...valid, kind: "LOCAL" })).city).toEqual(["Für eine Gruppe vor Ort brauchen wir die Stadt."]);
    expect(groupSchema.parse({ ...valid, kind: "LOCAL", city: " Hamburg " }).city).toBe("Hamburg");
    expect(fieldErrors(groupSchema.safeParse({ ...valid, city: "H" })).city).toBeDefined();
    expect(fieldErrors(groupSchema.safeParse({ ...valid, city: "x".repeat(81) })).city).toBeDefined();
  });

  it("only accepts https image urls", () => {
    expect(groupSchema.parse({ ...valid, imageUrl: "https://example.org/bild.jpg" }).imageUrl).toBe("https://example.org/bild.jpg");
    expect(fieldErrors(groupSchema.safeParse({ ...valid, imageUrl: "http://example.org/bild.jpg" })).imageUrl).toBeDefined();
    expect(fieldErrors(groupSchema.safeParse({ ...valid, imageUrl: "kein-link" })).imageUrl).toBeDefined();
  });

  it("enforces name and description lengths with German messages", () => {
    const errors = fieldErrors(groupSchema.safeParse({ ...valid, name: "ab", description: "zu kurz" }));
    expect(errors.name).toEqual(["Der Name braucht mindestens 3 Zeichen."]);
    expect(errors.description).toEqual(["Beschreibe die Gruppe mit mindestens 10 Zeichen."]);
    expect(fieldErrors(groupSchema.safeParse({ ...valid, name: "x".repeat(61) })).name).toBeDefined();
    expect(groupSchema.safeParse({ ...valid, description: "x".repeat(2000) }).success).toBe(true);
    expect(fieldErrors(groupSchema.safeParse({ ...valid, description: "x".repeat(2001) })).description).toBeDefined();
  });

  it("rejects unknown kinds and MEMBERS/GROUP visibility", () => {
    expect(fieldErrors(groupSchema.safeParse({ ...valid, kind: "HYBRID" })).kind).toBeDefined();
    expect(fieldErrors(groupSchema.safeParse({ ...valid, visibility: "MEMBERS" })).visibility).toEqual([
      "Bitte wähle, wie man der Gruppe beitreten kann.",
    ]);
  });
});

describe("changeRoleSchema", () => {
  it("accepts the three roles", () => {
    expect(changeRoleSchema.safeParse({ groupId: "g", userId: "u", role: "ADMIN" }).success).toBe(true);
    expect(changeRoleSchema.safeParse({ groupId: "g", userId: "u", role: "BOSS" }).success).toBe(false);
  });
});

describe("filters and slugs", () => {
  it("parses ?art= and maps it to a kind", () => {
    expect(parseGroupFilter(undefined)).toBe("alle");
    expect(parseGroupFilter("online")).toBe("online");
    expect(parseGroupFilter(["vor-ort"])).toBe("vor-ort");
    expect(parseGroupFilter("hybrid")).toBe("alle");
    expect(filterToKind("online")).toBe("ONLINE");
    expect(filterToKind("vor-ort")).toBe("LOCAL");
    expect(filterToKind("alle")).toBeUndefined();
  });

  it("trims and caps text filters", () => {
    expect(parseTextFilter("  Ber lin  ")).toBe("Ber lin");
    expect(parseTextFilter(["x".repeat(100)]).length).toBe(80);
    expect(parseTextFilter(undefined)).toBe("");
  });

  it("builds a slug base with a fallback", () => {
    expect(groupSlugBase("Hauskreis Nord", slugify)).toBe("hauskreis-nord");
    expect(groupSlugBase("!!!", slugify)).toBe("gruppe");
  });
});
