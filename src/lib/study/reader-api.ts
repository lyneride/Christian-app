/**
 * Client-safe surface for the Bible reader (src/components/bible). Import the
 * actions from here in client components; the types are plain data.
 *
 *   setHighlight(verseKeys: string[], color: HighlightColor | null, translation?: string) → ActionState
 *     color = key of one of the user's marker colours (see ./markers.ts)
 *     null removes the highlight; data: { count, color }
 *   setTextHighlight(parts: { verseKey, start, end }[], color, translation?) → ActionState
 *     marks selected words (character ranges per verse, null = whole verse)
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
export { addMemoryVerse, addNote, logChapterRead, setHighlight, setTextHighlight, toggleBookmark } from "./actions";
export type { ChapterAnnotations, ChapterNote } from "./types";
export { EMPTY_ANNOTATIONS } from "./types";
export type { HighlightColor, NoteVisibility } from "@/lib/validation/study";
export { MARKER_BG, markerStyle, resolveMarker, type Marker } from "./markers";
