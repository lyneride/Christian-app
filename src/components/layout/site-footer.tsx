import Link from "next/link";
import { Logo } from "./logo";

const COLUMNS = [
  {
    title: "Entdecken",
    links: [
      { href: "/bibel", label: "Bibel lesen" },
      { href: "/bibel/suche", label: "Bibelsuche" },
      { href: "/leseplaene", label: "Lesepläne" },
      { href: "/gebet", label: "Gebetswand" },
    ],
  },
  {
    title: "Gemeinschaft",
    links: [
      { href: "/gemeinschaft", label: "Beiträge" },
      { href: "/gruppen", label: "Gruppen" },
      { href: "/veranstaltungen", label: "Treffen" },
      { href: "/zeugnisse", label: "Zeugnisse" },
    ],
  },
];

const ABOUT = [
  { href: "/ueber", label: "Warum Bleibe?" },
  { href: "/hilfe", label: "Hilfe" },
  { href: "/datenschutz", label: "Datenschutz" },
  { href: "/impressum", label: "Impressum" },
];

/**
 * Phones: compact (logo, one line, the "about" links) – the bottom bar already
 * leads everywhere else. Computers: the full four columns.
 */
export function SiteFooter() {
  return (
    <footer data-site-footer className="mt-auto border-t border-border bg-surface-muted/40">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 md:grid-cols-4 md:gap-10 md:py-12">
        <div className="space-y-2 md:space-y-3">
          <div className="flex items-center gap-2 font-display font-extrabold">
            <Logo className="size-7 text-primary" />
            Bleibe
          </div>
          <p className="max-w-xs text-sm text-muted-foreground">Werbefrei, ohne Tracking, ohne Abo.</p>
          <p className="hidden font-serif text-sm text-muted-foreground italic md:block">„Bleibt in mir und ich in euch.“ – Johannes 15,4</p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title} className="hidden md:block">
            <h2 className="text-sm font-extrabold">{col.title}</h2>
            <ul className="mt-3 space-y-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted-foreground hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <h2 className="hidden text-sm font-extrabold md:block">Über Bleibe</h2>
          <ul className="flex flex-wrap gap-x-4 gap-y-1 md:mt-3 md:block md:space-y-2">
            {ABOUT.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-flex min-h-8 items-center text-sm text-muted-foreground hover:text-foreground md:min-h-0">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-4 py-3 text-[11px] leading-relaxed text-muted-foreground sm:px-6 md:py-4 md:text-xs">
          Bibeltexte: Luther 1912, Elberfelder 1905 (gemeinfrei), Schlachter 1951 (© Genfer Bibelgesellschaft, nicht-kommerziell), BSB, KJV.
          Querverweise: OpenBible.info (CC-BY).
        </p>
      </div>
    </footer>
  );
}
