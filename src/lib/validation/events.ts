import { z } from "zod";
import { zonedLocalToUtc } from "@/lib/events/time";

/**
 * Validation, labels and URL-parameter parsing for events ("Treffen").
 * Pure module: used by server actions, client forms and unit tests alike.
 * Dates arrive as `<input type="datetime-local">` strings and are interpreted
 * as Europe/Berlin wall-clock time (see `@/lib/events/time`).
 */

export const EVENT_VISIBILITIES = ["PUBLIC", "MEMBERS", "GROUP"] as const;
export type EventVisibility = (typeof EVENT_VISIBILITIES)[number];

export const EVENT_WHEN = ["kommend", "vergangen"] as const;
export type EventWhen = (typeof EVENT_WHEN)[number];
export const WHEN_LABELS: Record<EventWhen, string> = { kommend: "Kommend", vergangen: "Vergangen" };

export const EVENT_KINDS = ["alle", "online", "vor-ort"] as const;
export type EventKind = (typeof EVENT_KINDS)[number];
export const KIND_LABELS: Record<EventKind, string> = { alle: "Alle", online: "Online", "vor-ort": "Vor Ort" };

export const RSVP_STATUSES = ["GOING", "MAYBE", "DECLINED"] as const;
export type RsvpStatusValue = (typeof RSVP_STATUSES)[number];
export const RSVP_LABELS: Record<RsvpStatusValue, string> = {
  GOING: "Ich bin dabei",
  MAYBE: "Vielleicht",
  DECLINED: "Kann nicht",
};

export const rsvpStatusSchema = z.enum(RSVP_STATUSES, { error: "Unbekannte Antwort." });

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** `?zeit=` – unknown values mean "kommend". */
export function parseEventWhen(value: string | string[] | undefined): EventWhen {
  const raw = first(value);
  return raw && (EVENT_WHEN as readonly string[]).includes(raw) ? (raw as EventWhen) : "kommend";
}

/** `?art=` – unknown values mean "alle". */
export function parseEventKind(value: string | string[] | undefined): EventKind {
  const raw = first(value);
  return raw && (EVENT_KINDS as readonly string[]).includes(raw) ? (raw as EventKind) : "alle";
}

/** `?ort=` – trimmed, capped at 80 characters, undefined when empty. */
export function parseCityFilter(value: string | string[] | undefined): string | undefined {
  const raw = first(value)?.trim().slice(0, 80);
  return raw ? raw : undefined;
}

export function isHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.length > 0;
  } catch {
    return false;
  }
}

/** Checkbox values arrive as "on" (or are missing); booleans pass through. */
const checkbox = z.preprocess((v) => v === true || v === "on" || v === "true", z.boolean());

const INVALID_DATE = "Bitte gib ein gültiges Datum mit Uhrzeit an.";

const startsAtSchema = z
  .string()
  .trim()
  .transform((value, ctx) => {
    if (!value) {
      ctx.addIssue({ code: "custom", message: "Bitte gib an, wann es losgeht." });
      return z.NEVER;
    }
    const date = zonedLocalToUtc(value);
    if (!date) {
      ctx.addIssue({ code: "custom", message: INVALID_DATE });
      return z.NEVER;
    }
    return date;
  });

const endsAtSchema = z
  .string()
  .trim()
  .optional()
  .transform((value, ctx) => {
    if (!value) return null;
    const date = zonedLocalToUtc(value);
    if (!date) {
      ctx.addIssue({ code: "custom", message: INVALID_DATE });
      return z.NEVER;
    }
    return date;
  });

const capacitySchema = z.preprocess(
  (v) => (v === "" || v === undefined || v === null ? undefined : v),
  z.coerce
    .number({ error: "Bitte gib eine Zahl an." })
    .int({ error: "Bitte gib eine ganze Zahl an." })
    .min(1, { error: "Mindestens 1 Platz." })
    .max(10_000, { error: "Höchstens 10.000 Plätze." })
    .optional(),
);

export const eventTitleSchema = z
  .string()
  .trim()
  .min(3, "Der Titel braucht mindestens 3 Zeichen.")
  .max(120, "Der Titel darf höchstens 120 Zeichen lang sein.");

export const eventDescriptionSchema = z
  .string()
  .trim()
  .min(10, "Beschreib das Treffen mit mindestens 10 Zeichen.")
  .max(4000, "Die Beschreibung darf höchstens 4000 Zeichen lang sein.");

const baseEventSchema = z.object({
  title: eventTitleSchema,
  description: eventDescriptionSchema,
  startsAt: startsAtSchema,
  endsAt: endsAtSchema,
  isOnline: checkbox,
  onlineUrl: z.string().trim().max(500, "Der Link ist zu lang.").optional(),
  location: z.string().trim().max(200, "Der Ort darf höchstens 200 Zeichen lang sein.").optional(),
  city: z.string().trim().max(80, "Die Stadt darf höchstens 80 Zeichen lang sein.").optional(),
  visibility: z.enum(EVENT_VISIBILITIES, { error: "Bitte wähle, wer das Treffen sehen darf." }),
  groupId: z.string().trim().max(64).optional(),
  capacity: capacitySchema,
});

export interface EventSchemaOptions {
  /** New events must start in the future; edits of past events may keep their date. */
  requireFuture?: boolean;
  /** Injectable clock for tests. */
  now?: () => Date;
}

export function buildEventSchema(options: EventSchemaOptions = {}) {
  const requireFuture = options.requireFuture ?? true;
  const now = options.now ?? (() => new Date());

  return baseEventSchema
    .superRefine((data, ctx) => {
      const issue = (path: string, message: string) => ctx.addIssue({ code: "custom", path: [path], message });

      if (requireFuture && data.startsAt.getTime() <= now().getTime()) {
        issue("startsAt", "Der Beginn muss in der Zukunft liegen.");
      }
      if (data.endsAt && data.endsAt.getTime() < data.startsAt.getTime()) {
        issue("endsAt", "Das Ende darf nicht vor dem Beginn liegen.");
      }

      if (data.isOnline) {
        if (!data.onlineUrl) issue("onlineUrl", "Bitte gib den Link zum Online-Treffen an.");
        else if (!isHttpsUrl(data.onlineUrl)) issue("onlineUrl", "Der Link muss mit https:// beginnen.");
        if (data.city && data.city.length < 2) issue("city", "Die Stadt braucht mindestens 2 Zeichen.");
      } else {
        if (!data.location) issue("location", "Bitte gib an, wo ihr euch trefft.");
        else if (data.location.length < 2) issue("location", "Der Ort braucht mindestens 2 Zeichen.");
        if (!data.city) issue("city", "Bitte gib die Stadt an.");
        else if (data.city.length < 2) issue("city", "Die Stadt braucht mindestens 2 Zeichen.");
      }

      if (data.visibility === "GROUP" && !data.groupId) issue("groupId", "Bitte wähle eine Gruppe.");
    })
    .transform((data) => ({
      title: data.title,
      description: data.description,
      startsAt: data.startsAt,
      endsAt: data.endsAt,
      isOnline: data.isOnline,
      onlineUrl: data.isOnline ? (data.onlineUrl ?? null) : null,
      location: data.isOnline ? null : (data.location ?? null),
      city: data.city || null,
      visibility: data.visibility,
      // A group may host public events too, so the group is kept for every visibility.
      groupId: data.groupId || null,
      capacity: data.capacity ?? null,
    }));
}

export const createEventSchema = buildEventSchema({ requireFuture: true });
export const updateEventSchema = buildEventSchema({ requireFuture: false });

export type EventInput = z.infer<typeof createEventSchema>;
