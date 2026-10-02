import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { formatReference, parseVerseKey } from "@/lib/bible/reference";
import { updateJournalEntry } from "@/lib/study/actions";
import { formatJournalDate } from "@/lib/study/format";
import { getJournalEntry } from "@/lib/study/queries";
import { JournalForm } from "@/components/study/journal-form";
import { buttonClasses } from "@/components/ui/button";

export const metadata: Metadata = { title: "Eintrag bearbeiten", robots: { index: false, follow: false } };

export default async function EditJournalEntryPage(props: PageProps<"/tagebuch/[id]/bearbeiten">) {
  const { id } = await props.params;
  const user = await requireUser(`/tagebuch/${id}/bearbeiten`);
  const entry = await getJournalEntry(id, user.id);
  if (!entry) notFound();

  const parsed = entry.verseKey ? parseVerseKey(entry.verseKey) : null;
  const verse = parsed ? formatReference({ book: parsed.book, chapter: parsed.chapter, verseStart: parsed.verse }, "de") : "";
  const backHref = `/tagebuch/${entry.id}`;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 md:py-14">
      <Link href={backHref} className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm">
        <ChevronLeft className="size-4" aria-hidden="true" />
        Zum Eintrag
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">Eintrag bearbeiten</h1>
      <p className="text-muted-foreground mt-2">{formatJournalDate(entry.date)}</p>

      <div className="mt-8">
        <JournalForm
          action={updateJournalEntry.bind(null, entry.id)}
          initial={{
            date: entry.date,
            title: entry.title,
            body: entry.body,
            gratitude: entry.gratitude,
            prayer: entry.prayer,
            verse,
          }}
          submitLabel="Änderungen speichern"
          secondaryAction={
            <Link href={backHref} className={buttonClasses("ghost", "lg")}>
              Abbrechen
            </Link>
          }
        />
      </div>
    </main>
  );
}
