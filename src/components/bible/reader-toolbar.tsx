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
  const cls = buttonClasses("ghost", "sm", "size-10 shrink-0 px-0");
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
    <div className="border-border/80 bg-background sticky top-16 z-30 border-b">
      <div className="mx-auto flex max-w-6xl items-center gap-x-3 gap-y-2 px-2 py-2 sm:px-6 md:flex-wrap">
        <nav aria-label="Kapitelnavigation" className="flex min-w-0 flex-1 items-center gap-1 md:flex-none">
          <NavLink target={prev} direction="prev" />
          <SelectField
            id={`${id}-book`}
            label="Buch"
            hideLabel
            value={bookSlug}
            onChange={(e) => router.push(buildReaderUrl(e.target.value, 1, { t, p }))}
            className="min-w-0 flex-1 md:w-44 md:flex-none"
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
            className="w-[4.5rem] shrink-0"
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

        <div className="flex shrink-0 items-center gap-2 md:ml-auto">
          <TranslationSelect
            id={`${id}-t`}
            label="Übersetzung"
            hideLabel
            translations={translations}
            value={t}
            param="t"
            pathname={pathname}
            query={query}
            className="hidden w-40 md:block"
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
            className="hidden w-40 md:block"
          />
          {/* Phones: translations live in the "Aa" menu to keep the toolbar to one row. */}
          <ReaderSettingsMenu>
            <div className="space-y-3 md:hidden">
              <TranslationSelect
                id={`${id}-tm`}
                label="Übersetzung"
                translations={translations}
                value={t}
                param="t"
                pathname={pathname}
                query={query}
              />
              <TranslationSelect
                id={`${id}-pm`}
                label="Parallel lesen"
                translations={translations}
                value={p}
                param="p"
                pathname={pathname}
                query={query}
                noneLabel="Keine"
                exclude={t}
              />
            </div>
          </ReaderSettingsMenu>
        </div>
      </div>
    </div>
  );
}
