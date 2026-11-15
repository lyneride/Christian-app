import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { createJournalEntry } from "@/lib/study/actions";
import { toDateString } from "@/lib/study/format";
import { JournalForm } from "@/components/study/journal-form";
import { buttonClasses } from "@/components/ui/button";

export const metadata: Metadata = { title: "Neuer Eintrag", robots: { index: false, follow: false } };

export default async function NewJournalEntryPage() {
  await requireUser("/tagebuch/neu");

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6 sm:py-8">
      <Link
        href="/tagebuch"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm -my-3 py-3 font-semibold"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        Zum Tagebuch
      </Link>
      <h1 className="mt-4 text-[30px] leading-tight sm:text-4xl">Neuer Eintrag</h1>
      <p className="text-muted-foreground mt-2 max-w-prose">
        Nimm dir einen Moment. Es muss nicht vollständig sein – ein paar ehrliche Sätze genügen.
      </p>

      <div className="mt-8">
        <JournalForm
          action={createJournalEntry}
          initial={{ date: toDateString() }}
          secondaryAction={
            <Link href="/tagebuch" className={buttonClasses("ghost", "lg")}>
              Abbrechen
            </Link>
          }
        />
      </div>
    </main>
  );
}
