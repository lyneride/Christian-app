import { NEW_TESTAMENT, OLD_TESTAMENT, type BibleBook } from "@/lib/bible/books";
import { TESTAMENT_LABELS } from "@/lib/bible/ui";
import { chaptersSummary, weekSummary } from "@/lib/study/format";
import type { ReadingStats } from "@/lib/study/queries";
import { cn, formatRelative } from "@/lib/utils";

function BookRow({ book, read }: { book: BibleBook; read: number }) {
  const total = book.chapters;
  const pct = total > 0 ? Math.min(100, Math.round((read / total) * 100)) : 0;
  return (
    <li className="flex items-center gap-2 text-xs">
      <span className="text-muted-foreground w-9 shrink-0 truncate" title={book.name.de}>
        {book.abbr.de}
      </span>
      <span
        role="progressbar"
        aria-label={`${book.name.de}: ${read} von ${total} Kapiteln`}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={read}
        className="bg-surface-muted h-1.5 flex-1 overflow-hidden rounded-full"
      >
        <span
          className={cn("block h-full rounded-full", pct === 100 ? "bg-success" : "bg-primary")}
          style={{ width: `${pct}%` }}
        />
      </span>
      <span className="text-muted-foreground w-10 shrink-0 text-right tabular-nums">
        {read}/{total}
      </span>
    </li>
  );
}

/** Compact reading overview: chapters read per book, grouped by testament. No streaks, no pressure. */
export function ReadingProgress({ stats, className }: { stats: ReadingStats; className?: string }) {
  const pct = stats.totalChapters > 0 ? Math.round((stats.chaptersRead / stats.totalChapters) * 100) : 0;
  return (
    <section
      aria-labelledby="lesefortschritt"
      className={cn("rounded-card border-border bg-surface shadow-soft border p-5", className)}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 id="lesefortschritt" className="text-lg font-semibold tracking-tight">
          Gelesen
        </h2>
        <p className="text-muted-foreground text-sm">
          {chaptersSummary(stats.chaptersRead, stats.totalChapters)} · {weekSummary(stats.thisWeek)}
          {stats.lastReadAt ? ` · zuletzt ${formatRelative(stats.lastReadAt)}` : ""}
        </p>
      </div>
      <div
        role="progressbar"
        aria-label="Gesamter Lesefortschritt"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        className="bg-surface-muted mt-3 h-2 overflow-hidden rounded-full"
      >
        <span className="bg-accent block h-full rounded-full" style={{ width: `${pct}%` }} />
      </div>

      {stats.chaptersRead === 0 ? (
        <p className="text-muted-foreground mt-4 text-sm">
          Sobald du im Bibel-Reader ein Kapitel als gelesen markierst, siehst du hier, wo du schon warst.
        </p>
      ) : (
        <details className="group mt-4">
          <summary className="text-primary cursor-pointer text-sm font-medium underline-offset-4 select-none hover:underline">
            Nach Büchern anzeigen
          </summary>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            {(
              [
                ["OT", OLD_TESTAMENT],
                ["NT", NEW_TESTAMENT],
              ] as const
            ).map(([testament, books]) => (
              <div key={testament}>
                <h3 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
                  {TESTAMENT_LABELS[testament]}
                </h3>
                <ul className="grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
                  {books.map((book) => (
                    <BookRow key={book.number} book={book} read={stats.byBook[book.number] ?? 0} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </details>
      )}
    </section>
  );
}
