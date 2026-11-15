"use client";

import { Fragment, useCallback, useEffect, useOptimistic, useRef, useState, useTransition, type ReactNode } from "react";
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
  MARKER_BG,
  markerStyle,
  resolveMarker,
  setHighlight,
  setTextHighlight,
  toggleBookmark,
  type HighlightColor,
  type Marker,
} from "@/lib/study/reader-api";
import { DEFAULT_PALETTE } from "@/lib/study/markers";
import { coversWholeVerse, mergeRanges, snapToWords, splitByRange, type WordRange } from "@/lib/study/ranges";
import { cn } from "@/lib/utils";
import { CrossReferencesPanel } from "./cross-references-panel";
import { NotesPanel, type NoteDraft, type ReaderNote } from "./notes-panel";
import { SendVersePanel } from "./send-verse-panel";
import { useReaderSettings } from "./reader-settings";
import { ReaderToast, VerseActionBar, type ActionFeedback } from "./verse-action-bar";

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
  /** marked words per verse (already filtered to the shown translation) */
  highlightRanges?: Record<number, WordRange>;
  bookmarks: number[];
  notes: ReaderNote[];
  /** the user's marker colours (default palette for guests) */
  markers?: Marker[];
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
  className?: string;
}

const GUEST_STUDY: ReaderStudy = { signedIn: false, loginUrl: "/anmelden", highlights: {}, highlightRanges: {}, bookmarks: [], notes: [] };
const NO_RANGES: Record<number, WordRange> = {};

/** Words selected by long-press and drag: per verse a range (null = whole verse). */
interface TextSelection {
  parts: { verse: number; range: WordRange | null }[];
  text: string;
}

type HighlightState = { colors: Record<number, HighlightColor>; ranges: Record<number, WordRange> };
type HighlightPatch =
  | { kind: "verses"; verses: number[]; color: HighlightColor | null }
  | { kind: "text"; parts: TextSelection["parts"]; color: HighlightColor };

function applyPatch(state: HighlightState, patch: HighlightPatch): HighlightState {
  const colors = { ...state.colors };
  const ranges = { ...state.ranges };
  if (patch.kind === "verses") {
    for (const v of patch.verses) {
      delete ranges[v];
      if (patch.color) colors[v] = patch.color;
      else delete colors[v];
    }
  } else {
    for (const { verse, range } of patch.parts) {
      const existing = colors[verse] ? (ranges[verse] ?? null) : undefined;
      const merged = mergeRanges(existing, range);
      colors[verse] = patch.color;
      if (merged) ranges[verse] = merged;
      else delete ranges[verse];
    }
  }
  return { colors, ranges };
}

/** Character offset of a DOM boundary point inside `el` (counting only its text). */
function offsetIn(el: Element, node: Node, offset: number): number {
  const r = document.createRange();
  r.selectNodeContents(el);
  r.setEnd(node, offset);
  return r.toString().length;
}

/** Maps the browser's text selection to verse ranges (main translation column only). */
function readSelection(root: HTMLElement, range: Range): TextSelection["parts"] {
  const parts: TextSelection["parts"] = [];
  for (const el of Array.from(root.querySelectorAll<HTMLElement>("[data-vt]"))) {
    if (!range.intersectsNode(el)) continue;
    const text = el.textContent ?? "";
    const startInside = el.contains(range.startContainer);
    const endInside = el.contains(range.endContainer);
    // A range that merely touches the verse (ends right before it, starts right after it) does not count.
    if (!endInside && el.compareDocumentPosition(range.endContainer) & Node.DOCUMENT_POSITION_PRECEDING) continue;
    if (!startInside && el.compareDocumentPosition(range.startContainer) & Node.DOCUMENT_POSITION_FOLLOWING) continue;
    const start = startInside ? offsetIn(el, range.startContainer, range.startOffset) : 0;
    const end = endInside ? offsetIn(el, range.endContainer, range.endOffset) : text.length;
    const snapped = snapToWords(text, start, end);
    if (!snapped) continue;
    parts.push({ verse: Number(el.dataset.vt), range: coversWholeVerse(text, snapped) ? null : snapped });
  }
  return parts;
}

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
  className,
}: VerseListProps) {
  const settings = useReaderSettings();
  const [selected, setSelected] = useState<number[]>([]);
  const [textSel, setTextSel] = useState<TextSelection | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  /** time of the last text selection – a tap that only dismisses it must not select a verse */
  const lastTextSelAt = useRef(0);
  const [feedback, setFeedback] = useState<ActionFeedback | null>(null);
  const [panel, setPanel] = useState<Panel>("none");
  const [noteDraft, setNoteDraft] = useState<NoteDraft | null>(null);
  const [notesFocus, setNotesFocus] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

  const [highlightState, applyHighlight] = useOptimistic<HighlightState, HighlightPatch>(
    { colors: study.highlights, ranges: study.highlightRanges ?? NO_RANGES },
    applyPatch,
  );
  const highlights = highlightState.colors;
  const ranges = highlightState.ranges;
  const palette = study.markers?.length ? study.markers : DEFAULT_PALETTE;
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

  // Long-press and drag: follow the browser's text selection inside the chapter.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const update = () => {
      const sel = window.getSelection();
      const root = rootRef.current;
      if (!sel || sel.isCollapsed || sel.rangeCount === 0 || !root) {
        setTextSel((cur) => {
          if (cur) lastTextSelAt.current = Date.now();
          return null;
        });
        return;
      }
      const range = sel.getRangeAt(0);
      if (!root.contains(range.commonAncestorContainer)) {
        setTextSel(null);
        return;
      }
      const parts = readSelection(root, range);
      lastTextSelAt.current = Date.now();
      setTextSel(parts.length ? { parts, text: sel.toString().trim() } : null);
    };
    const onChange = () => {
      clearTimeout(timer);
      timer = setTimeout(update, 120);
    };
    document.addEventListener("selectionchange", onChange);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("selectionchange", onChange);
    };
  }, []);

  const clearTextSelection = useCallback(() => {
    window.getSelection()?.removeAllRanges();
    lastTextSelAt.current = Date.now();
    setTextSel(null);
  }, []);

  function toggle(n: number) {
    // The tap that ends (or dismisses) a text selection is not a verse tap.
    if (Date.now() - lastTextSelAt.current < 450) return;
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed) return;
    setSelected((prev) => (prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n].sort((a, b) => a - b)));
  }

  function clearSelection() {
    setSelected([]);
    if (panel === "crossrefs" || noteDraft) closePanel();
  }

  /** After an action the selection is done: the marked verses stay coloured but are no longer selected. */
  function finishSelection() {
    setSelected([]);
    clearTextSelection();
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

  const textVerses = textSel ? textSel.parts.map((p) => p.verse) : [];
  const activeVerses = textSel ? textVerses : selected;
  const selectionRef = formatSelectionReference(bookName, chapter, activeVerses, locale);
  const firstVerse = activeVerses[0] ?? null;
  const keyOf = (verse: number) => verseKey(bookNumber, chapter, verse);

  async function copySelection() {
    const ok = textSel
      ? await writeClipboard(`„${textSel.text}“ (${selectionRef}, ${translation.shortName})`)
      : await writeClipboard(
          buildCopyText(
            verses.filter((v) => selected.includes(v.verse)).map((v) => ({ verse: v.verse, text: v.text })),
            selectionRef,
            translation.shortName,
          ),
        );
    setFeedback({ text: ok ? "Kopiert" : "Kopieren nicht möglich", tone: ok ? "ok" : "error" });
    if (ok) finishSelection();
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
    if (textSel && color) {
      const parts = textSel.parts;
      finishSelection();
      startTransition(async () => {
        applyHighlight({ kind: "text", parts, color });
        const result = await setTextHighlight(
          parts.map((p) => ({ verseKey: keyOf(p.verse), start: p.range?.start ?? null, end: p.range?.end ?? null })),
          color,
          translation.id,
        );
        if (!result.ok) failed(result.message);
        else setFeedback({ text: "Markiert", tone: "ok" });
      });
      return;
    }
    const picked = [...activeVerses];
    if (picked.length === 0) return;
    finishSelection();
    startTransition(async () => {
      applyHighlight({ kind: "verses", verses: picked, color });
      const result = await setHighlight(picked.map(keyOf), color, translation.id);
      if (!result.ok) failed(result.message);
      else setFeedback({ text: color ? "Markiert" : "Markierung entfernt", tone: "ok" });
    });
  }

  function doBookmark() {
    if (firstVerse === null) return;
    const verse = firstVerse;
    finishSelection();
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
    finishSelection();
    startTransition(async () => {
      const result = await addMemoryVerse(reference, translation.id);
      setFeedback({
        text: result.message ?? (result.ok ? "Zur Lernliste hinzugefügt" : "Das hat leider nicht geklappt."),
        tone: result.ok ? "ok" : "error",
      });
    });
  }

  function openNoteForm() {
    const range = selectionRange(activeVerses);
    if (!range) return;
    clearTextSelection();
    setNotesFocus(null);
    setNoteDraft({
      verseKey: keyOf(range.start),
      reference: formatRangeReference(bookName, chapter, range, locale),
      verseEnd: range.end > range.start ? range.end : null,
    });
    setPanel("notes");
  }

  /** Background colour variables of a highlighted verse (see MARKER_BG). */
  function verseStyle(n: number, main: boolean) {
    const color = highlights[n];
    if (!color || (main && ranges[n])) return undefined;
    return markerStyle(resolveMarker(palette, color));
  }

  function verseClasses(n: number, main: boolean) {
    const color = highlights[n];
    const partial = main && color && ranges[n];
    const isLinked = highlight ? n >= highlight.start && n <= highlight.end : false;
    const isSelected = selected.includes(n);
    return cn(
      "-mx-1 cursor-pointer scroll-mt-40 rounded-md box-decoration-clone px-1 py-0.5 transition-colors [touch-action:manipulation]",
      color && !partial ? MARKER_BG : isLinked ? "bg-area-bibel-soft" : "md:hover:bg-surface-muted",
      // Selected = underlined in the brand colour, clearly different from a coloured highlight.
      isSelected && "decoration-primary underline decoration-2 underline-offset-[5px] ring-primary/50 ring-2 ring-inset",
    );
  }

  /** Verse text, with marked words wrapped when only part of the verse is highlighted. */
  function verseText(n: number, text: string): ReactNode {
    const color = highlights[n];
    const range = color ? ranges[n] : undefined;
    if (!range) return text;
    const [before, marked, after] = splitByRange(text, range);
    return (
      <>
        {before}
        <mark className={cn("rounded-sm box-decoration-clone px-0.5 text-inherit", MARKER_BG)} style={markerStyle(resolveMarker(palette, color))}>
          {marked}
        </mark>
        {after}
      </>
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

  function verseNode(n: number, text: ReactNode, opts: { id: string; lang?: string; withMarkers: boolean; main: boolean }) {
    return (
      <>
        <span id={opts.id} lang={opts.lang} className={verseClasses(n, opts.main)} style={verseStyle(n, opts.main)} {...verseProps(n)}>
          <sup className="verse-number">{n}</sup>
          {opts.main && typeof text === "string" ? <span data-vt={n}>{verseText(n, text)}</span> : text}
        </span>
        {opts.withMarkers ? markers(n) : null}
      </>
    );
  }

  const style = readerSettingsStyle(settings);

  return (
    <>
      <div
        ref={rootRef}
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
                  {verseNode(v.verse, v.text, { id: `v${v.verse}`, withMarkers: true, main: true })}
                </span>
                <span className="border-border mb-4 block border-l-2 py-0.5 pl-3 md:mb-0 md:border-0 md:pl-0">
                  {verseNode(v.verse, v.parallelText ?? <span className="text-muted-foreground italic">–</span>, {
                    id: `p${v.verse}`,
                    lang: parallel.language,
                    withMarkers: false,
                    main: false,
                  })}
                </span>
              </Fragment>
            ))}
          </div>
        ) : layout === "flow" ? (
          <p lang={translation.language}>
            {verses.map((v) => (
              <Fragment key={v.verse}>{verseNode(v.verse, v.text, { id: `v${v.verse}`, withMarkers: true, main: true })} </Fragment>
            ))}
          </p>
        ) : (
          <div className="space-y-1" lang={translation.language}>
            {verses.map((v) => (
              <span key={v.verse} className="block py-0.5">
                {verseNode(v.verse, v.text, { id: `v${v.verse}`, withMarkers: true, main: true })}
              </span>
            ))}
          </div>
        )}
      </div>

      {selected.length > 0 || textSel ? (
        <>
          <div className="h-48" aria-hidden="true" />
          <VerseActionBar
            mode={textSel ? "text" : "verses"}
            reference={selectionRef}
            onCopy={copySelection}
            onCopyLink={copyLink}
            onCrossRefs={() => setPanel("crossrefs")}
            onClear={() => {
              clearTextSelection();
              clearSelection();
            }}
            study={{
              signedIn: study.signedIn,
              loginUrl: study.loginUrl,
              bookmarked: firstVerse !== null && bookmarks.includes(firstVerse),
              canErase: activeVerses.some((v) => highlights[v]),
              markers: palette,
              pending,
              onHighlight: doHighlight,
              onNote: openNoteForm,
              onBookmark: doBookmark,
              onMemorize: doMemorize,
              onSend: () => setPanel("send"),
            }}
          />
        </>
      ) : (
        <ReaderToast feedback={feedback} />
      )}

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
            onClose={() => {
              closePanel();
              setSelected([]);
            }}
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
          setSelected([]);
          setFeedback({
            text: `Notiz zu ${chapterLabel}${sep}${notesFocus ?? firstVerse ?? ""} gespeichert`,
            tone: "ok",
          });
        }}
      />
    </>
  );
}
