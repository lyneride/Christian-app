"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ArrowRight, BookOpenCheck } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { logChapterRead } from "@/lib/study/reader-api";

interface Props {
  /** canonical book number */
  book: number;
  chapter: number;
  translation: string;
  /** already logged today (server) */
  readToday: boolean;
}

/** "Kapitel gelesen" toggle at the end of a chapter (signed-in users only). */
export function ChapterReadButton({ book, chapter, translation, readToday }: Props) {
  const [logged, setLogged] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const isRead = readToday || logged;

  function onClick() {
    if (isRead) return;
    setLogged(true);
    setError(null);
    startTransition(async () => {
      const result = await logChapterRead(book, chapter, translation);
      if (!result.ok) {
        setLogged(false);
        setError(result.message ?? "Das hat leider nicht geklappt.");
      }
    });
  }

  return (
    <div className="rounded-card border-border bg-surface mt-10 flex flex-wrap items-center justify-between gap-4 border px-5 py-4">
      <div>
        <p className="text-sm font-medium">Kapitel zu Ende gelesen?</p>
        <p className="text-muted-foreground text-xs">Erscheint in deiner Übersicht unter „Meine Bibel“.</p>
        {error ? (
          <p role="alert" className="text-danger mt-1 text-xs font-medium">
            {error}
          </p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onClick}
          aria-pressed={isRead}
          disabled={pending}
          className={buttonClasses(isRead ? "secondary" : "primary", "md")}
        >
          {isRead ? (
            "Heute gelesen ✓"
          ) : (
            <>
              <BookOpenCheck aria-hidden="true" />
              Kapitel gelesen
            </>
          )}
        </button>
        <Link href="/meine-bibel" className={buttonClasses("link", "md")}>
          Zu meiner Bibel
          <ArrowRight aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
