import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Pencil, Trash2 } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { resolveTranslationId } from "@/lib/bible/data";
import { renderMarkdown } from "@/lib/markdown";
import { deleteJournalEntry } from "@/lib/study/actions";
import { formatJournalDate } from "@/lib/study/format";
import { getJournalEntry } from "@/lib/study/queries";
import { ActionButton } from "@/components/study/action-button";
import { VerseSnippet } from "@/components/study/verse-snippet";
import { buttonClasses } from "@/components/ui/button";
import { formatRelative } from "@/lib/utils";

export const metadata: Metadata = { title: "Tagebucheintrag", robots: { index: false, follow: false } };

const PROSE =
  "text-foreground/90 leading-relaxed [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground [&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mt-4 [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-3 [&_ul]:list-disc [&_ul]:pl-6";

function Section({ title, body }: { title: string; body: string | null }) {
  if (!body) return null;
  return (
    <section className="rounded-card border-border bg-surface shadow-soft border p-5">
      <h2 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">{title}</h2>
      <div className={`mt-2 ${PROSE}`} dangerouslySetInnerHTML={{ __html: renderMarkdown(body, { headings: false }) }} />
    </section>
  );
}

export default async function JournalEntryPage(props: PageProps<"/tagebuch/[id]">) {
  const { id } = await props.params;
  const user = await requireUser(`/tagebuch/${id}`);
  const entry = await getJournalEntry(id, user.id);
  if (!entry) notFound();
  const translation = await resolveTranslationId(user.preferredTranslation);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 md:py-14">
      <Link href="/tagebuch" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm">
        <ChevronLeft className="size-4" aria-hidden="true" />
        Zum Tagebuch
      </Link>

      <header className="mt-4">
        <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">{formatJournalDate(entry.date)}</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{entry.title || "Eintrag"}</h1>
        {entry.updatedAt.getTime() - entry.createdAt.getTime() > 60_000 ? (
          <p className="text-muted-foreground mt-1 text-xs">Zuletzt bearbeitet {formatRelative(entry.updatedAt)}</p>
        ) : null}
      </header>

      <div className="mt-8 space-y-5">
        {entry.verseKey ? (
          <div className="rounded-card bg-accent-soft/60 p-5">
            <VerseSnippet verseKey={entry.verseKey} translation={translation} />
          </div>
        ) : null}
        <Section title="Was mich bewegt" body={entry.body} />
        <Section title="Wofür ich dankbar bin" body={entry.gratitude} />
        <Section title="Mein Gebet" body={entry.prayer} />
      </div>

      <div className="border-border mt-10 flex flex-wrap items-center gap-3 border-t pt-6">
        <Link href={`/tagebuch/${entry.id}/bearbeiten`} className={buttonClasses("outline", "md")}>
          <Pencil aria-hidden="true" />
          Bearbeiten
        </Link>
        <ActionButton
          action={deleteJournalEntry.bind(null, entry.id)}
          confirmText="Diesen Eintrag wirklich löschen? Das lässt sich nicht rückgängig machen."
          variant="ghost"
          className="text-muted-foreground hover:text-danger"
        >
          <Trash2 aria-hidden="true" />
          Löschen
        </ActionButton>
      </div>
    </main>
  );
}
