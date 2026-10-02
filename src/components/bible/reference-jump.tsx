"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { buttonClasses } from "@/components/ui/button";
import { parseReference } from "@/lib/bible/reference";
import { buildReaderUrl } from "@/lib/bible/ui";
import { cn } from "@/lib/utils";

interface Props {
  t?: string | null;
  p?: string | null;
  className?: string;
}

/** Free-text reference input ("Joh 3,16", "Psalm 23", "John 3:16-18") that jumps to the reader. */
export function ReferenceJump({ t, p, className }: Props) {
  const router = useRouter();
  const id = useId();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const raw = String(new FormData(form).get("ref") ?? "").trim();
    if (!raw) return;
    const ref = parseReference(raw);
    if (!ref) {
      setError("Nicht erkannt – versuch es z. B. mit „Joh 3,16“ oder „Psalm 23“.");
      return;
    }
    // Versification differs slightly per translation, so allow one chapter of tolerance.
    if (ref.chapter > ref.book.chapters + 1) {
      setError(`${ref.book.name.de} hat nur ${ref.book.chapters} Kapitel.`);
      return;
    }
    setError(null);
    const v = ref.verseStart ? (ref.verseEnd ? `${ref.verseStart}-${ref.verseEnd}` : String(ref.verseStart)) : null;
    form.reset();
    router.push(buildReaderUrl(ref.book, ref.chapter, { t, p, v }));
  }

  return (
    <form onSubmit={onSubmit} className={cn("relative flex items-center gap-1", className)}>
      <label htmlFor={id} className="sr-only">
        Bibelstelle eingeben
      </label>
      <Input
        id={id}
        name="ref"
        placeholder="z. B. Joh 3,16"
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        enterKeyHint="go"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={() => {
          if (error) setError(null);
        }}
        className="h-9 w-36 py-1 text-sm sm:w-44"
      />
      <button type="submit" aria-label="Bibelstelle öffnen" className={buttonClasses("secondary", "sm", "size-9 px-0")}>
        <ArrowRight aria-hidden="true" />
      </button>
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="border-border bg-surface text-danger shadow-soft absolute top-full left-0 z-20 mt-1 max-w-xs rounded-lg border px-2.5 py-1.5 text-xs"
        >
          {error}
        </p>
      ) : null}
    </form>
  );
}
