import "server-only";
import { cache } from "react";
import type { Prisma } from "@/lib/db";
import { prisma } from "@/lib/db";
import { BOOKS } from "@/lib/bible/books";
import type { Page } from "@/lib/pagination";
import { isHighlightColor, type HighlightColor, type NoteVisibility } from "@/lib/validation/study";
import type { ChapterAnnotations, ChapterNote } from "./types";

export type { ChapterAnnotations, ChapterNote } from "./types";

/**
 * Read access to the personal study data. Every query is scoped to the owner
 * (userId) – nothing here is ever shown to other members.
 */

/** Total number of chapters in the Protestant canon (KJV versification). */
export const TOTAL_CHAPTERS = BOOKS.reduce((sum, b) => sum + b.chapters, 0);

function chapterPrefix(book: number, chapter: number): string {
  return `${book}:${chapter}:`;
}

function verseOf(verseKey: string): number {
  return Number(verseKey.split(":")[2]);
}

function bookOf(verseKey: string): number {
  return Number(verseKey.split(":")[0]);
}

// ---------------------------------------------------------------------------
// Reader integration
// ---------------------------------------------------------------------------

const noteSelect = {
  id: true,
  verseKey: true,
  verseEnd: true,
  title: true,
  body: true,
  visibility: true,
  updatedAt: true,
} satisfies Prisma.NoteSelect;

type NoteRow = Prisma.NoteGetPayload<{ select: typeof noteSelect }>;

function toChapterNote(row: NoteRow): ChapterNote {
  return {
    id: row.id,
    verseKey: row.verseKey,
    verse: verseOf(row.verseKey),
    verseEnd: row.verseEnd,
    title: row.title,
    body: row.body,
    visibility: (row.visibility === "MEMBERS" ? "MEMBERS" : "PRIVATE") as NoteVisibility,
    updatedAt: row.updatedAt,
  };
}

/**
 * Highlights, notes and bookmarks of one chapter for the reader. Memoised per
 * request so the page and nested components can call it freely.
 */
export const getChapterAnnotations = cache(
  async (userId: string, book: number, chapter: number): Promise<ChapterAnnotations> => {
    const prefix = chapterPrefix(book, chapter);
    const [highlights, notes, bookmarks] = await Promise.all([
      prisma.highlight.findMany({
        where: { userId, verseKey: { startsWith: prefix } },
        select: { verseKey: true, color: true },
      }),
      prisma.note.findMany({ where: { userId, verseKey: { startsWith: prefix } }, select: noteSelect }),
      prisma.bookmark.findMany({ where: { userId, verseKey: { startsWith: prefix } }, select: { verseKey: true } }),
    ]);

    const highlightMap: Record<number, HighlightColor> = {};
    for (const h of highlights) highlightMap[verseOf(h.verseKey)] = isHighlightColor(h.color) ? h.color : "yellow";

    return {
      highlights: highlightMap,
      notes: notes
        .map(toChapterNote)
        .sort((a, b) => a.verse - b.verse || a.updatedAt.getTime() - b.updatedAt.getTime()),
      bookmarks: new Set(bookmarks.map((b) => verseOf(b.verseKey))),
    };
  },
);

// ---------------------------------------------------------------------------
// Highlights
// ---------------------------------------------------------------------------

export interface HighlightItem {
  id: string;
  verseKey: string;
  color: HighlightColor;
  translation: string;
  createdAt: Date;
}

export interface ListHighlightsArgs {
  /** canonical book number */
  book?: number;
  color?: HighlightColor;
  page: Page;
}

export async function listHighlights(
  userId: string,
  { book, color, page }: ListHighlightsArgs,
): Promise<{ items: HighlightItem[]; total: number }> {
  const where: Prisma.HighlightWhereInput = {
    userId,
    ...(book ? { verseKey: { startsWith: `${book}:` } } : {}),
    ...(color ? { color } : {}),
  };
  const [rows, total] = await Promise.all([
    prisma.highlight.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: page.skip,
      take: page.take,
      select: { id: true, verseKey: true, color: true, translation: true, createdAt: true },
    }),
    prisma.highlight.count({ where }),
  ]);
  return {
    items: rows.map((r) => ({ ...r, color: isHighlightColor(r.color) ? r.color : "yellow" })),
    total,
  };
}

/** Number of highlights per colour (for the filter chips). */
export async function highlightColorCounts(userId: string): Promise<Record<HighlightColor, number>> {
  const rows = await prisma.highlight.groupBy({ by: ["color"], where: { userId }, _count: { _all: true } });
  const counts: Record<HighlightColor, number> = { yellow: 0, green: 0, blue: 0, pink: 0, orange: 0 };
  for (const r of rows) if (isHighlightColor(r.color)) counts[r.color] = r._count._all;
  return counts;
}

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

export interface ListNotesArgs {
  q?: string;
  page: Page;
}

export async function listNotes(
  userId: string,
  { q, page }: ListNotesArgs,
): Promise<{ items: ChapterNote[]; total: number }> {
  const term = q?.trim();
  const where: Prisma.NoteWhereInput = {
    userId,
    ...(term ? { OR: [{ title: { contains: term } }, { body: { contains: term } }] } : {}),
  };
  const [rows, total] = await Promise.all([
    prisma.note.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: page.skip,
      take: page.take,
      select: noteSelect,
    }),
    prisma.note.count({ where }),
  ]);
  return { items: rows.map(toChapterNote), total };
}

export async function getNote(id: string, userId: string): Promise<ChapterNote | null> {
  const row = await prisma.note.findFirst({ where: { id, userId }, select: noteSelect });
  return row ? toChapterNote(row) : null;
}

// ---------------------------------------------------------------------------
// Bookmarks
// ---------------------------------------------------------------------------

export interface BookmarkItem {
  verseKey: string;
  label: string | null;
  createdAt: Date;
}

export async function listBookmarks(userId: string): Promise<BookmarkItem[]> {
  return prisma.bookmark.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { verseKey: true, label: true, createdAt: true },
  });
}

// ---------------------------------------------------------------------------
// Reading log
// ---------------------------------------------------------------------------

export interface ReadingStats {
  /** book number → distinct chapters read */
  byBook: Record<number, number>;
  /** distinct chapters read overall */
  chaptersRead: number;
  /** of TOTAL_CHAPTERS */
  totalChapters: number;
  /** distinct chapters read in the last 7 days ("Diese Woche: 5 Kapitel") */
  thisWeek: number;
  lastReadAt: Date | null;
}

export async function readingStats(userId: string, now: Date = new Date()): Promise<ReadingStats> {
  const weekAgo = new Date(now.getTime() - 7 * 86_400_000);
  const [all, recent, last] = await Promise.all([
    prisma.readingLog.findMany({
      where: { userId },
      distinct: ["book", "chapter"],
      select: { book: true, chapter: true },
    }),
    prisma.readingLog.findMany({
      where: { userId, readAt: { gte: weekAgo } },
      distinct: ["book", "chapter"],
      select: { book: true },
    }),
    prisma.readingLog.findFirst({ where: { userId }, orderBy: { readAt: "desc" }, select: { readAt: true } }),
  ]);
  const byBook: Record<number, number> = {};
  for (const row of all) byBook[row.book] = (byBook[row.book] ?? 0) + 1;
  return {
    byBook,
    chaptersRead: all.length,
    totalChapters: TOTAL_CHAPTERS,
    thisWeek: recent.length,
    lastReadAt: last?.readAt ?? null,
  };
}

// ---------------------------------------------------------------------------
// Journal
// ---------------------------------------------------------------------------

const journalSelect = {
  id: true,
  date: true,
  title: true,
  body: true,
  gratitude: true,
  prayer: true,
  verseKey: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.JournalEntrySelect;

export type JournalEntryItem = Prisma.JournalEntryGetPayload<{ select: typeof journalSelect }>;

export interface ListJournalArgs {
  page: Page;
  /** "YYYY-MM" */
  month?: string;
}

export async function listJournal(
  userId: string,
  { page, month }: ListJournalArgs,
): Promise<{ items: JournalEntryItem[]; total: number }> {
  const where: Prisma.JournalEntryWhereInput = { userId, ...(month ? { date: { startsWith: `${month}-` } } : {}) };
  const [items, total] = await Promise.all([
    prisma.journalEntry.findMany({
      where,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      skip: page.skip,
      take: page.take,
      select: journalSelect,
    }),
    prisma.journalEntry.count({ where }),
  ]);
  return { items, total };
}

/** Months with entries, newest first: [{ month: "2026-10", count: 4 }]. */
export async function listJournalMonths(userId: string): Promise<{ month: string; count: number }[]> {
  const rows = await prisma.journalEntry.findMany({ where: { userId }, select: { date: true } });
  const counts = new Map<string, number>();
  for (const r of rows) {
    const m = r.date.slice(0, 7);
    counts.set(m, (counts.get(m) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => (a.month < b.month ? 1 : a.month > b.month ? -1 : 0));
}

export async function getJournalEntry(id: string, userId: string): Promise<JournalEntryItem | null> {
  return prisma.journalEntry.findFirst({ where: { id, userId }, select: journalSelect });
}

// ---------------------------------------------------------------------------
// Memory verses
// ---------------------------------------------------------------------------

const memorySelect = {
  id: true,
  verseKey: true,
  verseEnd: true,
  translation: true,
  text: true,
  reference: true,
  box: true,
  nextReviewAt: true,
  lastReviewedAt: true,
  reviewCount: true,
  correctCount: true,
  createdAt: true,
} satisfies Prisma.MemoryVerseSelect;

export type MemoryVerseItem = Prisma.MemoryVerseGetPayload<{ select: typeof memorySelect }>;

/** All verses of the user, due ones first, then by next review date. */
export async function listMemoryVerses(userId: string): Promise<MemoryVerseItem[]> {
  return prisma.memoryVerse.findMany({
    where: { userId },
    orderBy: [{ nextReviewAt: "asc" }, { createdAt: "asc" }],
    select: memorySelect,
  });
}

export async function dueMemoryVerses(userId: string, now: Date = new Date()): Promise<MemoryVerseItem[]> {
  return prisma.memoryVerse.findMany({
    where: { userId, nextReviewAt: { lte: now } },
    orderBy: [{ box: "asc" }, { nextReviewAt: "asc" }],
    select: memorySelect,
  });
}

export async function countDueMemoryVerses(userId: string, now: Date = new Date()): Promise<number> {
  return prisma.memoryVerse.count({ where: { userId, nextReviewAt: { lte: now } } });
}

/** Grouping helper for the overview: book number → items in canonical order. */
export function groupByBook<T extends { verseKey: string }>(items: readonly T[]): { book: number; items: T[] }[] {
  const map = new Map<number, T[]>();
  for (const item of items) {
    const book = bookOf(item.verseKey);
    const list = map.get(book);
    if (list) list.push(item);
    else map.set(book, [item]);
  }
  return [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([book, list]) => ({
      book,
      items: list.sort((a, b) => {
        const [, ca, va] = a.verseKey.split(":").map(Number);
        const [, cb, vb] = b.verseKey.split(":").map(Number);
        return ca - cb || va - vb;
      }),
    }));
}
