import Link from "next/link";
import { buildBookUrl, groupBooks } from "@/lib/bible/ui";
import { cn } from "@/lib/utils";

interface Props {
  /** language of the chosen translation – English translations show the English name as hint */
  language: "de" | "en";
  /** `t` for the links (undefined for the default translation) */
  tParam?: string;
  className?: string;
}

/** All 66 books grouped by testament and genre. */
export function BookGrid({ language, tParam, className }: Props) {
  return (
    <div className={cn("space-y-12", className)}>
      {groupBooks().map((testament) => (
        <section
          key={testament.testament}
          id={testament.testament === "OT" ? "at" : "nt"}
          aria-labelledby={`bg-${testament.testament}`}
        >
          <h2 id={`bg-${testament.testament}`} className="text-2xl font-semibold tracking-tight">
            {testament.label}
          </h2>
          <div className="mt-6 space-y-8">
            {testament.groups.map((group) => (
              <div key={group.genre}>
                <h3 className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">{group.label}</h3>
                <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {group.books.map((book) => (
                    <li key={book.id}>
                      <Link
                        href={buildBookUrl(book, { t: tParam })}
                        className="border-border bg-surface hover:border-primary/40 hover:bg-primary-soft/40 hover:shadow-soft flex h-full flex-col rounded-xl border px-3 py-2.5 transition"
                      >
                        <span className="text-sm font-medium">{book.name.de}</span>
                        <span className="text-muted-foreground text-xs">
                          {language === "en" ? book.name.en : `${book.chapters} Kapitel`}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
