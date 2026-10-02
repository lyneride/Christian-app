"use client";

import Link from "next/link";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import { Clock } from "lucide-react";
import { getBookBySlug } from "@/lib/bible/books";
import {
  buildReaderUrl,
  parseRecentChapters,
  pushRecentChapter,
  RECENT_CHAPTERS_KEY,
  type RecentChapter,
} from "@/lib/bible/ui";

const RECENT_EVENT = "bleibe:recent-chapters";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(RECENT_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(RECENT_EVENT, onChange);
  };
}

function getSnapshot(): string | null {
  try {
    return localStorage.getItem(RECENT_CHAPTERS_KEY);
  } catch {
    return null;
  }
}

function getServerSnapshot(): string | null {
  return null;
}

function useRecentChapters(): RecentChapter[] {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useMemo(() => parseRecentChapters(raw), [raw]);
}

/** Writes the current chapter to the recent list once on mount (no React state involved). */
export function RecordRecentChapter({ book, chapter, t }: { book: string; chapter: number; t: string }) {
  useEffect(() => {
    try {
      const list = parseRecentChapters(localStorage.getItem(RECENT_CHAPTERS_KEY));
      const next = pushRecentChapter(list, { book, chapter, t, at: Date.now() });
      localStorage.setItem(RECENT_CHAPTERS_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event(RECENT_EVENT));
    } catch {
      // storage unavailable (private mode, quota) – nothing to do
    }
  }, [book, chapter, t]);
  return null;
}

interface RecentChaptersProps {
  /** translation id → short name, for the chip label */
  translations: Record<string, string>;
  className?: string;
}

/** "Zuletzt gelesen" row. Renders nothing on the server and until the list is non-empty. */
export function RecentChapters({ translations, className }: RecentChaptersProps) {
  const recent = useRecentChapters();
  if (recent.length === 0) return null;

  return (
    <section aria-labelledby="zuletzt-gelesen" className={className}>
      <h2 id="zuletzt-gelesen" className="text-muted-foreground flex items-center gap-2 text-sm font-semibold">
        <Clock className="size-4" aria-hidden="true" />
        Zuletzt gelesen
      </h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {recent.map((entry) => {
          const book = getBookBySlug(entry.book);
          if (!book) return null;
          const short = translations[entry.t];
          return (
            <li key={`${entry.book}-${entry.chapter}`}>
              <Link
                href={buildReaderUrl(book, entry.chapter, { t: entry.t })}
                className="border-border bg-surface hover:border-primary/40 hover:bg-primary-soft/50 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition"
              >
                <span className="font-medium">
                  {book.name.de} {entry.chapter}
                </span>
                {short ? <span className="text-muted-foreground text-xs">{short}</span> : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
