import { z } from "zod";
import { BOOK_COUNT } from "@/lib/bible/books";
import { parseReference } from "@/lib/bible/reference";

/**
 * Validation for the personal study tools ("Meine Bibel", "Tagebuch", "Merken").
 * Pure module: usable from server actions, client forms and unit tests alike.
 */

// ---------------------------------------------------------------------------
// Verse keys
// ---------------------------------------------------------------------------

/** "<book>:<chapter>:<verse>" with the canonical book number (1–66). */
export const VERSE_KEY_RE = /^\d{1,2}:\d{1,3}:\d{1,3}$/;

const VERSE_KEY_ERROR = "Diese Bibelstelle ist ungültig.";

export const verseKeySchema = z
  .string()
  .trim()
  .regex(VERSE_KEY_RE, { error: VERSE_KEY_ERROR })
  .refine(
    (key) => {
      const [book, chapter, verse] = key.split(":").map(Number);
      return book >= 1 && book <= BOOK_COUNT && chapter >= 1 && verse >= 1;
    },
    { error: VERSE_KEY_ERROR },
  );

/** Verse number of a (valid) verse key. */
export function verseOfKey(key: string): number {
  return Number(key.split(":")[2]);
}

// ---------------------------------------------------------------------------
// Highlights
// ---------------------------------------------------------------------------

export const HIGHLIGHT_COLOR_VALUES = ["yellow", "green", "blue", "pink", "orange"] as const;
export type HighlightColor = (typeof HIGHLIGHT_COLOR_VALUES)[number];

export const highlightColorSchema = z.enum(HIGHLIGHT_COLOR_VALUES, { error: "Bitte eine Farbe wählen." });

export function isHighlightColor(value: unknown): value is HighlightColor {
  return typeof value === "string" && (HIGHLIGHT_COLOR_VALUES as readonly string[]).includes(value);
}

export const MAX_HIGHLIGHT_VERSES = 200;

export const setHighlightSchema = z.object({
  verseKeys: z
    .array(verseKeySchema)
    .min(1, { error: "Bitte mindestens einen Vers auswählen." })
    .max(MAX_HIGHLIGHT_VERSES, { error: `Bitte höchstens ${MAX_HIGHLIGHT_VERSES} Verse auf einmal markieren.` }),
  color: highlightColorSchema.nullable(),
});
export type SetHighlightInput = z.infer<typeof setHighlightSchema>;

// ---------------------------------------------------------------------------
// Shared field helpers
// ---------------------------------------------------------------------------

/** Empty strings from forms become `undefined` so optional fields validate. */
const emptyToUndefined = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);

const optionalText = (max: number, label: string) =>
  z.preprocess(
    emptyToUndefined,
    z
      .string()
      .trim()
      .max(max, { error: `${label} darf höchstens ${max} Zeichen lang sein.` })
      .optional(),
  );

const optionalVerseNumber = z.preprocess(
  emptyToUndefined,
  z.coerce
    .number({ error: "Bitte eine Versnummer eingeben." })
    .int({ error: "Bitte eine ganze Versnummer eingeben." })
    .min(1, { error: "Die Versnummer muss mindestens 1 sein." })
    .max(999, { error: "Diese Versnummer gibt es nicht." })
    .optional(),
);

const optionalVerseKey = z.preprocess(emptyToUndefined, verseKeySchema.optional());

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

/** Visibilities a note may have; shared notes appear on the owner's profile. */
export const NOTE_VISIBILITIES = ["PRIVATE", "MEMBERS"] as const;
export type NoteVisibility = (typeof NOTE_VISIBILITIES)[number];

export const NOTE_VISIBILITY_LABELS: Record<NoteVisibility, { label: string; hint: string }> = {
  PRIVATE: { label: "Privat", hint: "Nur du siehst diese Notiz." },
  MEMBERS: { label: "Mit Mitgliedern teilen", hint: "Angemeldete Mitglieder sehen die Notiz auf deinem Profil." },
};

export const noteSchema = z
  .object({
    verseKey: verseKeySchema,
    verseEnd: optionalVerseNumber,
    title: optionalText(120, "Der Titel"),
    body: z
      .string()
      .trim()
      .min(1, { error: "Bitte schreib etwas in deine Notiz." })
      .max(5000, { error: "Die Notiz darf höchstens 5000 Zeichen lang sein." }),
    visibility: z.enum(NOTE_VISIBILITIES, { error: "Bitte wähle, wer die Notiz sehen darf." }),
  })
  .superRefine((data, ctx) => {
    if (data.verseEnd !== undefined && data.verseEnd < verseOfKey(data.verseKey)) {
      ctx.addIssue({ code: "custom", path: ["verseEnd"], message: "Der letzte Vers darf nicht vor dem ersten liegen." });
    }
  });
export type NoteInput = z.infer<typeof noteSchema>;

// ---------------------------------------------------------------------------
// Bookmarks
// ---------------------------------------------------------------------------

export const bookmarkSchema = z.object({
  verseKey: verseKeySchema,
  label: optionalText(80, "Die Bezeichnung"),
});
export type BookmarkInput = z.infer<typeof bookmarkSchema>;

// ---------------------------------------------------------------------------
// Reading log
// ---------------------------------------------------------------------------

export const chapterReadSchema = z.object({
  book: z.coerce.number().int().min(1).max(BOOK_COUNT),
  chapter: z.coerce.number().int().min(1).max(150),
  translation: z
    .string()
    .trim()
    .min(1)
    .max(20)
    .regex(/^[A-Za-z0-9]+$/),
});
export type ChapterReadInput = z.infer<typeof chapterReadSchema>;

// ---------------------------------------------------------------------------
// Journal
// ---------------------------------------------------------------------------

export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** "YYYY-MM-DD" that is also a real calendar date. */
export function isValidDateString(value: string): boolean {
  if (!DATE_RE.test(value)) return false;
  const d = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

export const dateStringSchema = z
  .string()
  .trim()
  .refine(isValidDateString, { error: "Bitte ein gültiges Datum wählen." });

export const journalEntrySchema = z.object({
  date: dateStringSchema,
  title: optionalText(120, "Der Titel"),
  body: z
    .string()
    .trim()
    .min(1, { error: "Bitte schreib auf, was dich bewegt." })
    .max(10_000, { error: "Der Eintrag darf höchstens 10.000 Zeichen lang sein." }),
  gratitude: optionalText(2000, "Dieser Abschnitt"),
  prayer: optionalText(2000, "Dieser Abschnitt"),
  verseKey: optionalVerseKey,
});
export type JournalEntryInput = z.infer<typeof journalEntrySchema>;

export const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

/** Parses `?monat=YYYY-MM`; anything else means "all months". */
export function parseMonth(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw && MONTH_RE.test(raw) ? raw : undefined;
}

// ---------------------------------------------------------------------------
// Memory verses (Leitner)
// ---------------------------------------------------------------------------

export const translationIdSchema = z
  .string()
  .trim()
  .min(1, { error: "Bitte eine Übersetzung wählen." })
  .max(20, { error: "Bitte eine Übersetzung wählen." })
  .regex(/^[A-Za-z0-9]+$/, { error: "Bitte eine Übersetzung wählen." });

export interface MemoryReference {
  /** canonical book number 1–66 */
  book: number;
  chapter: number;
  verseStart: number;
  /** only set for ranges within the same chapter */
  verseEnd?: number;
}

const REFERENCE_ERROR = "Bitte eine Bibelstelle mit Vers angeben, z. B. Johannes 3,16 oder Psalm 23,1-3.";

/** A typed reference such as "Joh 3,16" or "Psalm 23,1-3" (verse required, range within one chapter). */
export const memoryReferenceSchema = z
  .string()
  .trim()
  .min(1, { error: "Bitte eine Bibelstelle eingeben." })
  .max(60, { error: REFERENCE_ERROR })
  .transform((raw, ctx): MemoryReference => {
    const ref = parseReference(raw);
    if (!ref || !ref.verseStart) {
      ctx.addIssue({ code: "custom", message: REFERENCE_ERROR });
      return z.NEVER;
    }
    const out: MemoryReference = { book: ref.book.number, chapter: ref.chapter, verseStart: ref.verseStart };
    if (ref.verseEnd && ref.verseEnd !== ref.verseStart) out.verseEnd = ref.verseEnd;
    return out;
  });

export const memoryVerseAddSchema = z.object({
  reference: memoryReferenceSchema,
  translation: translationIdSchema,
});
export type MemoryVerseAddInput = z.infer<typeof memoryVerseAddSchema>;

export const REVIEW_RESULTS = ["known", "unknown"] as const;
export type ReviewResult = (typeof REVIEW_RESULTS)[number];

export const memoryReviewSchema = z.object({
  id: z.string().trim().min(1).max(64),
  result: z.enum(REVIEW_RESULTS, { error: "Ungültiges Ergebnis." }),
});
export type MemoryReviewInput = z.infer<typeof memoryReviewSchema>;
