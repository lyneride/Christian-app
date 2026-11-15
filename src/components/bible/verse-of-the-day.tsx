import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getVerseOfTheDay } from "@/lib/bible/data";
import { formatReference, referencePath } from "@/lib/bible/reference";
import { localeFor } from "@/lib/bible/ui";
import { cn } from "@/lib/utils";
import { AreaTile } from "@/components/layout/area-card";

interface Props {
  translationId: string;
  /** `t` to put in the link (undefined for the default translation) */
  tParam?: string;
  className?: string;
}

/** "Tagesvers" card – deterministic per day, see getVerseOfTheDay. */
export async function VerseOfTheDay({ translationId, tParam, className }: Props) {
  const votd = await getVerseOfTheDay(translationId);
  const locale = localeFor(votd.translation?.language);
  const ref = { book: votd.book, chapter: votd.chapter, verseStart: votd.verseStart, verseEnd: votd.verseEnd };
  const href = referencePath(ref, tParam);
  const multiple = votd.verses.length > 1;

  return (
    <section
      aria-labelledby="tagesvers"
      className={cn("rounded-card bg-surface p-5 shadow-soft sm:p-7", className)}
    >
      <div className="flex items-center gap-2.5">
        <AreaTile area="heute" size="sm" />
        <p id="tagesvers" className="font-display text-xs font-black tracking-wider text-muted-foreground uppercase">
          Tagesvers
        </p>
      </div>
      <blockquote className="scripture mt-3 text-balance" lang={locale}>
        {votd.verses.map((v) => (
          <span key={v.verse}>
            {multiple ? <sup className="verse-number">{v.verse}</sup> : null}
            {v.text}{" "}
          </span>
        ))}
      </blockquote>
      <footer className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
        <Link href={href} className="inline-flex items-center gap-1 font-display font-extrabold text-primary hover:underline">
          {formatReference(ref, locale)}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
        <span className="text-muted-foreground">{votd.translation?.shortName}</span>
      </footer>
    </section>
  );
}
