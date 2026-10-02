"use client";

import Link from "next/link";
import { useId } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { buildReaderUrl, type TranslationOption } from "@/lib/bible/ui";
import { cn } from "@/lib/utils";
import { ReaderSettingsMenu } from "./reader-settings";
import { ReferenceJump } from "./reference-jump";
import { SelectField } from "./select-field";
import { TranslationSelect } from "./translation-select";

export interface ChapterTarget {
  href: string;
  /** e.g. "Johannes 2" */
  label: string;
}

interface Props {
  books: { slug: string; name: string }[];
  bookSlug: string;
  chapter: number;
  chapterCount: number;
  translations: TranslationOption[];
  t: string;
  p: string | null;
  v?: string | null;
  prev: ChapterTarget | null;
  next: ChapterTarget | null;
}

function NavLink({ target, direction }: { target: ChapterTarget | null; direction: "prev" | "next" }) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  const prefix = direction === "prev" ? "Vorheriges Kapitel" : "Nächstes Kapitel";
  const cls = buttonClasses("ghost", "sm", "size-9 px-0");
  if (!target) {
    return (
      <span aria-disabled="true" className={cn(cls, "pointer-events-none opacity-40")}>
        <Icon aria-hidden="true" />
      </span>
    );
  }
  return (
    <Link
      href={target.href}
      aria-label={`${prefix}: ${target.label}`}
      title={`${prefix}: ${target.label}`}
      className={cls}
    >
      <Icon aria-hidden="true" />
    </Link>
  );
}

/** Sticky toolbar under the site header: navigation, reference jump, translations, reading settings. */
export function ReaderToolbar({ books, bookSlug, chapter, chapterCount, translations, t, p, v, prev, next }: Props) {
  const router = useRouter();
  const id = useId();
  const pathname = `/bibel/${bookSlug}/${chapter}`;
  const query = { t, p, v };

  return (
    <div className="border-border/80 bg-background/90 sticky top-14 z-30 border-b backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2 sm:px-6">
        <nav aria-label="Kapitelnavigation" className="flex items-center gap-1">
          <NavLink target={prev} direction="prev" />
          <SelectField
            id={`${id}-book`}
            label="Buch"
            hideLabel
            value={bookSlug}
            onChange={(e) => router.push(buildReaderUrl(e.target.value, 1, { t, p }))}
            className="w-36 sm:w-44"
          >
            {books.map((b) => (
              <option key={b.slug} value={b.slug}>
                {b.name}
              </option>
            ))}
          </SelectField>
          <SelectField
            id={`${id}-chapter`}
            label="Kapitel"
            hideLabel
            value={chapter}
            onChange={(e) => router.push(buildReaderUrl(bookSlug, Number(e.target.value), { t, p }))}
            className="w-20"
          >
            {Array.from({ length: chapterCount }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </SelectField>
          <NavLink target={next} direction="next" />
        </nav>

        <ReferenceJump t={t} p={p} className="hidden md:flex" />

        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
          <TranslationSelect
            id={`${id}-t`}
            label="Übersetzung"
            hideLabel
            translations={translations}
            value={t}
            param="t"
            pathname={pathname}
            query={query}
            className="w-32 sm:w-40"
          />
          <TranslationSelect
            id={`${id}-p`}
            label="Parallelübersetzung"
            hideLabel
            translations={translations}
            value={p}
            param="p"
            pathname={pathname}
            query={query}
            noneLabel="Parallel: keine"
            exclude={t}
            className="w-32 sm:w-40"
          />
          <ReaderSettingsMenu />
        </div>
      </div>
    </div>
  );
}
