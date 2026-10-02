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
  {
    title: "Über Bleibe",
    links: [
      { href: "/ueber", label: "Warum Bleibe?" },
      { href: "/hilfe", label: "Hilfe" },
      { href: "/datenschutz", label: "Datenschutz" },
      { href: "/impressum", label: "Impressum" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-surface-muted/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-semibold">
            <Logo className="size-7 text-primary" />
            Bleibe
          </div>
          <p className="max-w-xs text-sm text-muted-foreground">
            Werbefrei, ohne Tracking, ohne Abo. Ein Ort, um in Gottes Gegenwart zu bleiben und einander zu tragen.
          </p>
          <p className="font-serif text-sm text-muted-foreground italic">„Bleibt in mir und ich in euch.“ – Johannes 15,4</p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h2 className="text-sm font-semibold">{col.title}</h2>
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
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted-foreground sm:px-6">
          Bibeltexte: Luther 1912, Elberfelder 1905 (gemeinfrei), Schlachter 1951 (© Genfer Bibelgesellschaft, nicht-kommerziell), BSB, KJV.
          Querverweise: OpenBible.info (CC-BY).
        </p>
      </div>
    </footer>
  );
}
