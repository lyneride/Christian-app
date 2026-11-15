import { BookOpenText, ExternalLink, FileDown } from "lucide-react";
import type { PlanResource } from "@/lib/plans/progress";
import { cn } from "@/lib/utils";

/**
 * "Begleitlektüre" of a book study: free commentaries on bibelkommentare.de,
 * linked (opens in a new tab), never copied.
 */
export function CompanionReading({ resources, className }: { resources: PlanResource[]; className?: string }) {
  if (resources.length === 0) return null;
  return (
    <section aria-labelledby="begleitlektuere" className={cn("rounded-card border border-area-bibel/30 bg-area-bibel-soft/60 p-5", className)}>
      <h2 id="begleitlektuere" className="text-lg font-extrabold">
        Begleitlektüre – kostenlos
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Lies jeden Tag erst das Bibelkapitel, dann den passenden Abschnitt im Kommentar. Beide sind nach Kapiteln gegliedert.
      </p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {resources.map((res) => (
          <li key={res.url}>
            <a
              href={res.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-full flex-col gap-2 rounded-2xl bg-surface p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-pop"
            >
              <span className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-area-bibel-soft text-area-bibel"
                >
                  {res.kind === "pdf" ? <FileDown className="size-5" /> : <BookOpenText className="size-5" />}
                </span>
                <span className="min-w-0">
                  <span className="block font-display font-extrabold leading-snug">{res.title}</span>
                  <span className="block text-sm text-muted-foreground">{res.author}</span>
                </span>
              </span>
              <span className="text-sm">{res.note}</span>
              <span className="mt-auto inline-flex items-center gap-1 text-sm font-bold text-primary group-hover:underline">
                {res.kind === "pdf" ? "PDF herunterladen" : "Online lesen"}
                <ExternalLink aria-hidden="true" className="size-3.5" />
                <span className="sr-only"> (öffnet bibelkommentare.de in neuem Tab)</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted-foreground">Quelle: bibelkommentare.de – dort kostenlos verfügbar.</p>
    </section>
  );
}

/** One compact line for the "today" card: links to the companions for the current chapter. */
export function CompanionHint({ resources, label }: { resources: PlanResource[]; label: string }) {
  if (resources.length === 0) return null;
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
      <span className="text-muted-foreground">Dazu im Kommentar: Abschnitt zu {label}</span>
      {resources.map((res) => (
        <a
          key={res.url}
          href={res.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-bold text-primary hover:underline"
        >
          {res.kind === "pdf" ? <FileDown aria-hidden="true" className="size-3.5" /> : <BookOpenText aria-hidden="true" className="size-3.5" />}
          {res.author}
          <span className="sr-only"> ({res.kind === "pdf" ? "PDF" : "online"}, neuer Tab)</span>
        </a>
      ))}
    </p>
  );
}
