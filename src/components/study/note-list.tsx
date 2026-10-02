import Link from "next/link";
import Form from "next/form";
import { NotebookPen, Pencil, Search, Trash2 } from "lucide-react";
import { formatReference, parseVerseKey, referencePath } from "@/lib/bible/reference";
import { markdownToText } from "@/lib/markdown";
import type { Page } from "@/lib/pagination";
import { deleteNote } from "@/lib/study/actions";
import { listNotes, type ChapterNote } from "@/lib/study/queries";
import { NOTE_VISIBILITY_LABELS } from "@/lib/validation/study";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { formatRelative } from "@/lib/utils";
import { ActionButton } from "./action-button";

export interface NoteListProps {
  userId: string;
  translation: string;
  q?: string;
  page: Page;
  basePath: string;
  params: Record<string, string | undefined>;
}

export function noteReference(note: Pick<ChapterNote, "verseKey" | "verseEnd">, translation?: string) {
  const parsed = parseVerseKey(note.verseKey);
  if (!parsed) return null;
  const ref = {
    book: parsed.book,
    chapter: parsed.chapter,
    verseStart: parsed.verse,
    verseEnd: note.verseEnd ?? undefined,
  };
  return { label: formatReference(ref, "de"), href: referencePath(ref, translation) };
}

/** Notizen: search, list with excerpt, edit and delete. */
export async function NoteList({ userId, translation, q, page, basePath, params }: NoteListProps) {
  const { items, total } = await listNotes(userId, { q, page });
  const searching = Boolean(q);

  if (!searching && total === 0) {
    return (
      <EmptyState
        icon={<NotebookPen />}
        title="Noch keine Notizen"
        description="Schreib dir im Bibel-Reader Gedanken zu einem Vers auf – privat oder geteilt mit anderen Mitgliedern."
        action={
          <Link href="/bibel" className="text-primary text-sm font-medium underline-offset-4 hover:underline">
            Zur Bibel
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <Form action={basePath} className="flex flex-col gap-2 sm:flex-row" role="search">
        <input type="hidden" name="bereich" value="notizen" />
        <label htmlFor="notiz-suche" className="sr-only">
          Notizen durchsuchen
        </label>
        <Input
          id="notiz-suche"
          name="q"
          type="search"
          placeholder="In Titel und Text suchen"
          defaultValue={q ?? ""}
          autoComplete="off"
          className="flex-1"
        />
        <button type="submit" className={buttonClasses("secondary", "md")}>
          <Search aria-hidden="true" />
          Suchen
        </button>
      </Form>

      {searching ? (
        <p className="text-muted-foreground text-sm" role="status">
          {total === 0
            ? "Keine Notiz passt zu deiner Suche."
            : `${total} ${total === 1 ? "Notiz" : "Notizen"} gefunden.`}{" "}
          <Link href={basePath + "?bereich=notizen"} className="text-primary underline-offset-4 hover:underline">
            Alle anzeigen
          </Link>
        </p>
      ) : null}

      <ul className="space-y-3">
        {items.map((note) => {
          const ref = noteReference(note, translation);
          return (
            <li key={note.id} className="rounded-card border-border bg-surface shadow-soft border p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                {ref ? (
                  <Link href={ref.href} className="text-primary font-medium underline-offset-4 hover:underline">
                    {ref.label}
                  </Link>
                ) : null}
                <span className="text-muted-foreground">{formatRelative(note.updatedAt)}</span>
                {note.visibility === "MEMBERS" ? (
                  <Badge variant="accent">{NOTE_VISIBILITY_LABELS.MEMBERS.label}</Badge>
                ) : null}
              </div>
              {note.title ? <h3 className="mt-2 text-base font-semibold">{note.title}</h3> : null}
              <p className="text-foreground/90 mt-1 text-sm leading-relaxed">{markdownToText(note.body, 220)}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Link href={`/meine-bibel/notizen/${note.id}`} className={buttonClasses("outline", "sm")}>
                  <Pencil aria-hidden="true" />
                  Bearbeiten
                </Link>
                <ActionButton
                  action={deleteNote.bind(null, note.id, undefined)}
                  confirmText="Diese Notiz wirklich löschen?"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-danger"
                >
                  <Trash2 aria-hidden="true" />
                  Löschen
                </ActionButton>
              </div>
            </li>
          );
        })}
      </ul>

      <Pagination basePath={basePath} params={params} page={page.page} perPage={page.perPage} total={total} />
    </div>
  );
}
