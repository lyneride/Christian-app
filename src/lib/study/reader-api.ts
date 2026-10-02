/**
 * Client-safe surface for the Bible reader (src/components/bible). Import the
 * actions from here in client components; the types are plain data.
 *
 *   setHighlight(verseKeys: string[], color: HighlightColor | null, translation?: string) → ActionState
 *     null removes the highlight; data: { count, color }
 *   toggleBookmark(verseKey: string, label?: string) → ActionState (data: { bookmarked })
 *   addNote(prevState, formData) → ActionState (data: { id })
 *     form fields: verseKey (hidden), verseEnd?, title?, body, visibility ("PRIVATE" | "MEMBERS")
 *   logChapterRead(book: number, chapter: number, translation: string) → ActionState (data: { logged })
 *     idempotent per chapter and day
 *   addMemoryVerse(reference: string, translation: string) → ActionState (data: { id, reference })
 *
 * The chapter page (server) gets the current user's decorations with
 * `getChapterAnnotations(userId, book, chapter)` from "@/lib/study/queries".
 * Note that `bookmarks` is a Set; spread it (`[...bookmarks]`) before passing
 * it to a client component.
 */
export { addMemoryVerse, addNote, logChapterRead, setHighlight, toggleBookmark } from "./actions";
export type { ChapterAnnotations, ChapterNote } from "./types";
export { EMPTY_ANNOTATIONS } from "./types";
export type { HighlightColor, NoteVisibility } from "@/lib/validation/study";
export { HIGHLIGHT_COLORS, HIGHLIGHT_COLOR_LIST, highlightClass } from "@/components/study/highlight-colors";
