"use client";

import Link from "next/link";
import {
  Bookmark,
  BookmarkCheck,
  BookText,
  Brain,
  Copy,
  Eraser,
  Link2,
  LogIn,
  NotebookPen,
  Send,
  SlidersHorizontal,
  X,
  type LucideIcon,
} from "lucide-react";
import { MARKER_BG, markerStyle, type HighlightColor, type Marker } from "@/lib/study/reader-api";
import { cn } from "@/lib/utils";

export interface ActionFeedback {
  text: string;
  tone: "ok" | "error";
}

export interface StudyActionHandlers {
  signedIn: boolean;
  /** /anmelden?next=… – guests are sent here instead of running an action */
  loginUrl: string;
  /** whether the first selected verse currently has a bookmark */
  bookmarked: boolean;
  /** whether anything in the selection is highlighted (shows „Entfernen“) */
  canErase: boolean;
  /** the user's marker colours, in order */
  markers: readonly Marker[];
  pending: boolean;
  onHighlight: (color: HighlightColor | null) => void;
  onNote: () => void;
  onBookmark: () => void;
  onMemorize: () => void;
  /** send the selection to a friend or into a chat */
  onSend: () => void;
}

interface Props {
  /** "verses": whole verses tapped; "text": words selected by long-press and drag */
  mode: "verses" | "text";
  reference: string;
  onCopy: () => void;
  onCopyLink: () => void;
  onCrossRefs: () => void;
  onClear: () => void;
  study: StudyActionHandlers;
}

const chipClass =
  "inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full border-2 border-border bg-surface px-4 font-display text-sm font-extrabold transition active:scale-95 hover:bg-surface-muted disabled:pointer-events-none disabled:opacity-50";

const tileClass =
  "flex w-[4.75rem] shrink-0 flex-col items-center gap-1 rounded-2xl pt-0.5 pb-1 transition active:scale-95 disabled:opacity-50";
const tileLabel = "text-muted-foreground line-clamp-2 w-full text-center text-[11px] leading-tight font-bold tracking-tight break-words hyphens-auto";

function Chip({ icon: Icon, label, onClick, href, disabled }: { icon: LucideIcon; label: string; onClick?: () => void; href?: string; disabled?: boolean }) {
  if (href) {
    return (
      <Link href={href} className={chipClass}>
        <Icon className="size-4" aria-hidden="true" />
        {label}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={chipClass}>
      <Icon className="size-4" aria-hidden="true" />
      {label}
    </button>
  );
}

/**
 * Bottom sheet while verses (tap) or words (long-press and drag) are selected:
 * colours first – the most common action is one tap – then the other actions
 * in one swipeable row. On phones it replaces the bottom bar (see globals.css).
 */
export function VerseActionBar({ mode, reference, onCopy, onCopyLink, onCrossRefs, onClear, study }: Props) {
  const guestHref = study.signedIn ? undefined : study.loginUrl;

  return (
    <div
      data-verse-actions
      role="region"
      aria-label={mode === "text" ? "Aktionen für den ausgewählten Text" : "Aktionen für die ausgewählten Verse"}
      className="fixed inset-x-0 bottom-0 z-40 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      <div className="border-border bg-surface shadow-pop mx-auto max-w-3xl space-y-3 rounded-3xl border p-3">
        <div className="flex items-center gap-2 pl-1">
          <p className="min-w-0 flex-1">
            <span className="font-display block truncate font-extrabold">{reference}</span>
            {mode === "text" ? <span className="text-muted-foreground block text-xs">Ausgewählter Text</span> : null}
          </p>
          <button
            type="button"
            onClick={onClear}
            aria-label="Auswahl aufheben"
            className="hover:bg-surface-muted bg-surface-muted inline-flex size-11 shrink-0 items-center justify-center rounded-full"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        {study.signedIn ? (
          <div role="group" aria-label="Markieren in Farbe" className="scroll-fade-x scrollbar-none -mx-3 flex gap-0.5 overflow-x-auto overscroll-x-contain px-2">
            {study.canErase ? (
              <button
                type="button"
                disabled={study.pending}
                onClick={() => study.onHighlight(null)}
                className={tileClass}
              >
                <span className="bg-surface-muted inline-flex size-11 items-center justify-center rounded-full">
                  <Eraser className="size-5" aria-hidden="true" />
                </span>
                <span className={tileLabel}>Entfernen</span>
              </button>
            ) : null}
            {study.markers.map((m) => (
              <button
                key={m.key}
                type="button"
                aria-label={m.name ? `Markieren: ${m.name} (${m.colorName})` : `${m.colorName} markieren`}
                disabled={study.pending}
                onClick={() => study.onHighlight(m.key)}
                className={tileClass}
              >
                <span aria-hidden="true" className={cn("border-foreground/15 size-11 rounded-full border-2", MARKER_BG)} style={markerStyle(m)} />
                <span aria-hidden="true" lang="de" className={tileLabel}>
                  {m.label}
                </span>
              </button>
            ))}
            <Link href="/einstellungen/markierungen" className={tileClass}>
              <span className="border-border inline-flex size-11 items-center justify-center rounded-full border-2 border-dashed">
                <SlidersHorizontal className="size-5" aria-hidden="true" />
              </span>
              <span className={tileLabel}>Farben anpassen</span>
            </Link>
          </div>
        ) : (
          <Link
            href={study.loginUrl}
            className="bg-primary-soft text-primary flex h-11 items-center justify-center gap-2 rounded-full text-sm font-extrabold"
          >
            <LogIn className="size-4" aria-hidden="true" />
            Zum Markieren anmelden
          </Link>
        )}

        <div className="scrollbar-none -mx-3 flex gap-2 overflow-x-auto px-3">
          <Chip icon={Copy} label="Kopieren" onClick={onCopy} />
          <Chip icon={NotebookPen} label="Notiz" href={guestHref} onClick={study.onNote} />
          {mode === "verses" ? (
            <>
              <Chip icon={Send} label="Senden" href={guestHref} onClick={study.onSend} disabled={study.pending} />
              <Chip icon={Brain} label="Merken" href={guestHref} onClick={study.onMemorize} disabled={study.pending} />
              <Chip
                icon={study.bookmarked ? BookmarkCheck : Bookmark}
                label={study.bookmarked ? "Lesezeichen weg" : "Lesezeichen"}
                href={guestHref}
                onClick={study.onBookmark}
                disabled={study.pending}
              />
              <Chip icon={BookText} label="Querverweise" onClick={onCrossRefs} />
              <Chip icon={Link2} label="Link" onClick={onCopyLink} />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** Short confirmation („Markiert“) above the bottom bar after an action. */
export function ReaderToast({ feedback }: { feedback: ActionFeedback | null }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(96px+env(safe-area-inset-bottom))] z-40 flex justify-center px-4 md:bottom-8"
    >
      {feedback ? (
        <span
          className={cn(
            "rounded-full px-4 py-2 text-sm font-extrabold shadow-pop",
            feedback.tone === "error" ? "bg-danger text-white" : "bg-foreground text-background",
          )}
        >
          {feedback.text}
        </span>
      ) : null}
    </div>
  );
}
