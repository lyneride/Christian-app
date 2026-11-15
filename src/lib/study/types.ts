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

/** Marked words inside one verse: character range [start, end) in the text of `translation`. */
export interface HighlightRange {
  start: number;
  end: number;
  translation: string;
}

/** Everything the reader needs to decorate one chapter for the signed-in user. */
export interface ChapterAnnotations {
  /** verse number → highlight colour */
  highlights: Record<number, HighlightColor>;
  /** verse number → marked words (only for highlights of single words; see `HighlightRange`) */
  highlightRanges: Record<number, HighlightRange>;
  /** notes sorted by start verse */
  notes: ChapterNote[];
  /** verse numbers with a bookmark */
  bookmarks: Set<number>;
}

export const EMPTY_ANNOTATIONS: ChapterAnnotations = { highlights: {}, highlightRanges: {}, notes: [], bookmarks: new Set() };
