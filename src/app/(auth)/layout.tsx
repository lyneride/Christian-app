import type { ReactNode } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";

/** The Bleibe mark (open book with a small light); follows `currentColor`. */
function BleibeMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      <rect width="64" height="64" rx="14" fill="currentColor" opacity="0.08" />
      <path
        d="M32 12c-7 0-11 4-12 9v23c0 1.2 1.3 2 2.4 1.4C25 44 28.4 43 32 43s7 1 9.6 2.4c1.1.6 2.4-.2 2.4-1.4V21c-1-5-5-9-12-9z"
        fill="currentColor"
      />
      <path d="M32 12v31" stroke="var(--surface)" strokeWidth="2.2" strokeLinecap="round" opacity="0.9" />
      <circle cx="32" cy="26" r="2.6" fill="var(--accent)" />
    </svg>
  );
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:py-16">
      <header className="mb-6 flex flex-col items-center text-center">
        <Link
          href="/"
          className="text-primary inline-flex items-center gap-2.5 rounded-xl"
          aria-label="Bleibe – zur Startseite"
        >
          <BleibeMark className="size-10" />
          <span className="text-foreground font-serif text-3xl font-semibold tracking-tight">Bleibe</span>
        </Link>
        <p className="text-muted-foreground mt-1.5 text-sm">Bibel. Gebet. Gemeinschaft.</p>
      </header>

      <main className="w-full max-w-md">
        <Card className="p-6 sm:p-8">{children}</Card>
      </main>

      <footer className="text-muted-foreground mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs">
        <Link href="/" className="hover:text-foreground hover:underline">
          Zur Startseite
        </Link>
        <span aria-hidden="true">·</span>
        <Link href="/datenschutz" className="hover:text-foreground hover:underline">
          Datenschutz
        </Link>
        <span aria-hidden="true">·</span>
        <Link href="/impressum" className="hover:text-foreground hover:underline">
          Impressum
        </Link>
      </footer>
    </div>
  );
}
