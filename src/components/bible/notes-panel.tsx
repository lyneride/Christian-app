"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import type { ActionState } from "@/lib/action-state";
import type { Locale } from "@/lib/bible/reference";
import { addNote } from "@/lib/study/reader-api";
import { NoteForm } from "@/components/study/note-form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SidePanel } from "./side-panel";

export interface ReaderNote {
  id: string;
  verse: number;
  verseEnd: number | null;
  title: string | null;
  /** first ~140 characters of the body */
  excerpt: string;
}

export interface NoteDraft {
  verseKey: string;
  /** "Johannes 3,16-18" */
  reference: string;
  verseEnd?: number | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  notes: ReaderNote[];
  /** "Johannes 3" */
  chapterLabel: string;
  locale: Locale;
  /** When set, the panel starts with the form for a new note. */
  draft: NoteDraft | null;
  /** Verse whose notes are emphasised (opened from a note indicator). */
  focusVerse?: number | null;
  /** Called after a note was saved successfully. */
  onSaved: () => void;
}

/** "Notizen" drawer: the chapter's notes (links to /meine-bibel/notizen/[id]) and the form for a new one. */
export function NotesPanel({ open, onClose, notes, chapterLabel, locale, draft, focusVerse, onSaved }: Props) {
  const router = useRouter();
  const sep = locale === "de" ? "," : ":";

  async function saveNote(prev: ActionState, formData: FormData): Promise<ActionState> {
    const result = await addNote(prev, formData);
    if (result.ok) {
      router.refresh();
      onSaved();
    }
    return result;
  }

  const label = (n: ReaderNote) =>
    `${chapterLabel}${sep}${n.verse}${n.verseEnd && n.verseEnd !== n.verse ? `-${n.verseEnd}` : ""}`;

  return (
    <SidePanel
      open={open}
      onClose={onClose}
      title={draft ? "Neue Notiz" : "Notizen"}
      subtitle={`zu ${chapterLabel}`}
      closeLabel="Notizen schließen"
      footer={
        <Link href="/meine-bibel?bereich=notizen" className="inline-flex items-center gap-1 hover:text-foreground">
          Alle Notizen in „Meine Bibel“
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      }
    >
      {draft ? (
        <NoteForm
          action={saveNote}
          verseKey={draft.verseKey}
          reference={draft.reference}
          initial={{ verseEnd: draft.verseEnd ?? null }}
          compact
          secondaryAction={
            <Button type="button" variant="ghost" onClick={onClose}>
              Abbrechen
            </Button>
          }
        />
      ) : null}

      {notes.length === 0 ? (
        draft ? null : (
          <p className="text-sm text-muted-foreground">
            In diesem Kapitel hast du noch keine Notiz. Wähle einen Vers aus und tippe auf „Notiz“, um eine anzulegen.
          </p>
        )
      ) : (
        <section className={cn(draft && "mt-8 border-t border-border pt-6")} aria-label="Notizen in diesem Kapitel">
          {draft ? <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Bisherige Notizen in diesem Kapitel</h3> : null}
          <ol className="space-y-2">
            {notes.map((n) => (
              <li key={n.id}>
                <Link
                  href={`/meine-bibel/notizen/${n.id}`}
                  className={cn(
                    "block rounded-xl border border-border px-3.5 py-3 transition hover:bg-surface-muted",
                    focusVerse !== null && focusVerse !== undefined && focusVerse === n.verse && "border-primary/50 bg-primary-soft/40",
                  )}
                >
                  <span className="text-xs font-semibold text-primary">{label(n)}</span>
                  {n.title ? <span className="mt-0.5 block text-sm font-medium">{n.title}</span> : null}
                  <span className="mt-0.5 line-clamp-3 block text-sm text-muted-foreground">{n.excerpt}</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}
    </SidePanel>
  );
}
