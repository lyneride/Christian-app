/**
 * Pure helpers for verse memorisation (Leitner boxes) and practice masking.
 * No I/O, no "server-only": usable from client components and unit tests.
 */
import type { ReviewResult } from "@/lib/validation/study";

export const MIN_BOX = 1;
export const MAX_BOX = 5;

/** Days until the next review after a correct answer, indexed by box - 1. */
export const BOX_INTERVALS_DAYS: readonly number[] = [1, 3, 7, 14, 30];

export type Box = 1 | 2 | 3 | 4 | 5;

export interface LeitnerState {
  box: Box;
  nextReviewAt: Date;
}

export function clampBox(box: number): Box {
  if (!Number.isFinite(box)) return MIN_BOX;
  return Math.min(MAX_BOX, Math.max(MIN_BOX, Math.round(box))) as Box;
}

/** Start of the UTC day `days` days after `now`, so a verse is due from the morning on. */
function utcDayStartAfter(now: Date, days: number): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + days));
}

/**
 * Known → one box up (capped at 5) and a longer pause; not known → back to
 * box 1 and due again tomorrow. Never punishing, just a shorter interval.
 */
export function nextState(box: number, result: ReviewResult, now: Date = new Date()): LeitnerState {
  if (result === "known") {
    const next = clampBox(clampBox(box) + 1);
    return { box: next, nextReviewAt: utcDayStartAfter(now, BOX_INTERVALS_DAYS[next - 1]) };
  }
  return { box: MIN_BOX, nextReviewAt: utcDayStartAfter(now, BOX_INTERVALS_DAYS[0]) };
}

export function isDue(verse: { nextReviewAt: Date }, now: Date = new Date()): boolean {
  return verse.nextReviewAt.getTime() <= now.getTime();
}

export function dueCount(verses: readonly { nextReviewAt: Date }[], now: Date = new Date()): number {
  return verses.filter((v) => isDue(v, now)).length;
}

/** "Stufe 3" */
export function boxLabel(box: number): string {
  return `Stufe ${clampBox(box)}`;
}

/** Short German description of when a verse is due next, relative to `now` (UTC days). */
export function nextReviewLabel(nextReviewAt: Date, now: Date = new Date()): string {
  const day = (d: Date) => Math.floor(d.getTime() / 86_400_000);
  const diff = day(nextReviewAt) - day(now);
  if (diff <= 0) return "heute dran";
  if (diff === 1) return "morgen";
  return `in ${diff} Tagen`;
}

// ---------------------------------------------------------------------------
// Practice: masking and comparison
// ---------------------------------------------------------------------------

/**
 * 0 = full text, 1 = first letter of every word, 2 = every second word hidden,
 * 3 = everything hidden except punctuation. Practice starts at 3 and reveals downwards.
 */
export type MaskLevel = 0 | 1 | 2 | 3;

export const MASK_LEVEL_LABELS: Record<MaskLevel, string> = {
  3: "Verdeckt",
  2: "Jedes zweite Wort",
  1: "Anfangsbuchstaben",
  0: "Ganzer Vers",
};

const WORD_CHAR = /[\p{L}\p{N}]/u;
const MASK_CHAR = "_";

function maskWord(word: string, keepFirst: boolean): string {
  let out = "";
  let first = true;
  for (const ch of word) {
    if (WORD_CHAR.test(ch)) {
      out += first && keepFirst ? ch : MASK_CHAR;
      first = false;
    } else {
      out += ch;
    }
  }
  return out;
}

export function maskVerse(text: string, level: MaskLevel): string {
  if (level <= 0) return text;
  let index = 0;
  return text
    .split(/(\s+)/)
    .map((token) => {
      if (token === "" || /^\s+$/.test(token)) return token;
      const i = index++;
      switch (level) {
        case 1:
          return maskWord(token, true);
        case 2:
          return i % 2 === 1 ? maskWord(token, false) : token;
        default:
          return maskWord(token, false);
      }
    })
    .join("");
}

/** Lower-cased words without punctuation; umlauts folded the German way (ä→ae, ß→ss). */
export function normalizeWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function wordDistance(a: readonly string[], b: readonly string[]): number {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
    }
    prev = cur;
  }
  return prev[b.length];
}

/** Word-level similarity 0..1 (1 = identical apart from case and punctuation). */
export function compareTyped(expected: string, typed: string): number {
  const a = normalizeWords(expected);
  const b = normalizeWords(typed);
  if (a.length === 0 && b.length === 0) return 1;
  if (a.length === 0 || b.length === 0) return 0;
  const distance = wordDistance(a, b);
  return Math.max(0, Math.min(1, 1 - distance / Math.max(a.length, b.length)));
}

/** Warm feedback for a similarity score. */
export function similarityFeedback(score: number): string {
  if (score >= 0.97) return "Wort für Wort richtig.";
  if (score >= 0.85) return "Fast perfekt – nur Kleinigkeiten weichen ab.";
  if (score >= 0.6) return "Schon ziemlich nah dran.";
  if (score >= 0.3) return "Ein Teil sitzt schon. Schau dir den Vers noch einmal an.";
  return "Noch nicht – kein Problem, lies ihn in Ruhe noch einmal.";
}

/** "3 Verse geübt" / "1 Vers geübt" */
export function practicedLabel(count: number): string {
  return count === 1 ? "1 Vers geübt" : `${count} Verse geübt`;
}
