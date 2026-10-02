"use client";

import { Fragment, useEffect, useState, type ReactNode } from "react";
import { BookText, Copy, Highlighter, Link2, NotebookPen, X, type LucideIcon } from "lucide-react";
import {
  buildCopyText,
  buildReaderUrl,
  formatSelectionReference,
  localeFor,
  readerSettingsStyle,
  verseParam,
  type VerseRange,
} from "@/lib/bible/ui";
import { cn } from "@/lib/utils";
import { CrossReferencesPanel } from "./cross-references-panel";
import { useReaderSettings } from "./reader-settings";

export interface ReaderVerse {
  verse: number;
  text: string;
  /** text of the same verse in the parallel translation (null = missing there) */
  parallelText?: string | null;
}

export interface ReaderTranslation {
  id: string;
  shortName: string;
  language: "de" | "en";
}

export interface VerseListProps {
  bookNumber: number;
  bookSlug: string;
  /** localized book name, e.g. "Johannes" */
  bookName: string;
  chapter: number;
  translation: ReaderTranslation;
  parallel?: ReaderTranslation | null;
  verses: ReaderVerse[];
  /** verses from ?v= to highlight and scroll to */
  highlight?: VerseRange | null;
  /** extra buttons for the floating action bar (highlights, notes, …) */
  extraActions?: ReactNode;
  className?: string;
}

async function writeClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  title,
}: {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title ? `${label} (${title})` : undefined}
      className="hover:bg-surface-muted inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition disabled:pointer-events-none disabled:opacity-50"
    >
      <Icon className="size-4" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}

/**
 * The chapter text. Verses are <span id="v16"> elements; clicking toggles a
 * selection that opens a floating action bar (copy, share, cross references).
 */
export function VerseList({
  bookNumber,
  bookSlug,
  bookName,
  chapter,
  translation,
  parallel,
  verses,
  highlight,
  extraActions,
  className,
}: VerseListProps) {
  const settings = useReaderSettings();
  const [selected, setSelected] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [crossRefsOpen, setCrossRefsOpen] = useState(false);

  const locale = localeFor(translation.language);
  const isParallel = Boolean(parallel);
  const layout = isParallel ? "lines" : settings.layout;
  const highlightStart = highlight?.start ?? null;

  useEffect(() => {
    if (highlightStart === null) return;
    document.getElementById(`v${highlightStart}`)?.scrollIntoView({ block: "center" });
  }, [highlightStart, bookSlug, chapter]);

  useEffect(() => {
    if (!feedback) return;
    const id = setTimeout(() => setFeedback(null), 2500);
    return () => clearTimeout(id);
  }, [feedback]);

  function toggle(n: number) {
    setSelected((prev) => (prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n].sort((a, b) => a - b)));
  }

  const selectionRef = formatSelectionReference(bookName, chapter, selected, locale);

  async function copySelection() {
    const picked = verses.filter((v) => selected.includes(v.verse)).map((v) => ({ verse: v.verse, text: v.text }));
    const ok = await writeClipboard(buildCopyText(picked, selectionRef, translation.shortName));
    setFeedback(ok ? "Kopiert" : "Kopieren nicht möglich");
  }

  async function copyLink() {
    const path = buildReaderUrl(bookSlug, chapter, { t: translation.id, p: parallel?.id, v: verseParam(selected) });
    const ok = await writeClipboard(`${window.location.origin}${path}`);
    setFeedback(ok ? "Link kopiert" : "Kopieren nicht möglich");
  }

  function verseClasses(n: number, extra?: string) {
    const isHighlighted = highlight ? n >= highlight.start && n <= highlight.end : false;
    const isSelected = selected.includes(n);
    return cn(
      "cursor-pointer scroll-mt-32 rounded-md transition-colors",
      layout === "lines" ? "-mx-1.5 block px-1.5 py-0.5" : "box-decoration-clone px-0.5",
      isHighlighted || isSelected ? "bg-highlight-yellow" : "hover:bg-surface-muted",
      isSelected && "ring-1 ring-accent/50 ring-inset",
      extra,
    );
  }

  function verseProps(n: number) {
    return {
      role: "button" as const,
      tabIndex: 0,
      "aria-pressed": selected.includes(n),
      onClick: () => toggle(n),
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle(n);
        }
      },
    };
  }

  const style = readerSettingsStyle(settings);

  return (
    <>
      <div
        className={cn("scripture", className)}
        style={style}
        data-font-size={settings.fontSize}
        data-font={settings.font}
        data-layout={layout}
      >
        {isParallel && parallel ? (
          <div className="grid gap-x-10 gap-y-1 md:grid-cols-2" lang={translation.language}>
            <p
              className="text-muted-foreground hidden text-xs font-semibold tracking-wide uppercase md:block"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {translation.shortName}
            </p>
            <p
              className="text-muted-foreground hidden text-xs font-semibold tracking-wide uppercase md:block"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {parallel.shortName}
            </p>
            {verses.map((v) => (
              <Fragment key={v.verse}>
                <span id={`v${v.verse}`} className={verseClasses(v.verse)} {...verseProps(v.verse)}>
                  <sup className="verse-number">{v.verse}</sup>
                  {v.text}
                </span>
                <span
                  id={`p${v.verse}`}
                  lang={parallel.language}
                  className={verseClasses(v.verse, "border-border mb-4 border-l-2 pl-3 md:mb-0 md:border-0 md:pl-1.5")}
                  {...verseProps(v.verse)}
                >
                  <sup className="verse-number">{v.verse}</sup>
                  {v.parallelText ?? <span className="text-muted-foreground italic">–</span>}
                </span>
              </Fragment>
            ))}
          </div>
        ) : layout === "flow" ? (
          <p lang={translation.language}>
            {verses.map((v) => (
              <Fragment key={v.verse}>
                <span id={`v${v.verse}`} className={verseClasses(v.verse)} {...verseProps(v.verse)}>
                  <sup className="verse-number">{v.verse}</sup>
                  {v.text}
                </span>{" "}
              </Fragment>
            ))}
          </p>
        ) : (
          <div className="space-y-1" lang={translation.language}>
            {verses.map((v) => (
              <span key={v.verse} id={`v${v.verse}`} className={verseClasses(v.verse)} {...verseProps(v.verse)}>
                <sup className="verse-number">{v.verse}</sup>
                {v.text}
              </span>
            ))}
          </div>
        )}
      </div>

      {selected.length > 0 ? (
        <>
          <div className="h-24" aria-hidden="true" />
          <div
            role="region"
            aria-label="Aktionen für die ausgewählten Verse"
            className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
          >
            <div className="border-border bg-surface shadow-soft mx-auto flex max-w-3xl flex-wrap items-center gap-1 rounded-2xl border p-2">
              <p className="flex items-baseline gap-2 px-2 text-sm">
                <span className="font-semibold">{selectionRef}</span>
                <span aria-live="polite" className="text-success text-xs">
                  {feedback}
                </span>
              </p>
              <div className="ml-auto flex flex-wrap items-center gap-0.5">
                <ActionButton icon={Copy} label="Kopieren" onClick={copySelection} />
                <ActionButton icon={Link2} label="Link teilen" onClick={copyLink} />
                <ActionButton icon={BookText} label="Querverweise" onClick={() => setCrossRefsOpen(true)} />
                <ActionButton icon={Highlighter} label="Markieren" disabled title="Bald verfügbar" />
                <ActionButton icon={NotebookPen} label="Notiz" disabled title="Bald verfügbar" />
                {extraActions}
                <button
                  type="button"
                  onClick={() => setSelected([])}
                  aria-label="Auswahl aufheben"
                  className="hover:bg-surface-muted inline-flex size-9 items-center justify-center rounded-full"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
          <CrossReferencesPanel
            open={crossRefsOpen}
            onClose={() => setCrossRefsOpen(false)}
            book={bookNumber}
            chapter={chapter}
            verses={selected}
            t={translation.id}
            chapterLabel={`${bookName} ${chapter}`}
            locale={locale}
          />
        </>
      ) : null}
    </>
  );
}
