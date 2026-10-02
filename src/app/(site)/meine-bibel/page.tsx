import type { Metadata } from "next";
import Link from "next/link";
import { Bookmark, Highlighter, NotebookPen } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { resolveTranslationId } from "@/lib/bible/data";
import { parsePage } from "@/lib/pagination";
import { readingStats } from "@/lib/study/queries";
import { isHighlightColor, type HighlightColor } from "@/lib/validation/study";
import { BookmarkList } from "@/components/study/bookmark-list";
import { HighlightList } from "@/components/study/highlight-list";
import { NoteList } from "@/components/study/note-list";
import { ReadingProgress } from "@/components/study/reading-progress";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Meine Bibel",
  description: "Deine Markierungen, Notizen, Lesezeichen und dein Lesefortschritt.",
  robots: { index: false, follow: false },
};

const BASE_PATH = "/meine-bibel";

const SECTIONS = [
  { id: "markierungen", label: "Markierungen", Icon: Highlighter },
  { id: "notizen", label: "Notizen", Icon: NotebookPen },
  { id: "lesezeichen", label: "Lesezeichen", Icon: Bookmark },
] as const;
type Section = (typeof SECTIONS)[number]["id"];

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

function parseSection(value: string | undefined): Section {
  return SECTIONS.some((s) => s.id === value) ? (value as Section) : "markierungen";
}

export default async function MeineBibelPage(props: PageProps<"/meine-bibel">) {
  const user = await requireUser(BASE_PATH);
  const sp = await props.searchParams;
  const section = parseSection(first(sp.bereich));
  const q = first(sp.q)?.trim() || undefined;
  const farbe = first(sp.farbe);
  const color: HighlightColor | undefined = isHighlightColor(farbe) ? farbe : undefined;
  const page = parsePage(sp.seite, section === "markierungen" ? 40 : 20);
  const translation = await resolveTranslationId(user.preferredTranslation);
  const stats = await readingStats(user.id);

  const params: Record<string, string | undefined> = {
    bereich: section,
    q: section === "notizen" ? q : undefined,
    farbe: section === "markierungen" ? color : undefined,
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 md:py-14">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Meine Bibel</h1>
        <p className="text-muted-foreground mt-3 max-w-prose text-lg">
          Deine Markierungen, Notizen und Lesezeichen – und ein Blick darauf, wo du schon gelesen hast. Alles hier siehst nur du.
        </p>
      </header>

      <ReadingProgress stats={stats} className="mt-8" />

      <nav aria-label="Bereiche" className="mt-10">
        <ul className="border-border flex gap-1 overflow-x-auto border-b">
          {SECTIONS.map(({ id, label, Icon }) => {
            const active = id === section;
            return (
              <li key={id}>
                <Link
                  href={`${BASE_PATH}?bereich=${id}`}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "-mb-px inline-flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors",
                    active ? "border-primary text-primary" : "text-muted-foreground hover:text-foreground border-transparent",
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <section className="mt-6" aria-live="polite">
        {section === "markierungen" ? (
          <HighlightList userId={user.id} translation={translation} color={color} page={page} basePath={BASE_PATH} params={params} />
        ) : section === "notizen" ? (
          <NoteList userId={user.id} translation={translation} q={q} page={page} basePath={BASE_PATH} params={params} />
        ) : (
          <BookmarkList userId={user.id} translation={translation} />
        )}
      </section>
    </main>
  );
}
