import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BookOpen, Compass, HandHeart, Users } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { VerseOfTheDay } from "@/components/bible/verse-of-the-day";
import { Alert } from "@/components/ui/alert";
import { buttonClasses } from "@/components/ui/button";

export const metadata: Metadata = { title: "Mein Bereich" };

const QUICK = [
  { href: "/bibel", label: "Weiterlesen", icon: BookOpen },
  { href: "/gebet", label: "Gebetswand", icon: HandHeart },
  { href: "/leseplaene/meine", label: "Meine Lesepläne", icon: Compass },
  { href: "/gemeinschaft", label: "Gemeinschaft", icon: Users },
];

function greeting(date = new Date()): string {
  const h = Number(new Intl.DateTimeFormat("de-DE", { hour: "numeric", hour12: false, timeZone: "Europe/Berlin" }).format(date));
  if (h < 5) return "Gute Nacht";
  if (h < 11) return "Guten Morgen";
  if (h < 18) return "Hallo";
  return "Guten Abend";
}

export default async function StartPage(props: PageProps<"/start">) {
  const user = await requireUser("/start");
  const searchParams = await props.searchParams;
  const willkommen = searchParams.willkommen === "1";
  const passwort = searchParams.passwort === "geaendert";
  const firstName = user.name.split(" ")[0];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      {willkommen ? (
        <Alert tone="success" title={`Willkommen, ${firstName}!`} className="mb-6">
          Schön, dass du da bist. Wir haben dir eine E-Mail zur Bestätigung deiner Adresse geschickt.
        </Alert>
      ) : null}
      {passwort ? (
        <Alert tone="success" className="mb-6">
          Dein Passwort wurde geändert.
        </Alert>
      ) : null}

      <header className="mb-8">
        <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
          {greeting()}, {firstName}.
        </h1>
        <p className="mt-2 text-muted-foreground">Nimm dir einen Moment. Hier ist, was heute auf dich wartet.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Suspense fallback={<div className="h-48 animate-pulse rounded-card bg-surface-muted" />}>
            <VerseOfTheDay translationId={user.preferredTranslation} tParam={user.preferredTranslation} />
          </Suspense>
          <section aria-labelledby="schnell" className="rounded-card border border-border bg-surface p-5 shadow-soft">
            <h2 id="schnell" className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
              Schnell dorthin
            </h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {QUICK.map((q) => (
                <li key={q.href}>
                  <Link href={q.href} className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm font-medium hover:bg-surface-muted">
                    <q.icon className="size-5 text-primary" aria-hidden="true" />
                    {q.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
        <aside className="space-y-6">
          <section className="rounded-card border border-border bg-surface p-5 shadow-soft">
            <h2 className="font-semibold">Dein Profil</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              @{user.username}
              {user.location ? ` · ${user.location}` : ""}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={`/@${user.username}`} className={buttonClasses("outline", "sm")}>
                Profil ansehen
              </Link>
              <Link href="/einstellungen/profil" className={buttonClasses("ghost", "sm")}>
                Bearbeiten
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
