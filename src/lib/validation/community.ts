import { z } from "zod";
import { formatReference, parseReference, parseVerseKey, verseKey } from "@/lib/bible/reference";

/**
 * Validation, labels and URL helpers for the community area ("Gemeinschaft":
 * posts, testimonies, questions, impulses). Pure module – usable from server
 * actions, client forms and unit tests alike.
 */

export const POST_KINDS = ["POST", "TESTIMONY", "QUESTION", "IMPULSE"] as const;
export type PostKindValue = (typeof POST_KINDS)[number];

export const POST_KIND_LABELS: Record<PostKindValue, { label: string; description: string }> = {
  POST: { label: "Beitrag", description: "Ein Gedanke, eine Erfahrung, ein Hinweis." },
  QUESTION: { label: "Frage", description: "Etwas, worauf du gern Antworten hättest." },
  TESTIMONY: { label: "Zeugnis", description: "Was Gott in deinem Leben getan hat." },
  IMPULSE: { label: "Impuls", description: "Ein kurzer Gedanke zum Mitnehmen." },
};

/** `?art=` values for /gemeinschaft/neu, mapped to post kinds. */
export const KIND_PARAMS: Record<string, PostKindValue> = {
  beitrag: "POST",
  frage: "QUESTION",
  zeugnis: "TESTIMONY",
  impuls: "IMPULSE",
};

export function parseKindParam(value: string | string[] | undefined): PostKindValue | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw ? KIND_PARAMS[raw.toLowerCase()] : undefined;
}

/** Posts can never be PRIVATE: a private post would have nobody to read it. */
export const POST_VISIBILITIES = ["PUBLIC", "MEMBERS", "GROUP"] as const;
export type PostVisibility = (typeof POST_VISIBILITIES)[number];

export const REACTION_KINDS = ["AMEN", "HEART", "PRAY"] as const;
export type ReactionKindValue = (typeof REACTION_KINDS)[number];

export const REACTION_LABELS: Record<ReactionKindValue, { label: string; emoji: string; pressed: string }> = {
  AMEN: { label: "Amen", emoji: "🙌", pressed: "Du hast Amen gesagt" },
  HEART: { label: "Herz", emoji: "❤️", pressed: "Du hast ein Herz dagelassen" },
  PRAY: { label: "Ich bete", emoji: "🙏", pressed: "Du betest mit" },
};

export function isReactionKind(value: unknown): value is ReactionKindValue {
  return typeof value === "string" && (REACTION_KINDS as readonly string[]).includes(value);
}

export const FEED_TABS = ["alle", "fragen", "zeugnisse", "impulse", "gefolgt", "meine"] as const;
export type FeedTab = (typeof FEED_TABS)[number];

export const FEED_TAB_LABELS: Record<FeedTab, string> = {
  alle: "Alle",
  fragen: "Fragen",
  zeugnisse: "Zeugnisse",
  impulse: "Impulse",
  gefolgt: "Gefolgt",
  meine: "Meine",
};

/** Tabs that only make sense for a signed-in viewer. */
export const MEMBER_ONLY_TABS: readonly FeedTab[] = ["gefolgt", "meine"];

/** Parses `?tab=` and falls back to "alle" for unknown values or member-only tabs without a viewer. */
export function parseFeedTab(value: string | string[] | undefined, signedIn: boolean): FeedTab {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || !(FEED_TABS as readonly string[]).includes(raw)) return "alle";
  const tab = raw as FeedTab;
  if (!signedIn && MEMBER_ONLY_TABS.includes(tab)) return "alle";
  return tab;
}

export const VERSE_REF_INVALID = "Diese Bibelstelle kennen wir nicht. Schreib sie z. B. als „Röm 8,28“.";
export const VERSE_REF_NEEDS_VERSE = "Bitte gib auch einen Vers an, z. B. „Röm 8,28“.";

/**
 * Turns a typed reference ("Röm 8,28", "Joh 3:16-18") into the stored verse
 * key ("45:8:28"). Ranges keep their first verse. Returns an error message
 * for unknown books or chapter-only references, null for empty input.
 */
export function verseRefToKey(input: string): { key: string } | { error: string } | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const ref = parseReference(trimmed);
  if (!ref) return { error: VERSE_REF_INVALID };
  if (!ref.verseStart) return { error: VERSE_REF_NEEDS_VERSE };
  return { key: verseKey(ref.book.number, ref.chapter, ref.verseStart) };
}

/** Stored key ("45:8:28") back to the form notation ("Römer 8,28"); empty for null/unknown keys. */
export function verseKeyToInput(key: string | null | undefined): string {
  if (!key) return "";
  const parsed = parseVerseKey(key);
  return parsed ? formatReference({ book: parsed.book, chapter: parsed.chapter, verseStart: parsed.verse }, "de") : "";
}

export const postTitleSchema = z.string().trim().max(120, "Der Titel darf höchstens 120 Zeichen lang sein.");

export const postBodySchema = z
  .string()
  .trim()
  .min(3, "Bitte schreib mindestens 3 Zeichen.")
  .max(8000, "Der Text darf höchstens 8000 Zeichen lang sein.");

const TITLE_REQUIRED: Partial<Record<PostKindValue, string>> = {
  TESTIMONY: "Dein Zeugnis braucht einen Titel.",
  QUESTION: "Deine Frage braucht einen kurzen Titel.",
};

export const postSchema = z
  .object({
    kind: z.enum(POST_KINDS, { error: "Bitte wähle, was du teilen möchtest." }),
    title: postTitleSchema.optional().default(""),
    body: postBodySchema,
    verseRef: z.string().trim().max(60, "Die Bibelstelle ist zu lang.").optional().default(""),
    visibility: z.enum(POST_VISIBILITIES, { error: "Bitte wähle, wer den Beitrag sehen darf." }),
    groupId: z.string().trim().max(64).optional().default(""),
  })
  .superRefine((data, ctx) => {
    const required = TITLE_REQUIRED[data.kind];
    if (!data.title && required) {
      ctx.addIssue({ code: "custom", path: ["title"], message: required });
    } else if (data.title && data.title.length < 3) {
      ctx.addIssue({ code: "custom", path: ["title"], message: "Der Titel braucht mindestens 3 Zeichen." });
    }
    const verse = verseRefToKey(data.verseRef);
    if (verse && "error" in verse) ctx.addIssue({ code: "custom", path: ["verseRef"], message: verse.error });
    if (data.visibility === "GROUP" && !data.groupId) {
      ctx.addIssue({ code: "custom", path: ["groupId"], message: "Bitte eine Gruppe wählen." });
    }
  })
  .transform((data) => {
    const verse = verseRefToKey(data.verseRef);
    return {
      kind: data.kind,
      title: data.title || null,
      body: data.body,
      verseRef: verse && "key" in verse ? verse.key : null,
      visibility: data.visibility,
      groupId: data.visibility === "GROUP" && data.groupId ? data.groupId : null,
    };
  });

export type PostInput = z.infer<typeof postSchema>;

export const postIdSchema = z.string().trim().min(1).max(64);

export const reactionSchema = z.object({
  postId: postIdSchema,
  kind: z.enum(REACTION_KINDS, { error: "Unbekannte Reaktion." }),
});

/** Path helpers shared by pages, actions and components. */
export function postPath(id: string): string {
  return `/gemeinschaft/beitrag/${id}`;
}

export function groupPath(slug: string): string {
  return `/gruppen/${slug}`;
}
