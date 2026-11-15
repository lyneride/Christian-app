/**
 * Word-level highlights ("marked words"): pure helpers shared by the reader
 * (client) and the server action. A range is [start, end) in the plain verse
 * text of one translation; `null` means the whole verse.
 */

export interface WordRange {
  start: number;
  end: number;
}

const WORD_CHAR = /[\p{L}\p{N}'’-]/u;

/**
 * Widens a raw selection to whole words and trims surrounding spaces and
 * punctuation-only edges. Returns null when nothing word-like is selected.
 */
export function snapToWords(text: string, start: number, end: number): WordRange | null {
  let s = Math.max(0, Math.min(start, text.length));
  let e = Math.max(s, Math.min(end, text.length));
  // grow to word boundaries
  while (s > 0 && WORD_CHAR.test(text[s - 1]) && WORD_CHAR.test(text[s] ?? " ")) s--;
  while (e < text.length && e > 0 && WORD_CHAR.test(text[e - 1]) && WORD_CHAR.test(text[e])) e++;
  // trim spaces at the edges
  while (s < e && /\s/.test(text[s])) s++;
  while (e > s && /\s/.test(text[e - 1])) e--;
  if (e <= s) return null;
  if (!WORD_CHAR.test(text.slice(s, e))) return null;
  return { start: s, end: e };
}

/** True when the range covers every word of the verse (then the whole verse is marked). */
export function coversWholeVerse(text: string, range: WordRange): boolean {
  const before = text.slice(0, range.start);
  const after = text.slice(range.end);
  return !WORD_CHAR.test(before) && !WORD_CHAR.test(after);
}

/**
 * Combines an existing highlight with a new one on the same verse. `undefined`
 * = no highlight yet; `null` = whole verse. Two word ranges become one range
 * from the earliest start to the latest end (one marked passage per verse).
 */
export function mergeRanges(existing: WordRange | null | undefined, next: WordRange | null): WordRange | null {
  if (existing === undefined) return next;
  if (existing === null || next === null) return null;
  return { start: Math.min(existing.start, next.start), end: Math.max(existing.end, next.end) };
}

/** Splits verse text into [before, marked, after] for rendering (clamped to the text). */
export function splitByRange(text: string, range: WordRange): [string, string, string] {
  const s = Math.max(0, Math.min(range.start, text.length));
  const e = Math.max(s, Math.min(range.end, text.length));
  return [text.slice(0, s), text.slice(s, e), text.slice(e)];
}
