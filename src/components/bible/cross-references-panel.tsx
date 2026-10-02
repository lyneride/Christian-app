"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Locale } from "@/lib/bible/reference";
import { cn } from "@/lib/utils";
import { SidePanel } from "./side-panel";

export interface CrossRefItem {
  reference: string;
  path: string;
  text: string;
  votes: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  /** canonical book number 1–66 */
  book: number;
  chapter: number;
  /** selected verses (sorted); the panel shows one at a time */
  verses: number[];
  /** translation id for the quoted text */
  t: string;
  /** human readable reference for the heading, e.g. "Johannes 3" */
  chapterLabel: string;
  locale: Locale;
}

interface Loaded {
  key: string;
  refs: CrossRefItem[] | null;
  error: string | null;
}

/** Side panel listing the cross references of one verse (fetched from /api/bibel/querverweise). */
export function CrossReferencesPanel({ open, onClose, book, chapter, verses, t, chapterLabel, locale }: Props) {
  const [picked, setPicked] = useState<number | null>(null);
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  const verse = picked !== null && verses.includes(picked) ? picked : (verses[0] ?? null);
  const key = verse === null ? null : `${book}:${chapter}:${verse}:${t}`;
  const current = loaded && loaded.key === key ? loaded : null;
  const loading = open && key !== null && current === null;

  useEffect(() => {
    if (!open || key === null || verse === null) return;
    const controller = new AbortController();
    const params = new URLSearchParams({ book: String(book), chapter: String(chapter), verse: String(verse), t });
    fetch(`/api/bibel/querverweise?${params}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { refs: CrossRefItem[] };
        setLoaded({ key, refs: data.refs, error: null });
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setLoaded({ key, refs: null, error: "Querverweise konnten nicht geladen werden." });
      });
    return () => controller.abort();
  }, [open, key, verse, book, chapter, t]);

  const sep = locale === "de" ? "," : ":";

  return (
    <SidePanel
      open={open}
      onClose={onClose}
      title="Querverweise"
      subtitle={`zu ${chapterLabel}${verse !== null ? `${sep}${verse}` : ""}`}
      closeLabel="Querverweise schließen"
      busy={loading}
      toolbar={
        verses.length > 1 ? (
          <div
            role="group"
            aria-label="Vers wählen"
            className="border-border flex flex-wrap gap-1.5 border-b px-5 py-3"
          >
            {verses.map((n) => (
              <button
                key={n}
                type="button"
                aria-pressed={n === verse}
                onClick={() => setPicked(n)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs font-medium transition",
                  n === verse ? "border-primary bg-primary-soft text-primary" : "border-border hover:bg-surface-muted",
                )}
              >
                Vers {n}
              </button>
            ))}
          </div>
        ) : null
      }
      footer="Querverweise: OpenBible.info (CC-BY 4.0)"
    >
      {loading ? (
        <ul className="space-y-4" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <li key={i} className="space-y-2">
              <div className="bg-surface-muted h-4 w-32 animate-pulse rounded" />
              <div className="bg-surface-muted h-3 w-full animate-pulse rounded" />
              <div className="bg-surface-muted h-3 w-5/6 animate-pulse rounded" />
            </li>
          ))}
        </ul>
      ) : current?.error ? (
        <p className="text-danger text-sm">{current.error}</p>
      ) : current?.refs && current.refs.length === 0 ? (
        <p className="text-muted-foreground text-sm">Zu diesem Vers sind keine Querverweise hinterlegt.</p>
      ) : (
        <ol className="space-y-4">
          {current?.refs?.map((ref) => (
            <li key={ref.path}>
              <Link
                href={ref.path}
                onClick={onClose}
                className="group hover:bg-surface-muted -mx-2 block rounded-lg px-2 py-1.5"
              >
                <span className="text-primary text-sm font-semibold group-hover:underline">{ref.reference}</span>
                <span
                  className="scripture text-foreground/90 mt-0.5 line-clamp-3 block text-[0.95rem] leading-relaxed"
                  lang={locale}
                >
                  {ref.text}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </SidePanel>
  );
}
