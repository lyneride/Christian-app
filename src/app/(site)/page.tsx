import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";

// Placeholder landing page – replaced by the real one once the product concept is final.
export default function HomePage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">Bleibe</h1>
      <p className="mt-4 text-lg text-muted-foreground">Bibel. Gebet. Gemeinschaft.</p>
      <div className="mt-8 flex gap-3">
        <Link href="/bibel" className={buttonClasses("primary", "lg")}>
          Bibel öffnen
        </Link>
        <Link href="/registrieren" className={buttonClasses("outline", "lg")}>
          Mitmachen
        </Link>
      </div>
    </main>
  );
}
