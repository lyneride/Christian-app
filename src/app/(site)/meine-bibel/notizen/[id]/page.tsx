import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Trash2 } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { resolveTranslationId } from "@/lib/bible/data";
import { deleteNote, updateNote } from "@/lib/study/actions";
import { getNote } from "@/lib/study/queries";
import { ActionButton } from "@/components/study/action-button";
import { NoteForm } from "@/components/study/note-form";
import { noteReference } from "@/components/study/note-list";
import { VerseSnippet } from "@/components/study/verse-snippet";
import { buttonClasses } from "@/components/ui/button";

export const metadata: Metadata = { title: "Notiz bearbeiten", robots: { index: false, follow: false } };

const LIST_PATH = "/meine-bibel?bereich=notizen";

export default async function EditNotePage(props: PageProps<"/meine-bibel/notizen/[id]">) {
  const { id } = await props.params;
  const user = await requireUser(`/meine-bibel/notizen/${id}`);
  const note = await getNote(id, user.id);
  if (!note) notFound();
  const translation = await resolveTranslationId(user.preferredTranslation);
  const ref = noteReference(note, translation);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 md:py-14">
      <Link
        href={LIST_PATH}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        Zu den Notizen
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">Notiz bearbeiten</h1>

      <div className="rounded-card border-border bg-surface shadow-soft mt-6 border p-5">
        <VerseSnippet verseKey={note.verseKey} verseEnd={note.verseEnd} translation={translation} />
      </div>

      <div className="mt-8">
        <NoteForm
          action={updateNote.bind(null, note.id)}
          verseKey={note.verseKey}
          reference={ref?.label}
          initial={{ verseEnd: note.verseEnd, title: note.title, body: note.body, visibility: note.visibility }}
          next={LIST_PATH}
          submitLabel="Änderungen speichern"
          secondaryAction={
            <Link href={LIST_PATH} className={buttonClasses("ghost", "md")}>
              Abbrechen
            </Link>
          }
        />
      </div>

      <div className="border-border mt-12 border-t pt-6">
        <ActionButton
          action={deleteNote.bind(null, note.id, LIST_PATH)}
          confirmText="Diese Notiz wirklich löschen?"
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-danger"
        >
          <Trash2 aria-hidden="true" />
          Notiz löschen
        </ActionButton>
      </div>
    </main>
  );
}
