import type { Metadata } from "next";
import Link from "next/link";
import { BookHeart, HandHeart, Heart, PenLine, Plus } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { formatReference, parseVerseKey } from "@/lib/bible/reference";
import { markdownToText } from "@/lib/markdown";
import { pageHref, parsePage } from "@/lib/pagination";
import { formatJournalDate, monthLabel } from "@/lib/study/format";
import { listJournal, listJournalMonths, type JournalEntryItem } from "@/lib/study/queries";
import { parseMonth } from "@/lib/validation/study";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Tagebuch",
  description: "Dein privater Platz zum Nachdenken, Danken und Beten.",
  robots: { index: false, follow: false },
};

const BASE_PATH = "/tagebuch";

function entryReference(verseKey: string | null): string | null {
  if (!verseKey) return null;
  const parsed = parseVerseKey(verseKey);
  return parsed ? formatReference({ book: parsed.book, chapter: parsed.chapter, verseStart: parsed.verse }, "de") : null;
}

function groupByMonth(items: JournalEntryItem[]): { month: string; items: JournalEntryItem[] }[] {
  const groups: { month: string; items: JournalEntryItem[] }[] = [];
  for (const item of items) {
    const month = item.date.slice(0, 7);
    const last = groups[groups.length - 1];
    if (last && last.month === month) last.items.push(item);
    else groups.push({ month, items: [item] });
  }
  return groups;
}

function EntryCard({ entry }: { entry: JournalEntryItem }) {
  const ref = entryReference(entry.verseKey);
  return (
    <li>
      <Link
        href={`${BASE_PATH}/${entry.id}`}
        className="rounded-card border-border bg-surface shadow-soft hover:border-primary/40 block border p-4 transition-colors sm:p-5"
      >
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{formatJournalDate(entry.date)}</p>
        <h3 className="mt-1 text-base font-semibold">{entry.title || "Eintrag"}</h3>
        <p className="text-foreground/90 mt-1 text-sm leading-relaxed">{markdownToText(entry.body, 180)}</p>
        <div className="text-muted-foreground mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          {entry.gratitude ? (
            <span className="inline-flex items-center gap-1">
              <Heart className="size-3.5" aria-hidden="true" /> Dank
            </span>
          ) : null}
          {entry.prayer ? (
            <span className="inline-flex items-center gap-1">
              <HandHeart className="size-3.5" aria-hidden="true" /> Gebet
            </span>
          ) : null}
          {ref ? (
            <span className="inline-flex items-center gap-1">
              <BookHeart className="size-3.5" aria-hidden="true" /> {ref}
            </span>
          ) : null}
        </div>
      </Link>
    </li>
  );
}

export default async function TagebuchPage(props: PageProps<"/tagebuch">) {
  const user = await requireUser(BASE_PATH);
  const sp = await props.searchParams;
  const month = parseMonth(sp.monat);
  const page = parsePage(sp.seite, 20);
  const [{ items, total }, months] = await Promise.all([listJournal(user.id, { page, month }), listJournalMonths(user.id)]);
  const params = { monat: month };
  const hasEntries = months.length > 0;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 md:py-14">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Tagebuch</h1>
          <p className="text-muted-foreground mt-3 max-w-prose text-lg">
            Dein Platz zum Nachdenken, Danken und Beten. Nur du siehst diese Einträge.
          </p>
        </div>
        <Link href={`${BASE_PATH}/neu`} className={buttonClasses("primary", "md", "shrink-0")}>
          <Plus aria-hidden="true" />
          Neuer Eintrag
        </Link>
      </header>

      {!hasEntries ? (
        <EmptyState
          icon={<PenLine />}
          title="Noch kein Eintrag"
          description="Fang klein an: ein Satz darüber, was dich heute bewegt, reicht völlig."
          className="mt-10"
          action={
            <Link href={`${BASE_PATH}/neu`} className={buttonClasses("outline", "md")}>
              Ersten Eintrag schreiben
            </Link>
          }
        />
      ) : (
        <>
          {months.length > 1 ? (
            <nav aria-label="Monate" className="mt-8">
              <ul className="flex flex-wrap gap-2">
                <li>
                  <Link
                    href={pageHref(BASE_PATH, { monat: undefined }, 1)}
                    aria-current={!month ? "page" : undefined}
                    className={cn(
                      "inline-flex h-8 items-center gap-2 rounded-full border px-3 text-sm transition-colors",
                      !month ? "border-primary bg-primary-soft text-primary" : "border-border hover:bg-surface-muted",
                    )}
                  >
                    Alle
                  </Link>
                </li>
                {months.map((m) => (
                  <li key={m.month}>
                    <Link
                      href={pageHref(BASE_PATH, { monat: m.month }, 1)}
                      aria-current={month === m.month ? "page" : undefined}
                      className={cn(
                        "inline-flex h-8 items-center gap-2 rounded-full border px-3 text-sm transition-colors",
                        month === m.month ? "border-primary bg-primary-soft text-primary" : "border-border hover:bg-surface-muted",
                      )}
                    >
                      {monthLabel(m.month)} <span className="text-muted-foreground text-xs">{m.count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}

          {items.length === 0 ? (
            <p className="text-muted-foreground mt-8 text-sm">In diesem Monat gibt es keine Einträge.</p>
          ) : (
            <div className="mt-8 space-y-10">
              {groupByMonth(items).map((group) => (
                <section key={group.month} aria-labelledby={`monat-${group.month}`}>
                  <h2 id={`monat-${group.month}`} className="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
                    {monthLabel(group.month)}
                  </h2>
                  <ul className="space-y-3">
                    {group.items.map((entry) => (
                      <EntryCard key={entry.id} entry={entry} />
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}

          <Pagination basePath={BASE_PATH} params={params} page={page.page} perPage={page.perPage} total={total} />
        </>
      )}
    </main>
  );
}
