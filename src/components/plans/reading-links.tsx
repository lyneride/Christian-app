import Link from "next/link";
import type { Locale } from "@/lib/bible/reference";
import { mergeReadings, spanLabel, spanPath, type Reading } from "@/lib/plans/progress";
import { cn } from "@/lib/utils";

export interface ReadingLinksProps {
  readings: readonly Reading[];
  locale?: Locale;
  /** reader translation for `?t=` (undefined = default) */
  translation?: string;
  /** render as plain text instead of links */
  plain?: boolean;
  className?: string;
  linkClassName?: string;
}

/**
 * A day's readings as reader links, consecutive chapters merged
 * ("1. Mose 1–2", "Matthäus 1"). Pure, usable from server and client components.
 */
export function ReadingLinks({ readings, locale = "de", translation, plain, className, linkClassName }: ReadingLinksProps) {
  const spans = mergeReadings(readings);
  if (spans.length === 0) return <span className={cn("text-muted-foreground", className)}>Keine Lesestelle</span>;
  return (
    <span className={cn("inline-flex flex-wrap items-center gap-x-1.5 gap-y-1", className)}>
      {spans.map((span, i) => {
        const label = spanLabel(span, locale);
        const href = plain ? null : spanPath(span, translation);
        return (
          <span key={`${span.book}:${span.chapterStart}:${span.verseStart ?? 0}:${i}`} className="inline-flex items-center gap-1.5">
            {i > 0 ? (
              <span aria-hidden="true" className="text-muted-foreground/60">
                ·
              </span>
            ) : null}
            {href ? (
              <Link href={href} className={cn("font-medium text-primary underline-offset-4 hover:underline", linkClassName)}>
                {label}
              </Link>
            ) : (
              <span className={linkClassName}>{label}</span>
            )}
          </span>
        );
      })}
    </span>
  );
}
