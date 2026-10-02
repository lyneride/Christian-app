import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  KIND_LABELS,
  RSVP_LABELS,
  WHEN_LABELS,
  buildEventSchema,
  createEventSchema,
  isHttpsUrl,
  parseCityFilter,
  parseEventKind,
  parseEventWhen,
  rsvpStatusSchema,
  updateEventSchema,
} from "./events";

function fieldErrors(result: z.ZodSafeParseResult<unknown>) {
  if (result.success) throw new Error("expected a validation failure");
  return z.flattenError(result.error).fieldErrors as Record<string, string[] | undefined>;
}

const NOW = new Date("2026-10-01T10:00:00Z");
const schema = buildEventSchema({ requireFuture: true, now: () => NOW });

const onsite = {
  title: "  Bibelabend  ",
  description: "Wir lesen gemeinsam den Römerbrief und tauschen uns aus.",
  startsAt: "2026-10-09T19:30",
  endsAt: "2026-10-09T21:00",
  location: " Gemeindehaus ",
  city: "Hamburg",
  visibility: "PUBLIC",
};

const online = {
  ...onsite,
  isOnline: "on",
  onlineUrl: "https://meet.example.org/abc",
  location: "",
  city: "",
};

describe("labels", () => {
  it("has German labels for every filter and rsvp status", () => {
    expect(Object.values(WHEN_LABELS).every((l) => l.length > 0)).toBe(true);
    expect(Object.values(KIND_LABELS).every((l) => l.length > 0)).toBe(true);
    expect(Object.values(RSVP_LABELS).every((l) => l.length > 0)).toBe(true);
  });
});

describe("event schema – on-site", () => {
  it("trims, converts Berlin times to UTC and nulls unused fields", () => {
    const r = schema.parse({ ...onsite, capacity: "" });
    expect(r).toEqual({
      title: "Bibelabend",
      description: "Wir lesen gemeinsam den Römerbrief und tauschen uns aus.",
      startsAt: new Date("2026-10-09T17:30:00Z"),
      endsAt: new Date("2026-10-09T19:00:00Z"),
      isOnline: false,
      onlineUrl: null,
      location: "Gemeindehaus",
      city: "Hamburg",
      visibility: "PUBLIC",
      groupId: null,
      capacity: null,
    });
  });

  it("requires location and city when not online", () => {
    const errors = fieldErrors(schema.safeParse({ ...onsite, location: "", city: "" }));
    expect(errors.location).toEqual(["Bitte gib an, wo ihr euch trefft."]);
    expect(errors.city).toEqual(["Bitte gib die Stadt an."]);
    const short = fieldErrors(schema.safeParse({ ...onsite, location: "x", city: "y" }));
    expect(short.location).toEqual(["Der Ort braucht mindestens 2 Zeichen."]);
    expect(short.city).toEqual(["Die Stadt braucht mindestens 2 Zeichen."]);
    expect(fieldErrors(schema.safeParse({ ...onsite, location: "x".repeat(201) })).location).toBeDefined();
    expect(fieldErrors(schema.safeParse({ ...onsite, city: "x".repeat(81) })).city).toBeDefined();
  });

  it("ignores a stray online link for on-site events", () => {
    expect(schema.parse({ ...onsite, onlineUrl: "https://x.example" }).onlineUrl).toBeNull();
  });
});

describe("event schema – online", () => {
  it("accepts an https link and drops the location", () => {
    const r = schema.parse(online);
    expect(r.isOnline).toBe(true);
    expect(r.onlineUrl).toBe("https://meet.example.org/abc");
    expect(r.location).toBeNull();
    expect(r.city).toBeNull();
  });

  it("requires an https url", () => {
    expect(fieldErrors(schema.safeParse({ ...online, onlineUrl: "" })).onlineUrl).toEqual([
      "Bitte gib den Link zum Online-Treffen an.",
    ]);
    expect(fieldErrors(schema.safeParse({ ...online, onlineUrl: "http://meet.example.org" })).onlineUrl).toEqual([
      "Der Link muss mit https:// beginnen.",
    ]);
    expect(fieldErrors(schema.safeParse({ ...online, onlineUrl: "meet.example.org" })).onlineUrl).toBeDefined();
    expect(isHttpsUrl("https://a.b/c?d=1")).toBe(true);
    expect(isHttpsUrl("javascript:alert(1)")).toBe(false);
  });

  it("keeps an optional city for online events but enforces its length", () => {
    expect(schema.parse({ ...online, city: "Köln" }).city).toBe("Köln");
    expect(fieldErrors(schema.safeParse({ ...online, city: "K" })).city).toBeDefined();
  });
});

describe("event schema – dates", () => {
  it("rejects missing, malformed and past starts", () => {
    expect(fieldErrors(schema.safeParse({ ...onsite, startsAt: "" })).startsAt).toEqual([
      "Bitte gib an, wann es losgeht.",
    ]);
    expect(fieldErrors(schema.safeParse({ ...onsite, startsAt: "morgen" })).startsAt).toEqual([
      "Bitte gib ein gültiges Datum mit Uhrzeit an.",
    ]);
    expect(fieldErrors(schema.safeParse({ ...onsite, startsAt: "2026-09-30T19:30", endsAt: "" })).startsAt).toEqual([
      "Der Beginn muss in der Zukunft liegen.",
    ]);
  });

  it("allows past starts when editing", () => {
    const edit = buildEventSchema({ requireFuture: false, now: () => NOW });
    expect(edit.safeParse({ ...onsite, startsAt: "2020-01-01T10:00", endsAt: "" }).success).toBe(true);
    expect(updateEventSchema.safeParse({ ...onsite, startsAt: "2020-01-01T10:00", endsAt: "" }).success).toBe(true);
    expect(createEventSchema.safeParse({ ...onsite, startsAt: "2020-01-01T10:00", endsAt: "" }).success).toBe(false);
  });

  it("treats an empty end as none and rejects an end before the start", () => {
    expect(schema.parse({ ...onsite, endsAt: "" }).endsAt).toBeNull();
    expect(schema.parse({ ...onsite, endsAt: undefined }).endsAt).toBeNull();
    expect(fieldErrors(schema.safeParse({ ...onsite, endsAt: "2026-10-09T19:00" })).endsAt).toEqual([
      "Das Ende darf nicht vor dem Beginn liegen.",
    ]);
    expect(fieldErrors(schema.safeParse({ ...onsite, endsAt: "nope" })).endsAt).toBeDefined();
    expect(schema.safeParse({ ...onsite, endsAt: "2026-10-09T19:30" }).success).toBe(true);
  });
});

describe("event schema – visibility, group, capacity", () => {
  it("requires a group for GROUP visibility and keeps the group otherwise", () => {
    expect(fieldErrors(schema.safeParse({ ...onsite, visibility: "GROUP" })).groupId).toEqual([
      "Bitte wähle eine Gruppe.",
    ]);
    expect(schema.parse({ ...onsite, visibility: "GROUP", groupId: "g1" }).groupId).toBe("g1");
    expect(schema.parse({ ...onsite, visibility: "PUBLIC", groupId: "g1" }).groupId).toBe("g1");
    expect(schema.parse({ ...onsite, groupId: "" }).groupId).toBeNull();
  });

  it("rejects PRIVATE and unknown visibilities", () => {
    expect(fieldErrors(schema.safeParse({ ...onsite, visibility: "PRIVATE" })).visibility).toEqual([
      "Bitte wähle, wer das Treffen sehen darf.",
    ]);
  });

  it("validates the capacity range", () => {
    expect(schema.parse({ ...onsite, capacity: "12" }).capacity).toBe(12);
    expect(fieldErrors(schema.safeParse({ ...onsite, capacity: "0" })).capacity).toEqual(["Mindestens 1 Platz."]);
    expect(fieldErrors(schema.safeParse({ ...onsite, capacity: "10001" })).capacity).toEqual([
      "Höchstens 10.000 Plätze.",
    ]);
    expect(fieldErrors(schema.safeParse({ ...onsite, capacity: "2.5" })).capacity).toEqual([
      "Bitte gib eine ganze Zahl an.",
    ]);
    expect(fieldErrors(schema.safeParse({ ...onsite, capacity: "viele" })).capacity).toBeDefined();
  });

  it("enforces title and description lengths", () => {
    const errors = fieldErrors(schema.safeParse({ ...onsite, title: "ab", description: "kurz" }));
    expect(errors.title).toEqual(["Der Titel braucht mindestens 3 Zeichen."]);
    expect(errors.description).toEqual(["Beschreib das Treffen mit mindestens 10 Zeichen."]);
    expect(fieldErrors(schema.safeParse({ ...onsite, title: "x".repeat(121) })).title).toBeDefined();
    expect(schema.safeParse({ ...onsite, description: "x".repeat(4000) }).success).toBe(true);
    expect(fieldErrors(schema.safeParse({ ...onsite, description: "x".repeat(4001) })).description).toBeDefined();
  });
});

describe("parsers", () => {
  it("fall back to defaults for unknown values", () => {
    expect(parseEventWhen(undefined)).toBe("kommend");
    expect(parseEventWhen("vergangen")).toBe("vergangen");
    expect(parseEventWhen(["vergangen"])).toBe("vergangen");
    expect(parseEventWhen("gestern")).toBe("kommend");
    expect(parseEventKind("online")).toBe("online");
    expect(parseEventKind("vor-ort")).toBe("vor-ort");
    expect(parseEventKind("xyz")).toBe("alle");
    expect(parseCityFilter("  Köln ")).toBe("Köln");
    expect(parseCityFilter("")).toBeUndefined();
    expect(parseCityFilter(undefined)).toBeUndefined();
    expect(parseCityFilter("x".repeat(100))?.length).toBe(80);
  });

  it("validates rsvp statuses", () => {
    expect(rsvpStatusSchema.safeParse("GOING").success).toBe(true);
    expect(rsvpStatusSchema.safeParse("YES").success).toBe(false);
  });
});
