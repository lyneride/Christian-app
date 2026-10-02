"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { Locale } from "@/lib/bible/reference";
import { cn } from "@/lib/utils";

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

/** Side panel (bottom sheet on mobile) listing cross references of one verse. */
export function CrossReferencesPanel({ open, onClose, book, chapter, verses, t, chapterLabel, locale }: Props) {
  const [picked, setPicked] = useState<number | null>(null);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

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

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const sep = locale === "de" ? "," : ":";

  return (
    <>
      <div className="bg-foreground/20 fixed inset-0 z-40" aria-hidden="true" onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="querverweise-titel"
        className={cn(
          "border-border bg-surface shadow-soft fixed z-50 flex flex-col",
          "inset-x-0 bottom-0 max-h-[80vh] rounded-t-2xl border-t",
          "md:inset-y-0 md:right-0 md:left-auto md:max-h-none md:w-[26rem] md:rounded-none md:border-t-0 md:border-l",
        )}
      >
        <header className="border-border flex items-start justify-between gap-3 border-b px-5 py-4">
          <div>
            <h2 id="querverweise-titel" className="text-base font-semibold">
              Querverweise
            </h2>
            <p className="text-muted-foreground text-sm">
              zu {chapterLabel}
              {verse !== null ? `${sep}${verse}` : ""}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Querverweise schließen"
            className="hover:bg-surface-muted inline-flex size-9 shrink-0 items-center justify-center rounded-full"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        {verses.length > 1 ? (
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
        ) : null}

        <div className="flex-1 overflow-y-auto px-5 py-4" aria-live="polite" aria-busy={loading}>
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
        </div>
        <p className="border-border text-muted-foreground border-t px-5 py-2.5 text-xs">
          Querverweise: OpenBible.info (CC-BY 4.0)
        </p>
      </aside>
    </>
  );
}
