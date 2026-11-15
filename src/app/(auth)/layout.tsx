import type { ReactNode } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Rebi } from "@/components/rebi/rebi";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 sm:py-14">
      <header className="mb-2 flex flex-col items-center text-center">
        <Link href="/" className="inline-flex flex-col items-center rounded-2xl" aria-label="Bleibe – zur Startseite">
          <Rebi pose="wave" size={96} priority />
          <span className="-mt-1 font-display text-3xl font-black tracking-tight text-foreground">Bleibe</span>
        </Link>
        <p className="mt-1 text-sm font-semibold text-muted-foreground">Bibel. Gebet. Gemeinschaft.</p>
      </header>

      <main className="mt-4 w-full max-w-md">
        <Card className="p-6 shadow-pop sm:p-8">{children}</Card>
      </main>

      <footer className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <Link href="/" className="inline-flex min-h-8 items-center hover:text-foreground hover:underline">
          Zur Startseite
        </Link>
        <span aria-hidden="true">·</span>
        <Link href="/datenschutz" className="inline-flex min-h-8 items-center hover:text-foreground hover:underline">
          Datenschutz
        </Link>
        <span aria-hidden="true">·</span>
        <Link href="/impressum" className="inline-flex min-h-8 items-center hover:text-foreground hover:underline">
          Impressum
        </Link>
      </footer>
    </div>
  );
}
