/**
 * Client-safe types shared between the study queries, the pages and the
 * Bible reader integration. No imports with side effects.
 */
import type { HighlightColor, NoteVisibility } from "@/lib/validation/study";

export interface ChapterNote {
  id: string;
  verseKey: string;
  /** start verse (parsed from verseKey) */
  verse: number;
  verseEnd: number | null;
  title: string | null;
  body: string;
  visibility: NoteVisibility;
  updatedAt: Date;
}

/** Everything the reader needs to decorate one chapter for the signed-in user. */
export interface ChapterAnnotations {
  /** verse number → highlight colour */
  highlights: Record<number, HighlightColor>;
  /** notes sorted by start verse */
  notes: ChapterNote[];
  /** verse numbers with a bookmark */
  bookmarks: Set<number>;
}

export const EMPTY_ANNOTATIONS: ChapterAnnotations = { highlights: {}, notes: [], bookmarks: new Set() };
