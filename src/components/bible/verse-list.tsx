"use client";

import { Fragment, useEffect, useOptimistic, useState, useTransition, type ReactNode } from "react";
import { Bookmark, NotebookPen } from "lucide-react";
import { verseKey } from "@/lib/bible/reference";
import {
  buildCopyText,
  buildReaderUrl,
  formatRangeReference,
  formatSelectionReference,
  localeFor,
  readerSettingsStyle,
  selectionRange,
  verseParam,
  type VerseRange,
} from "@/lib/bible/ui";
import {
  addMemoryVerse,
  highlightClass,
  setHighlight,
  toggleBookmark,
  type HighlightColor,
} from "@/lib/study/reader-api";
import { cn } from "@/lib/utils";
import { CrossReferencesPanel } from "./cross-references-panel";
import { NotesPanel, type NoteDraft, type ReaderNote } from "./notes-panel";
import { SendVersePanel } from "./send-verse-panel";
import { useReaderSettings } from "./reader-settings";
import { VerseActionBar, type ActionFeedback } from "./verse-action-bar";

export type { ReaderNote } from "./notes-panel";

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

/** The signed-in user's decorations for this chapter (serialisable). */
export interface ReaderStudy {
  signedIn: boolean;
  /** /anmelden?next=<reader url> */
  loginUrl: string;
  highlights: Record<number, HighlightColor>;
  bookmarks: number[];
  notes: ReaderNote[];
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
  study?: ReaderStudy;
  /** extra buttons for the floating action bar */
  extraActions?: ReactNode;
  className?: string;
}

const GUEST_STUDY: ReaderStudy = { signedIn: false, loginUrl: "/anmelden", highlights: {}, bookmarks: [], notes: [] };

type Panel = "none" | "crossrefs" | "notes" | "send";

async function writeClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * The chapter text. Verses are <span id="v16"> elements; clicking toggles a
 * selection that opens a floating action bar (copy, share, cross references,
 * highlights, notes, bookmarks, memory verses).
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
  study = GUEST_STUDY,
  extraActions,
  className,
}: VerseListProps) {
  const settings = useReaderSettings();
  const [selected, setSelected] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<ActionFeedback | null>(null);
  const [panel, setPanel] = useState<Panel>("none");
  const [noteDraft, setNoteDraft] = useState<NoteDraft | null>(null);
  const [notesFocus, setNotesFocus] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

  const [highlights, applyHighlight] = useOptimistic(
    study.highlights,
    (state: Record<number, HighlightColor>, patch: { verses: number[]; color: HighlightColor | null }) => {
      const next: Record<number, HighlightColor> = { ...state };
      for (const v of patch.verses) {
        if (patch.color) next[v] = patch.color;
        else delete next[v];
      }
      return next;
    },
  );
  const [bookmarks, toggleOptimisticBookmark] = useOptimistic(study.bookmarks, (state: number[], verse: number) =>
    state.includes(verse) ? state.filter((v) => v !== verse) : [...state, verse],
  );

  const locale = localeFor(translation.language);
  const sep = locale === "de" ? "," : ":";
  const isParallel = Boolean(parallel);
  const layout = isParallel ? "lines" : settings.layout;
  const highlightStart = highlight?.start ?? null;
  const chapterLabel = `${bookName} ${chapter}`;

  const notesByVerse = new Map<number, ReaderNote[]>();
  for (const note of study.notes) {
    const list = notesByVerse.get(note.verse);
    if (list) list.push(note);
    else notesByVerse.set(note.verse, [note]);
  }

  useEffect(() => {
    if (highlightStart === null) return;
    document.getElementById(`v${highlightStart}`)?.scrollIntoView({ block: "center" });
  }, [highlightStart, bookSlug, chapter]);

  useEffect(() => {
    if (!feedback) return;
    const id = setTimeout(() => setFeedback(null), 3000);
    return () => clearTimeout(id);
  }, [feedback]);

  function toggle(n: number) {
    setSelected((prev) => (prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n].sort((a, b) => a - b)));
  }

  function clearSelection() {
    setSelected([]);
    if (panel === "crossrefs" || noteDraft) closePanel();
  }

  function closePanel() {
    setPanel("none");
    setNoteDraft(null);
    setNotesFocus(null);
  }

  function openNotes(verse: number | null) {
    setNoteDraft(null);
    setNotesFocus(verse);
    setPanel("notes");
  }

  const selectionRef = formatSelectionReference(bookName, chapter, selected, locale);
  const firstVerse = selected[0] ?? null;
  const keyOf = (verse: number) => verseKey(bookNumber, chapter, verse);

  async function copySelection() {
    const picked = verses.filter((v) => selected.includes(v.verse)).map((v) => ({ verse: v.verse, text: v.text }));
    const ok = await writeClipboard(buildCopyText(picked, selectionRef, translation.shortName));
    setFeedback({ text: ok ? "Kopiert" : "Kopieren nicht möglich", tone: ok ? "ok" : "error" });
  }

  async function copyLink() {
    const path = buildReaderUrl(bookSlug, chapter, { t: translation.id, p: parallel?.id, v: verseParam(selected) });
    const ok = await writeClipboard(`${window.location.origin}${path}`);
    setFeedback({ text: ok ? "Link kopiert" : "Kopieren nicht möglich", tone: ok ? "ok" : "error" });
  }

  function failed(message: string | undefined) {
    setFeedback({ text: message ?? "Das hat leider nicht geklappt.", tone: "error" });
  }

  function doHighlight(color: HighlightColor | null) {
    const picked = [...selected];
    if (picked.length === 0) return;
    startTransition(async () => {
      applyHighlight({ verses: picked, color });
      const result = await setHighlight(picked.map(keyOf), color, translation.id);
      if (!result.ok) failed(result.message);
      else setFeedback({ text: color ? "Markiert" : "Markierung entfernt", tone: "ok" });
    });
  }

  function doBookmark() {
    if (firstVerse === null) return;
    const verse = firstVerse;
    startTransition(async () => {
      toggleOptimisticBookmark(verse);
      const result = await toggleBookmark(keyOf(verse));
      if (!result.ok) failed(result.message);
      else setFeedback({ text: result.data?.bookmarked ? "Lesezeichen gesetzt" : "Lesezeichen entfernt", tone: "ok" });
    });
  }

  function doMemorize() {
    const range = selectionRange(selected);
    if (!range) return;
    const reference = formatRangeReference(bookName, chapter, range, locale);
    startTransition(async () => {
      const result = await addMemoryVerse(reference, translation.id);
      setFeedback({
        text: result.message ?? (result.ok ? "Zur Lernliste hinzugefügt" : "Das hat leider nicht geklappt."),
        tone: result.ok ? "ok" : "error",
      });
    });
  }

  function openNoteForm() {
    const range = selectionRange(selected);
    if (!range) return;
    setNotesFocus(null);
    setNoteDraft({
      verseKey: keyOf(range.start),
      reference: formatRangeReference(bookName, chapter, range, locale),
      verseEnd: range.end > range.start ? range.end : null,
    });
    setPanel("notes");
  }

  function verseClasses(n: number) {
    const color = highlights[n];
    const isHighlighted = highlight ? n >= highlight.start && n <= highlight.end : false;
    const isSelected = selected.includes(n);
    return cn(
      "-mx-1 cursor-pointer scroll-mt-32 rounded-md box-decoration-clone px-1 py-0.5 transition-colors",
      color ? highlightClass(color) : isHighlighted || isSelected ? "bg-highlight-yellow" : "hover:bg-surface-muted",
      isSelected && "ring-2 ring-primary/60 ring-inset",
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

  /** Bookmark marker and note indicator after a verse (outside the clickable span). */
  function markers(n: number) {
    const hasBookmark = bookmarks.includes(n);
    const notes = notesByVerse.get(n);
    if (!hasBookmark && !notes) return null;
    return (
      <span className="ml-1 inline-flex items-center gap-0.5 align-middle">
        {hasBookmark ? (
          <Bookmark className="text-accent size-3.5 fill-current" role="img" aria-label={`Lesezeichen an Vers ${n}`} />
        ) : null}
        {notes ? (
          <button
            type="button"
            onClick={() => openNotes(n)}
            aria-label={`${notes.length === 1 ? "1 Notiz" : `${notes.length} Notizen`} zu Vers ${n} anzeigen`}
            className="text-primary hover:bg-primary-soft inline-flex size-6 items-center justify-center rounded-full"
          >
            <NotebookPen className="size-3.5" aria-hidden="true" />
          </button>
        ) : null}
      </span>
    );
  }

  function verseNode(n: number, text: ReactNode, opts: { id: string; lang?: string; withMarkers: boolean }) {
    return (
      <>
        <span id={opts.id} lang={opts.lang} className={verseClasses(n)} {...verseProps(n)}>
          <sup className="verse-number">{n}</sup>
          {text}
        </span>
        {opts.withMarkers ? markers(n) : null}
      </>
    );
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
                <span className="block py-0.5">
                  {verseNode(v.verse, v.text, { id: `v${v.verse}`, withMarkers: true })}
                </span>
                <span className="border-border mb-4 block border-l-2 py-0.5 pl-3 md:mb-0 md:border-0 md:pl-0">
                  {verseNode(v.verse, v.parallelText ?? <span className="text-muted-foreground italic">–</span>, {
                    id: `p${v.verse}`,
                    lang: parallel.language,
                    withMarkers: false,
                  })}
                </span>
              </Fragment>
            ))}
          </div>
        ) : layout === "flow" ? (
          <p lang={translation.language}>
            {verses.map((v) => (
              <Fragment key={v.verse}>{verseNode(v.verse, v.text, { id: `v${v.verse}`, withMarkers: true })} </Fragment>
            ))}
          </p>
        ) : (
          <div className="space-y-1" lang={translation.language}>
            {verses.map((v) => (
              <span key={v.verse} className="block py-0.5">
                {verseNode(v.verse, v.text, { id: `v${v.verse}`, withMarkers: true })}
              </span>
            ))}
          </div>
        )}
      </div>

      {selected.length > 0 ? (
        <>
          <div className="h-24" aria-hidden="true" />
          <VerseActionBar
            reference={selectionRef}
            feedback={feedback}
            onCopy={copySelection}
            onCopyLink={copyLink}
            onCrossRefs={() => setPanel("crossrefs")}
            onClear={clearSelection}
            study={{
              signedIn: study.signedIn,
              loginUrl: study.loginUrl,
              bookmarked: firstVerse !== null && bookmarks.includes(firstVerse),
              pending,
              onHighlight: doHighlight,
              onNote: openNoteForm,
              onBookmark: doBookmark,
              onMemorize: doMemorize,
              onSend: () => setPanel("send"),
            }}
            extraActions={extraActions}
          />
        </>
      ) : null}

      <CrossReferencesPanel
        open={panel === "crossrefs" && selected.length > 0}
        onClose={closePanel}
        book={bookNumber}
        chapter={chapter}
        verses={selected}
        t={translation.id}
        chapterLabel={chapterLabel}
        locale={locale}
      />
      {(() => {
        const range = selectionRange(selected);
        return range ? (
          <SendVersePanel
            open={panel === "send"}
            onClose={closePanel}
            reference={formatRangeReference(bookName, chapter, range, locale)}
            book={bookNumber}
            chapter={chapter}
            verseStart={range.start}
            verseEnd={range.end > range.start ? range.end : undefined}
            translation={translation.id}
          />
        ) : null;
      })()}
      <NotesPanel
        open={panel === "notes"}
        onClose={closePanel}
        notes={study.notes}
        chapterLabel={chapterLabel}
        locale={locale}
        draft={noteDraft}
        focusVerse={notesFocus}
        onSaved={() => {
          closePanel();
          setFeedback({
            text: `Notiz zu ${chapterLabel}${sep}${notesFocus ?? firstVerse ?? ""} gespeichert`,
            tone: "ok",
          });
        }}
      />
    </>
  );
}
