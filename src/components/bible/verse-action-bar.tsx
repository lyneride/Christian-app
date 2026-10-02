"use client";

import Link from "next/link";
import { useId, useState, type ReactNode } from "react";
import {
  Bookmark,
  BookmarkCheck,
  BookText,
  Brain,
  Copy,
  Eraser,
  Highlighter,
  Link2,
  NotebookPen,
  X,
  type LucideIcon,
} from "lucide-react";
import { HIGHLIGHT_COLOR_LIST, type HighlightColor } from "@/lib/study/reader-api";
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
  pending: boolean;
  onHighlight: (color: HighlightColor | null) => void;
  onNote: () => void;
  onBookmark: () => void;
  onMemorize: () => void;
}

interface Props {
  reference: string;
  feedback: ActionFeedback | null;
  onCopy: () => void;
  onCopyLink: () => void;
  onCrossRefs: () => void;
  onClear: () => void;
  study: StudyActionHandlers;
  extraActions?: ReactNode;
}

const actionClass =
  "inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition hover:bg-surface-muted disabled:pointer-events-none disabled:opacity-50 aria-pressed:bg-surface-muted";

function ActionButton({
  icon: Icon,
  label,
  onClick,
  href,
  disabled,
  pressed,
  controls,
}: {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  /** renders a link instead of a button (guests) */
  href?: string;
  disabled?: boolean;
  pressed?: boolean;
  controls?: string;
}) {
  if (href) {
    return (
      <Link href={href} className={actionClass}>
        <Icon className="size-4" aria-hidden="true" />
        <span>{label}</span>
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={pressed}
      aria-expanded={controls ? pressed : undefined}
      aria-controls={controls}
      className={actionClass}
    >
      <Icon className="size-4" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}

/** Floating bar at the bottom while verses are selected. */
export function VerseActionBar({ reference, feedback, onCopy, onCopyLink, onCrossRefs, onClear, study, extraActions }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerId = useId();
  const guestHref = study.signedIn ? undefined : study.loginUrl;

  return (
    <div
      role="region"
      aria-label="Aktionen für die ausgewählten Verse"
      className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-surface p-2 shadow-soft">
        <div className="flex flex-wrap items-center gap-1">
          <p className="flex flex-wrap items-baseline gap-x-2 px-2 text-sm">
            <span className="font-semibold">{reference}</span>
            <span role="status" aria-live="polite" className={cn("text-xs", feedback?.tone === "error" ? "text-danger" : "text-success")}>
              {feedback?.text}
            </span>
          </p>
          <div className="ml-auto flex flex-wrap items-center gap-0.5">
            <ActionButton icon={Copy} label="Kopieren" onClick={onCopy} />
            <ActionButton icon={Link2} label="Link teilen" onClick={onCopyLink} />
            <ActionButton icon={BookText} label="Querverweise" onClick={onCrossRefs} />
            <ActionButton
              icon={Highlighter}
              label="Markieren"
              href={guestHref}
              pressed={pickerOpen}
              controls={study.signedIn ? pickerId : undefined}
              onClick={() => setPickerOpen((o) => !o)}
            />
            <ActionButton icon={NotebookPen} label="Notiz" href={guestHref} onClick={study.onNote} />
            <ActionButton
              icon={study.bookmarked ? BookmarkCheck : Bookmark}
              label={study.bookmarked ? "Lesezeichen entfernen" : "Lesezeichen"}
              href={guestHref}
              onClick={study.onBookmark}
              disabled={study.pending}
            />
            <ActionButton icon={Brain} label="Merken" href={guestHref} onClick={study.onMemorize} disabled={study.pending} />
            {extraActions}
            <button
              type="button"
              onClick={onClear}
              aria-label="Auswahl aufheben"
              className="inline-flex size-9 items-center justify-center rounded-full hover:bg-surface-muted"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {pickerOpen && study.signedIn ? (
          <div
            id={pickerId}
            role="group"
            aria-label="Farbe für die Markierung"
            className="mt-1 flex flex-wrap items-center gap-2 border-t border-border px-2 pt-2"
          >
            {HIGHLIGHT_COLOR_LIST.map((c) => (
              <button
                key={c.value}
                type="button"
                aria-label={c.label}
                title={c.label}
                disabled={study.pending}
                onClick={() => {
                  study.onHighlight(c.value);
                  setPickerOpen(false);
                }}
                className={cn(
                  "size-8 rounded-full border border-foreground/15 transition hover:scale-110 disabled:opacity-50",
                  c.className,
                )}
              />
            ))}
            <button
              type="button"
              disabled={study.pending}
              onClick={() => {
                study.onHighlight(null);
                setPickerOpen(false);
              }}
              className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-sm hover:bg-surface-muted disabled:opacity-50"
            >
              <Eraser className="size-4" aria-hidden="true" />
              Entfernen
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
