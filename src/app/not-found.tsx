import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Diese Seite gibt es nicht.</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        Vielleicht wurde sie verschoben oder der Link ist nicht mehr gültig.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className={buttonClasses("primary")}>
          Zur Startseite
        </Link>
        <Link href="/bibel" className={buttonClasses("outline")}>
          Bibel öffnen
        </Link>
      </div>
    </main>
  );
}
