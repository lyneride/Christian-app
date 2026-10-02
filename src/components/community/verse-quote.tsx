import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { VerseQuote as Quote } from "@/lib/community/queries";
import { cn } from "@/lib/utils";

/** The verse a post refers to, set in serif with a link into the reader. */
export function VerseQuote({ quote, className }: { quote: Quote; className?: string }) {
  return (
    <figure className={cn("rounded-xl border-l-4 border-accent bg-accent-soft/40 px-4 py-3", className)}>
      <blockquote className="scripture text-[1.05rem] text-foreground/90" lang="de">
        {quote.text}
      </blockquote>
      <figcaption className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
        <Link href={quote.href} className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
          {quote.reference}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
        <span className="text-xs text-muted-foreground">{quote.translation}</span>
      </figcaption>
    </figure>
  );
}
