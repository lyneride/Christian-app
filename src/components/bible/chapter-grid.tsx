import Link from "next/link";
import type { BibleBook } from "@/lib/bible/books";
import { buildReaderUrl } from "@/lib/bible/ui";
import { cn } from "@/lib/utils";

interface Props {
  book: BibleBook;
  /** chapter count in the chosen translation */
  count: number;
  t?: string;
  p?: string | null;
  current?: number;
  className?: string;
}

/** Numbered chapter tiles linking into the reader. */
export function ChapterGrid({ book, count, t, p, current, className }: Props) {
  return (
    <ol
      aria-label={`Kapitel von ${book.name.de}`}
      className={cn("grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12", className)}
    >
      {Array.from({ length: count }, (_, i) => i + 1).map((n) => (
        <li key={n}>
          <Link
            href={buildReaderUrl(book, n, { t, p })}
            aria-current={n === current ? "page" : undefined}
            aria-label={`Kapitel ${n}`}
            className={cn(
              "border-border bg-surface hover:border-primary/40 hover:bg-primary-soft/50 flex aspect-square items-center justify-center rounded-lg border text-sm font-medium tabular-nums transition",
              n === current && "border-primary bg-primary-soft text-primary",
            )}
          >
            {n}
          </Link>
        </li>
      ))}
    </ol>
  );
}
