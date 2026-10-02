import { z } from "zod";

/**
 * Validation and labels for the prayer wall ("Gebet"). Pure module so it can
 * be used from server actions, client forms and unit tests alike.
 */

export const PRAYER_CATEGORIES = [
  "allgemein",
  "gesundheit",
  "familie",
  "arbeit",
  "glaube",
  "gemeinde",
  "beziehungen",
  "dank",
  "welt",
] as const;
export type PrayerCategory = (typeof PRAYER_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<PrayerCategory, { label: string; description: string }> = {
  allgemein: { label: "Allgemein", description: "Alles, was sonst nirgends hineinpasst." },
  gesundheit: { label: "Gesundheit", description: "Krankheit, Heilung, Kraft für den Alltag." },
  familie: { label: "Familie", description: "Ehe, Kinder, Eltern, das Zuhause." },
  arbeit: { label: "Arbeit & Ausbildung", description: "Beruf, Studium, Prüfungen, Entscheidungen." },
  glaube: { label: "Glaube", description: "Zweifel, Wachstum, Nähe zu Gott." },
  gemeinde: { label: "Gemeinde", description: "Deine Gemeinde, Mitarbeitende, Dienste." },
  beziehungen: { label: "Beziehungen", description: "Freundschaft, Partnerschaft, Versöhnung." },
  dank: { label: "Dank", description: "Wofür du dankbar bist – wir freuen uns mit." },
  welt: { label: "Welt", description: "Länder, Krisen, verfolgte Christen, Frieden." },
};

export function isPrayerCategory(value: unknown): value is PrayerCategory {
  return typeof value === "string" && (PRAYER_CATEGORIES as readonly string[]).includes(value);
}

/** Visibilities a prayer request may have (no PRIVATE: a private request would have nobody to pray). */
export const PRAYER_VISIBILITIES = ["PUBLIC", "MEMBERS", "GROUP"] as const;
export type PrayerVisibility = (typeof PRAYER_VISIBILITIES)[number];

export const PRAYER_FILTERS = ["alle", "offen", "erhoert", "meine", "gebetet"] as const;
export type PrayerFilter = (typeof PRAYER_FILTERS)[number];

/** Filters that only make sense for a signed-in viewer. */
export const MEMBER_ONLY_FILTERS: readonly PrayerFilter[] = ["meine", "gebetet"];

export const FILTER_LABELS: Record<PrayerFilter, string> = {
  alle: "Alle",
  offen: "Offen",
  erhoert: "Erhört",
  meine: "Meine",
  gebetet: "Mitgebetet",
};

/** Parses `?filter=` and falls back to "alle" for unknown values or member-only filters without a viewer. */
export function parsePrayerFilter(value: string | string[] | undefined, signedIn: boolean): PrayerFilter {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || !(PRAYER_FILTERS as readonly string[]).includes(raw)) return "alle";
  const filter = raw as PrayerFilter;
  if (!signedIn && MEMBER_ONLY_FILTERS.includes(filter)) return "alle";
  return filter;
}

/** Parses `?kategorie=`; unknown values mean "all categories". */
export function parsePrayerCategory(value: string | string[] | undefined): PrayerCategory | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return isPrayerCategory(raw) ? raw : undefined;
}

/** Checkbox values arrive as "on" (or are missing); booleans pass through. */
const checkbox = z.preprocess((v) => v === true || v === "on", z.boolean());

export const prayerTitleSchema = z
  .string()
  .trim()
  .min(3, "Der Titel braucht mindestens 3 Zeichen.")
  .max(120, "Der Titel darf höchstens 120 Zeichen lang sein.");

export const prayerBodySchema = z
  .string()
  .trim()
  .min(10, "Bitte beschreibe dein Anliegen mit mindestens 10 Zeichen.")
  .max(4000, "Das Anliegen darf höchstens 4000 Zeichen lang sein.");

export const answerNoteSchema = z.string().trim().max(2000, "Die Notiz darf höchstens 2000 Zeichen lang sein.");

export const prayerRequestSchema = z
  .object({
    title: prayerTitleSchema,
    body: prayerBodySchema,
    category: z.enum(PRAYER_CATEGORIES, { error: "Bitte eine Kategorie wählen." }),
    isAnonymous: checkbox,
    visibility: z.enum(PRAYER_VISIBILITIES, { error: "Bitte wähle, wer das Anliegen sehen darf." }),
    groupId: z.string().trim().max(64).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.visibility === "GROUP" && !data.groupId) {
      ctx.addIssue({ code: "custom", path: ["groupId"], message: "Bitte eine Gruppe wählen." });
    }
  })
  .transform((data) => ({
    ...data,
    groupId: data.visibility === "GROUP" && data.groupId ? data.groupId : null,
  }));

export type PrayerRequestInput = z.infer<typeof prayerRequestSchema>;

export const markAnsweredSchema = z.object({ answerNote: answerNoteSchema });
export type MarkAnsweredInput = z.infer<typeof markAnsweredSchema>;

export const PRAYER_STATUS_LABELS = {
  OPEN: "Offen",
  ANSWERED: "Erhört",
  CLOSED: "Geschlossen",
} as const;
