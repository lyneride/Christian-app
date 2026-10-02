"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getUserOrThrow, UnauthorizedError, type CurrentUser } from "@/lib/auth/dal";
import { failure, fieldErrors, safeNext, stringValues, success, type ActionState } from "@/lib/action-state";
import { getBookByNumber } from "@/lib/bible/books";
import { getTranslation, getVerses, resolveTranslationId } from "@/lib/bible/data";
import { formatReference, parseReference, verseKey as makeVerseKey } from "@/lib/bible/reference";
import { localeFor } from "@/lib/bible/ui";
import {
  bookmarkSchema,
  chapterReadSchema,
  journalEntrySchema,
  memoryReviewSchema,
  memoryVerseAddSchema,
  noteSchema,
  setHighlightSchema,
  type HighlightColor,
  type ReviewResult,
} from "@/lib/validation/study";
import { nextState } from "./leitner";

/**
 * Server actions for the personal study tools. Every action re-checks the
 * user, validates with Zod and returns an ActionState (expected failures are
 * returned, never thrown). Form actions use the `(prevState, formData)`
 * signature for `useActionState`; the reader calls the plain variants.
 */

const LOGIN_REQUIRED = "Bitte melde dich an.";
const GENERIC_ERROR = "Das hat leider nicht geklappt. Bitte versuche es später noch einmal.";
const CHECK_INPUT = "Bitte prüfe deine Eingaben.";

async function actionUser(): Promise<CurrentUser | null> {
  try {
    return await getUserOrThrow();
  } catch (err) {
    if (err instanceof UnauthorizedError) return null;
    throw err;
  }
}

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}

/** Relative redirect target or null (only in-app paths are followed). */
function redirectTarget(next: string | undefined): string | null {
  if (!next) return null;
  const safe = safeNext(next, "");
  return safe || null;
}

/** "YYYY-MM-DD" (UTC) – one reading-log row per chapter and day. */
function todayKey(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

function revalidateReader() {
  revalidatePath("/bibel", "layout");
}

function revalidateMeineBibel() {
  revalidatePath("/meine-bibel", "layout");
}

function revalidateTagebuch() {
  revalidatePath("/tagebuch", "layout");
}

function revalidateMerken() {
  revalidatePath("/merken", "layout");
}

// ---------------------------------------------------------------------------
// Highlights
// ---------------------------------------------------------------------------

/**
 * Sets (or with `color = null` removes) the highlight on a set of verses.
 * Called by the reader's action bar with the selected verse keys.
 */
export async function setHighlight(
  verseKeys: string[],
  color: HighlightColor | null,
  translation?: string,
): Promise<ActionState> {
  const user = await actionUser();
  if (!user) return failure(LOGIN_REQUIRED);

  const parsed = setHighlightSchema.safeParse({ verseKeys, color });
  if (!parsed.success) return failure(CHECK_INPUT, { errors: fieldErrors(parsed.error) });
  const keys = [...new Set(parsed.data.verseKeys)];

  try {
    if (parsed.data.color === null) {
      await prisma.highlight.deleteMany({ where: { userId: user.id, verseKey: { in: keys } } });
    } else {
      const t = await resolveTranslationId(translation ?? user.preferredTranslation);
      const c = parsed.data.color;
      await prisma.$transaction(
        keys.map((key) =>
          prisma.highlight.upsert({
            where: { userId_verseKey: { userId: user.id, verseKey: key } },
            create: { userId: user.id, verseKey: key, color: c, translation: t },
            update: { color: c, translation: t },
          }),
        ),
      );
    }
  } catch (err) {
    console.error("[meine-bibel] Markierung konnte nicht gespeichert werden:", err);
    return failure(GENERIC_ERROR);
  }

  revalidateReader();
  revalidateMeineBibel();
  return success(undefined, { data: { count: keys.length, color: parsed.data.color } });
}

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

function noteValues(formData: FormData): Record<string, string> {
  const v = stringValues(formData);
  return { verseKey: v.verseKey ?? "", verseEnd: v.verseEnd ?? "", title: v.title ?? "", body: v.body ?? "", visibility: v.visibility ?? "PRIVATE" };
}

/** Creates a note on a verse (hidden `verseKey` field, optional `verseEnd`, `title`, `body`, `visibility`). */
export async function addNote(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const values = noteValues(formData);
  const user = await actionUser();
  if (!user) return failure(LOGIN_REQUIRED, { values });

  const parsed = noteSchema.safeParse(values);
  if (!parsed.success) return failure(CHECK_INPUT, { errors: fieldErrors(parsed.error), values });

  let id: string;
  try {
    const created = await prisma.note.create({
      data: {
        userId: user.id,
        verseKey: parsed.data.verseKey,
        verseEnd: parsed.data.verseEnd ?? null,
        title: parsed.data.title ?? null,
        body: parsed.data.body,
        visibility: parsed.data.visibility,
      },
      select: { id: true },
    });
    id = created.id;
  } catch (err) {
    console.error("[meine-bibel] Notiz konnte nicht gespeichert werden:", err);
    return failure(GENERIC_ERROR, { values });
  }

  revalidateReader();
  revalidateMeineBibel();
  return success("Notiz gespeichert.", { data: { id } });
}

/** Bound with `.bind(null, id)`. Keeps the verse, updates the rest, then returns to the notes list. */
export async function updateNote(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const values = noteValues(formData);
  const user = await actionUser();
  if (!user) return failure(LOGIN_REQUIRED, { values });

  const existing = await prisma.note.findFirst({ where: { id, userId: user.id }, select: { verseKey: true } });
  if (!existing) return failure("Diese Notiz gibt es nicht mehr.");

  const parsed = noteSchema.safeParse({ ...values, verseKey: existing.verseKey });
  if (!parsed.success) return failure(CHECK_INPUT, { errors: fieldErrors(parsed.error), values });

  try {
    await prisma.note.update({
      where: { id },
      data: {
        verseEnd: parsed.data.verseEnd ?? null,
        title: parsed.data.title ?? null,
        body: parsed.data.body,
        visibility: parsed.data.visibility,
      },
    });
  } catch (err) {
    console.error("[meine-bibel] Notiz konnte nicht aktualisiert werden:", err);
    return failure(GENERIC_ERROR, { values });
  }

  revalidateReader();
  revalidateMeineBibel();
  const target = redirectTarget(str(formData, "next"));
  if (target) redirect(target);
  return success("Notiz gespeichert.");
}

/** Bound with `.bind(null, id)` (optionally `.bind(null, id, "/meine-bibel?bereich=notizen")`). */
export async function deleteNote(id: string, next?: string): Promise<ActionState> {
  const user = await actionUser();
  if (!user) return failure(LOGIN_REQUIRED);

  const existing = await prisma.note.findFirst({ where: { id, userId: user.id }, select: { id: true } });
  if (!existing) return failure("Diese Notiz gibt es nicht mehr.");

  try {
    await prisma.note.delete({ where: { id } });
  } catch (err) {
    console.error("[meine-bibel] Notiz konnte nicht gelöscht werden:", err);
    return failure(GENERIC_ERROR);
  }

  revalidateReader();
  revalidateMeineBibel();
  const target = redirectTarget(next);
  if (target) redirect(target);
  return success("Notiz gelöscht.");
}

// ---------------------------------------------------------------------------
// Bookmarks
// ---------------------------------------------------------------------------

/** Adds or removes the bookmark on a verse. Returns `data.bookmarked` with the new state. */
export async function toggleBookmark(verseKey: string, label?: string): Promise<ActionState> {
  const user = await actionUser();
  if (!user) return failure(LOGIN_REQUIRED);

  const parsed = bookmarkSchema.safeParse({ verseKey, label: label ?? "" });
  if (!parsed.success) return failure(CHECK_INPUT, { errors: fieldErrors(parsed.error) });
  const key = { userId_verseKey: { userId: user.id, verseKey: parsed.data.verseKey } };

  let bookmarked: boolean;
  try {
    const existing = await prisma.bookmark.findUnique({ where: key, select: { verseKey: true } });
    if (existing) {
      await prisma.bookmark.delete({ where: key });
      bookmarked = false;
    } else {
      try {
        await prisma.bookmark.create({ data: { userId: user.id, verseKey: parsed.data.verseKey, label: parsed.data.label ?? null } });
      } catch (err) {
        if ((err as { code?: string })?.code !== "P2002") throw err;
      }
      bookmarked = true;
    }
  } catch (err) {
    console.error("[meine-bibel] Lesezeichen konnte nicht gespeichert werden:", err);
    return failure(GENERIC_ERROR);
  }

  revalidateReader();
  revalidateMeineBibel();
  return success(undefined, { data: { bookmarked } });
}

/** Removes a bookmark (no-op when it does not exist). Bound with `.bind(null, verseKey)`. */
export async function removeBookmark(verseKey: string): Promise<ActionState> {
  const user = await actionUser();
  if (!user) return failure(LOGIN_REQUIRED);

  const parsed = bookmarkSchema.safeParse({ verseKey, label: "" });
  if (!parsed.success) return failure(CHECK_INPUT);

  try {
    await prisma.bookmark.deleteMany({ where: { userId: user.id, verseKey: parsed.data.verseKey } });
  } catch (err) {
    console.error("[meine-bibel] Lesezeichen konnte nicht entfernt werden:", err);
    return failure(GENERIC_ERROR);
  }

  revalidateReader();
  revalidateMeineBibel();
  return success("Lesezeichen entfernt.");
}

// ---------------------------------------------------------------------------
// Reading log
// ---------------------------------------------------------------------------

/**
 * Records that the user read a chapter. Idempotent per chapter and (UTC) day,
 * so the reader can call it freely. Returns `data.logged` (false = already today).
 */
export async function logChapterRead(book: number, chapter: number, translation: string): Promise<ActionState> {
  const user = await actionUser();
  if (!user) return failure(LOGIN_REQUIRED);

  const parsed = chapterReadSchema.safeParse({ book, chapter, translation });
  if (!parsed.success) return failure(CHECK_INPUT, { errors: fieldErrors(parsed.error) });
  const t = await resolveTranslationId(parsed.data.translation);
  const dayStart = new Date(`${todayKey()}T00:00:00.000Z`);

  let logged = false;
  try {
    const existing = await prisma.readingLog.findFirst({
      where: { userId: user.id, book: parsed.data.book, chapter: parsed.data.chapter, readAt: { gte: dayStart } },
      select: { id: true },
    });
    if (!existing) {
      await prisma.readingLog.create({
        data: { userId: user.id, book: parsed.data.book, chapter: parsed.data.chapter, translation: t },
      });
      logged = true;
    }
  } catch (err) {
    console.error("[meine-bibel] Kapitel konnte nicht als gelesen gespeichert werden:", err);
    return failure(GENERIC_ERROR);
  }

  if (logged) revalidateMeineBibel();
  return success(undefined, { data: { logged } });
}

// ---------------------------------------------------------------------------
// Journal
// ---------------------------------------------------------------------------

function journalValues(formData: FormData): Record<string, string> {
  const v = stringValues(formData);
  return {
    date: v.date ?? "",
    title: v.title ?? "",
    body: v.body ?? "",
    gratitude: v.gratitude ?? "",
    prayer: v.prayer ?? "",
    verse: v.verse ?? "",
  };
}

const VERSE_HINT = "Bitte eine Bibelstelle mit Vers angeben, z. B. Psalm 23,1.";

/** Validates the journal form; the free-text `verse` becomes a verse key. */
function parseJournalForm(formData: FormData) {
  const values = journalValues(formData);
  let verseKeyValue = "";
  let verseError: string | null = null;
  if (values.verse.trim()) {
    const ref = parseReference(values.verse);
    if (!ref || !ref.verseStart) verseError = VERSE_HINT;
    else verseKeyValue = makeVerseKey(ref.book.number, ref.chapter, ref.verseStart);
  }

  const parsed = journalEntrySchema.safeParse({ ...values, verseKey: verseKeyValue });
  if (!parsed.success || verseError) {
    const errors = parsed.success ? {} : fieldErrors(parsed.error);
    if (verseError) errors.verse = [verseError];
    return { error: failure(CHECK_INPUT, { errors, values }) };
  }
  const d = parsed.data;
  return {
    values,
    data: {
      date: d.date,
      title: d.title ?? null,
      body: d.body,
      gratitude: d.gratitude ?? null,
      prayer: d.prayer ?? null,
      verseKey: d.verseKey ?? null,
    },
  };
}

export async function createJournalEntry(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await actionUser();
  if (!user) return failure(LOGIN_REQUIRED, { values: journalValues(formData) });

  const result = parseJournalForm(formData);
  if ("error" in result) return result.error;

  let id: string;
  try {
    const created = await prisma.journalEntry.create({ data: { ...result.data, userId: user.id }, select: { id: true } });
    id = created.id;
  } catch (err) {
    console.error("[tagebuch] Eintrag konnte nicht gespeichert werden:", err);
    return failure(GENERIC_ERROR, { values: result.values });
  }

  revalidateTagebuch();
  redirect(`/tagebuch/${id}`);
}

/** Bound with `.bind(null, id)`. */
export async function updateJournalEntry(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await actionUser();
  if (!user) return failure(LOGIN_REQUIRED, { values: journalValues(formData) });

  const existing = await prisma.journalEntry.findFirst({ where: { id, userId: user.id }, select: { id: true } });
  if (!existing) return failure("Diesen Eintrag gibt es nicht mehr.");

  const result = parseJournalForm(formData);
  if ("error" in result) return result.error;

  try {
    await prisma.journalEntry.update({ where: { id }, data: result.data });
  } catch (err) {
    console.error("[tagebuch] Eintrag konnte nicht aktualisiert werden:", err);
    return failure(GENERIC_ERROR, { values: result.values });
  }

  revalidateTagebuch();
  redirect(`/tagebuch/${id}`);
}

/** Bound with `.bind(null, id)`. Deletes permanently (private data, no soft delete needed). */
export async function deleteJournalEntry(id: string): Promise<ActionState> {
  const user = await actionUser();
  if (!user) return failure(LOGIN_REQUIRED);

  const existing = await prisma.journalEntry.findFirst({ where: { id, userId: user.id }, select: { id: true } });
  if (!existing) return failure("Diesen Eintrag gibt es nicht mehr.");

  try {
    await prisma.journalEntry.delete({ where: { id } });
  } catch (err) {
    console.error("[tagebuch] Eintrag konnte nicht gelöscht werden:", err);
    return failure(GENERIC_ERROR);
  }

  revalidateTagebuch();
  redirect("/tagebuch");
}

// ---------------------------------------------------------------------------
// Memory verses
// ---------------------------------------------------------------------------

const ALREADY_LEARNING = "Diesen Vers lernst du schon.";

async function addMemoryVerseFor(user: CurrentUser, reference: string, translation: string): Promise<ActionState> {
  const values = { reference, translation };
  const parsed = memoryVerseAddSchema.safeParse(values);
  if (!parsed.success) return failure(CHECK_INPUT, { errors: fieldErrors(parsed.error), values });

  const ref = parsed.data.reference;
  const book = getBookByNumber(ref.book);
  if (!book) return failure(CHECK_INPUT, { errors: { reference: ["Dieses Buch kennen wir nicht."] }, values });

  const t = await resolveTranslationId(parsed.data.translation);
  const info = await getTranslation(t);
  const verses = await getVerses(t, ref.book, ref.chapter, ref.verseStart, ref.verseEnd ?? ref.verseStart);
  if (verses.length === 0 || !info) {
    return failure(CHECK_INPUT, { errors: { reference: ["Diese Stelle gibt es in dieser Übersetzung nicht."] }, values });
  }

  const key = makeVerseKey(ref.book, ref.chapter, ref.verseStart);
  const verseEnd = verses.length > 1 ? verses[verses.length - 1].verse : null;
  const text = verses.map((v) => v.text.trim()).join(" ");
  const formatted = formatReference(
    { book, chapter: ref.chapter, verseStart: ref.verseStart, verseEnd: verseEnd ?? undefined },
    localeFor(info.language),
  );

  let id: string;
  try {
    const existing = await prisma.memoryVerse.findUnique({
      where: { userId_verseKey_translation: { userId: user.id, verseKey: key, translation: t } },
      select: { id: true },
    });
    if (existing) return failure(ALREADY_LEARNING, { errors: { reference: [ALREADY_LEARNING] }, values });

    const created = await prisma.memoryVerse.create({
      data: { userId: user.id, verseKey: key, verseEnd, translation: t, text, reference: formatted },
      select: { id: true },
    });
    id = created.id;
  } catch (err) {
    if ((err as { code?: string })?.code === "P2002") return failure(ALREADY_LEARNING, { errors: { reference: [ALREADY_LEARNING] }, values });
    console.error("[merken] Vers konnte nicht gespeichert werden:", err);
    return failure(GENERIC_ERROR, { values });
  }

  revalidateMerken();
  revalidateReader();
  return success(`${formatted} ist jetzt in deiner Lernliste.`, { data: { id, reference: formatted } });
}

/**
 * Adds a verse (or a range within one chapter) to the learning list, with a
 * snapshot of the text in the given translation. Called from the reader.
 */
export async function addMemoryVerse(reference: string, translation: string): Promise<ActionState> {
  const user = await actionUser();
  if (!user) return failure(LOGIN_REQUIRED);
  return addMemoryVerseFor(user, reference, translation);
}

/** Form variant for `useActionState` (fields `reference`, `translation`). */
export async function addMemoryVerseForm(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const reference = str(formData, "reference");
  const translation = str(formData, "translation");
  const user = await actionUser();
  if (!user) return failure(LOGIN_REQUIRED, { values: { reference, translation } });
  return addMemoryVerseFor(user, reference, translation);
}

/** Bound with `.bind(null, id)`. */
export async function removeMemoryVerse(id: string): Promise<ActionState> {
  const user = await actionUser();
  if (!user) return failure(LOGIN_REQUIRED);

  const existing = await prisma.memoryVerse.findFirst({ where: { id, userId: user.id }, select: { id: true } });
  if (!existing) return failure("Diesen Vers gibt es in deiner Liste nicht mehr.");

  try {
    await prisma.memoryVerse.delete({ where: { id } });
  } catch (err) {
    console.error("[merken] Vers konnte nicht entfernt werden:", err);
    return failure(GENERIC_ERROR);
  }

  revalidateMerken();
  revalidateReader();
  return success("Aus der Lernliste entfernt.");
}

/**
 * Records a practice result and moves the verse between the Leitner boxes.
 * Returns `data.box` and `data.nextReviewAt` (ISO string).
 */
export async function reviewMemoryVerse(id: string, result: ReviewResult): Promise<ActionState> {
  const user = await actionUser();
  if (!user) return failure(LOGIN_REQUIRED);

  const parsed = memoryReviewSchema.safeParse({ id, result });
  if (!parsed.success) return failure(CHECK_INPUT, { errors: fieldErrors(parsed.error) });

  const verse = await prisma.memoryVerse.findFirst({ where: { id: parsed.data.id, userId: user.id }, select: { box: true } });
  if (!verse) return failure("Diesen Vers gibt es in deiner Liste nicht mehr.");

  const now = new Date();
  const state = nextState(verse.box, parsed.data.result, now);
  try {
    await prisma.memoryVerse.update({
      where: { id: parsed.data.id },
      data: {
        box: state.box,
        nextReviewAt: state.nextReviewAt,
        lastReviewedAt: now,
        reviewCount: { increment: 1 },
        correctCount: { increment: parsed.data.result === "known" ? 1 : 0 },
      },
    });
  } catch (err) {
    console.error("[merken] Übung konnte nicht gespeichert werden:", err);
    return failure(GENERIC_ERROR);
  }

  revalidateMerken();
  return success(undefined, { data: { box: state.box, nextReviewAt: state.nextReviewAt.toISOString() } });
}
