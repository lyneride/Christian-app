import Link from "next/link";
import { Highlighter, SlidersHorizontal, X } from "lucide-react";
import { getBookByNumber } from "@/lib/bible/books";
import { getVerse } from "@/lib/bible/data";
import { formatReference, parseVerseKey, referencePath } from "@/lib/bible/reference";
import type { Page } from "@/lib/pagination";
import { pageHref } from "@/lib/pagination";
import { setHighlight } from "@/lib/study/actions";
import { groupByBook, highlightColorCounts, listHighlights, type HighlightItem } from "@/lib/study/queries";
import type { HighlightColor } from "@/lib/validation/study";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { cn, truncate } from "@/lib/utils";
import { ActionButton } from "./action-button";
import { getMarkerPalette } from "@/lib/study/marker-queries";
import { MARKER_BG, markerStyle, resolveMarker } from "@/lib/study/markers";

export interface HighlightListProps {
  userId: string;
  /** translation for the verse texts (the user's preferred one) */
  translation: string;
  color?: HighlightColor;
  page: Page;
  basePath: string;
  /** current query params (without `seite`) for pagination and chips */
  params: Record<string, string | undefined>;
}

async function withText(item: HighlightItem, translation: string) {
  const parsed = parseVerseKey(item.verseKey);
  if (!parsed) return null;
  const verse = await getVerse(translation, parsed.book.number, parsed.chapter, parsed.verse);
  const ref = { book: parsed.book, chapter: parsed.chapter, verseStart: parsed.verse };
  return {
    item,
    ref,
    label: formatReference(ref, "de"),
    href: referencePath(ref, translation),
    text: verse?.text.trim() ?? "",
  };
}

/** Markierungen: colour filter chips, verses grouped by book, remove button. */
export async function HighlightList({ userId, translation, color, page, basePath, params }: HighlightListProps) {
  const [{ items, total }, counts, palette] = await Promise.all([
    listHighlights(userId, { color, page }),
    highlightColorCounts(userId),
    getMarkerPalette(userId),
  ]);
  const totalAll = Object.values(counts).reduce((a, b) => a + b, 0);

  if (totalAll === 0) {
    return (
      <EmptyState
        icon={<Highlighter />}
        title="Noch keine Markierungen"
        description="Markiere im Bibel-Reader Verse in einer Farbe – hier findest du sie wieder."
        action={
          <Link href="/bibel" className="text-primary text-sm font-medium underline-offset-4 hover:underline">
            Zur Bibel
          </Link>
        }
      />
    );
  }

  const groups = groupByBook(items);
  const groupsWithText = await Promise.all(
    groups.map(async (g) => ({
      book: getBookByNumber(g.book),
      rows: (await Promise.all(g.items.map((i) => withText(i, translation)))).filter((r) => r !== null),
    })),
  );

  return (
    <div className="space-y-6">
      <ul className="flex flex-wrap gap-2" aria-label="Nach Farbe filtern">
        <li>
          <Link
            href={pageHref(basePath, { ...params, farbe: undefined }, 1)}
            aria-current={!color ? "page" : undefined}
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-full border px-3.5 text-sm font-semibold transition-colors",
              !color ? "border-primary bg-primary-soft text-primary" : "border-border hover:bg-surface-muted",
            )}
          >
            Alle <span className="text-muted-foreground text-xs">{totalAll}</span>
          </Link>
        </li>
        {palette
          .filter((m) => (counts[m.key] ?? 0) > 0)
          .map((m) => (
            <li key={m.key}>
              <Link
                href={pageHref(basePath, { ...params, farbe: m.key }, 1)}
                aria-current={color === m.key ? "page" : undefined}
                className={cn(
                  "inline-flex h-10 items-center gap-2 rounded-full border px-3.5 text-sm font-semibold transition-colors",
                  color === m.key ? "border-primary bg-primary-soft text-primary" : "border-border hover:bg-surface-muted",
                )}
              >
                <span className={cn("size-3.5 rounded-full border border-black/10", MARKER_BG)} style={markerStyle(m)} aria-hidden="true" />
                {m.label} <span className="text-muted-foreground text-xs">{counts[m.key]}</span>
              </Link>
            </li>
          ))}
        <li>
          <Link
            href="/einstellungen/markierungen"
            className="text-primary inline-flex h-10 items-center gap-1.5 rounded-full px-2 text-sm font-semibold underline-offset-4 hover:underline"
          >
            <SlidersHorizontal className="size-4" aria-hidden="true" /> Farben anpassen
          </Link>
        </li>
      </ul>

      {items.length === 0 ? (
        <p className="text-muted-foreground text-sm">In dieser Farbe hast du noch nichts markiert.</p>
      ) : (
        groupsWithText.map(({ book, rows }) => (
          <section key={book?.number ?? rows[0]?.item.verseKey} aria-labelledby={`buch-${book?.number ?? "x"}`}>
            <h3
              id={`buch-${book?.number ?? "x"}`}
              className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase"
            >
              {book?.name.de ?? "Unbekanntes Buch"}
            </h3>
            <ul className="divide-border rounded-card border-border bg-surface shadow-soft divide-y border">
              {rows.map(({ item, label, href, text }) => (
                <li key={item.id} className="flex items-start gap-3 p-4">
                  {(() => {
                    const m = resolveMarker(palette, item.color);
                    return (
                      <span
                        className={cn("mt-1.5 size-3.5 shrink-0 rounded-full border border-black/10", MARKER_BG)}
                        style={markerStyle(m)}
                        role="img"
                        aria-label={m.label}
                        title={m.label}
                      />
                    );
                  })()}
                  <div className="min-w-0 flex-1">
                    <Link href={href} className="text-primary text-sm font-medium underline-offset-4 hover:underline">
                      {label}
                    </Link>
                    <p className="scripture text-foreground/90 mt-0.5 text-base leading-relaxed">
                      {text ? (
                        truncate(text, 220)
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          Text in dieser Übersetzung nicht verfügbar.
                        </span>
                      )}
                    </p>
                  </div>
                  <ActionButton
                    action={setHighlight.bind(null, [item.verseKey], null)}
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0"
                    aria-label={`Markierung ${label} entfernen`}
                    title="Markierung entfernen"
                  >
                    <X aria-hidden="true" />
                  </ActionButton>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}

      <Pagination basePath={basePath} params={params} page={page.page} perPage={page.perPage} total={total} />
    </div>
  );
}
