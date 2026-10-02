import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { listTranslations } from "@/lib/bible/data";
import { dueMemoryVerses, listMemoryVerses } from "@/lib/study/queries";
import { MemoryPractice, type PracticeVerse } from "@/components/study/memory-practice";

export const metadata: Metadata = { title: "Verse üben", robots: { index: false, follow: false } };

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function PracticePage(props: PageProps<"/merken/ueben">) {
  const user = await requireUser("/merken/ueben");
  const sp = await props.searchParams;
  const all = first(sp.alle) === "1";
  const [rows, translations] = await Promise.all([
    all ? listMemoryVerses(user.id) : dueMemoryVerses(user.id),
    listTranslations(),
  ]);
  const names = Object.fromEntries(translations.map((t) => [t.id, t.shortName]));
  const verses: PracticeVerse[] = rows.map((v) => ({
    id: v.id,
    reference: v.reference,
    text: v.text,
    box: v.box,
    translationName: names[v.translation] ?? v.translation,
  }));

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 md:py-14">
      <Link
        href="/merken"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        Zur Lernliste
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">Üben</h1>
      <p className="text-muted-foreground mt-2 max-w-prose">
        Sprich den Vers leise vor dich hin, deck ihn Schritt für Schritt auf und sei ehrlich mit dir – beides ist in
        Ordnung.
      </p>
      <div className="mt-8">
        <MemoryPractice verses={verses} />
      </div>
    </main>
  );
}
