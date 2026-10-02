import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BookOpen, CalendarDays, Compass, HandHeart, NotebookPen, Users, ShieldCheck, HeartHandshake, Sparkles, Ban } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { VerseOfTheDay } from "@/components/bible/verse-of-the-day";
import { getCurrentUser } from "@/lib/auth/dal";
import { DEFAULT_TRANSLATION } from "@/lib/bible/data";

export const metadata: Metadata = {
  title: "Bleibe – Bibel. Gebet. Gemeinschaft.",
  description:
    "Ein werbefreier Ort für Christen: Bibel lesen und verstehen, füreinander beten, echte Gemeinschaft finden – ohne Abo, ohne Tracking, ohne Druck.",
};

const FEATURES = [
  {
    icon: BookOpen,
    title: "Bibel lesen",
    text: "Sechs Übersetzungen, Parallelansicht, Querverweise und Volltextsuche. Markieren, notieren, merken.",
    href: "/bibel",
  },
  {
    icon: HandHeart,
    title: "Füreinander beten",
    text: "Teile, was dich bewegt. Andere beten mit – und du erfährst, wenn Gott antwortet.",
    href: "/gebet",
  },
  {
    icon: Users,
    title: "Gemeinschaft, die trägt",
    text: "Gruppen online oder vor Ort, Fragen, Zeugnisse, Gebetspartner. Keine Algorithmen, keine Werbung.",
    href: "/gemeinschaft",
  },
  {
    icon: Compass,
    title: "Lesepläne ohne Druck",
    text: "Von sieben Tagen bis zur ganzen Bibel. Verpasste Tage sind kein Drama – du machst einfach weiter.",
    href: "/leseplaene",
  },
  {
    icon: CalendarDays,
    title: "Treffen",
    text: "Bibelabende, Gebetstreffen, Spaziergänge. Online oder in deiner Stadt.",
    href: "/veranstaltungen",
  },
  {
    icon: NotebookPen,
    title: "Tagebuch & Lernverse",
    text: "Ein privater Ort zum Nachdenken, Danken und Beten. Verse auswendig lernen, in deinem Tempo.",
    href: "/tagebuch",
  },
];

const PRINCIPLES = [
  {
    icon: Ban,
    title: "Werbefrei und ohne Abo",
    text: "Alle Funktionen für alle. Kein Premium, keine Werbung, keine Spenden-Pop-ups.",
  },
  {
    icon: ShieldCheck,
    title: "Deine Daten gehören dir",
    text: "Kein Tracking, keine Weitergabe. Gebet und Glaube sind sensibel – wir behandeln sie so.",
  },
  {
    icon: HeartHandshake,
    title: "Menschen statt Feed",
    text: "Bleibe will dich nicht an den Bildschirm binden, sondern mit Gott und mit anderen verbinden.",
  },
  {
    icon: Sparkles,
    title: "Kein Druck, keine Streaks",
    text: "Keine Mahnungen, keine Schuldgefühle. Gnade ist das Prinzip – auch in der Software.",
  },
];

const MESSAGES: Record<string, { tone: "info" | "success"; text: string }> = {
  abgemeldet: { tone: "info", text: "Du bist abgemeldet. Bis bald!" },
  "konto-geloescht": { tone: "success", text: "Dein Konto wurde gelöscht. Danke, dass du dabei warst." },
};

export default async function HomePage(props: PageProps<"/">) {
  const searchParams = await props.searchParams;
  const nachricht = Array.isArray(searchParams.nachricht) ? searchParams.nachricht[0] : searchParams.nachricht;
  const notice = nachricht ? MESSAGES[nachricht] : undefined;
  const user = await getCurrentUser();
  const translation = user?.preferredTranslation ?? DEFAULT_TRANSLATION;

  return (
    <main>
      {notice ? (
        <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
          <Alert tone={notice.tone}>{notice.text}</Alert>
        </div>
      ) : null}

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl gap-10 px-4 pt-16 pb-12 sm:px-6 md:grid-cols-[1.2fr_1fr] md:items-center md:pt-24">
        <div>
          <p className="text-sm font-semibold tracking-wider text-accent uppercase">Bibel. Gebet. Gemeinschaft.</p>
          <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl">
            Bleib in seiner Nähe. Und nicht allein.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            Bleibe ist ein ruhiger, werbefreier Ort für Christen: die Bibel in Ruhe lesen, füreinander beten, Menschen
            finden, die den Weg mitgehen – online und vor Ort.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {user ? (
              <Link href="/start" className={buttonClasses("primary", "lg")}>
                Zu meinem Bereich
              </Link>
            ) : (
              <Link href="/registrieren" className={buttonClasses("primary", "lg")}>
                Kostenlos mitmachen
              </Link>
            )}
            <Link href="/bibel" className={buttonClasses("outline", "lg")}>
              Bibel öffnen
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Lesen geht ohne Konto. Für Gebet und Gemeinschaft brauchst du eins – kostenlos, in einer Minute.</p>
        </div>
        <Suspense fallback={<div className="h-56 animate-pulse rounded-card bg-surface-muted" />}>
          <VerseOfTheDay translationId={translation} />
        </Suspense>
      </section>

      {/* Principles */}
      <section aria-labelledby="prinzipien" className="border-y border-border bg-surface-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 id="prinzipien" className="text-2xl font-semibold tracking-tight">
            Was Bleibe anders macht
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Viele christliche Apps sind laut, teuer oder sammeln Daten. Bleibe ist bewusst das Gegenteil.
          </p>
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PRINCIPLES.map((p) => (
              <li key={p.title} className="rounded-card border border-border bg-surface p-5 shadow-soft">
                <p.icon className="size-6 text-primary" aria-hidden="true" />
                <h3 className="mt-3 font-semibold">{p.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{p.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Features */}
      <section aria-labelledby="funktionen" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 id="funktionen" className="text-2xl font-semibold tracking-tight">
          Alles an einem Ort
        </h2>
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <li key={f.title}>
              <Link
                href={f.href}
                className="flex h-full flex-col rounded-card border border-border bg-surface p-6 shadow-soft transition hover:border-primary/40 hover:shadow-md"
              >
                <f.icon className="size-7 text-primary" aria-hidden="true" />
                <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Quote */}
      <section className="mx-auto max-w-3xl px-4 pb-16 text-center sm:px-6">
        <blockquote className="scripture text-xl text-balance sm:text-2xl">
          „Bleibt in mir und ich in euch. Wie die Rebe keine Frucht bringen kann aus sich selbst, sie bleibe denn am
          Weinstock, also auch ihr nicht, ihr bleibet denn in mir.“
        </blockquote>
        <p className="mt-4 text-sm text-muted-foreground">
          <Link href="/bibel/john/15?v=4" className="text-primary hover:underline">
            Johannes 15,4
          </Link>{" "}
          · Luther 1912
        </p>
      </section>

      {/* Final CTA */}
      {!user ? (
        <section className="border-t border-border bg-primary text-primary-foreground">
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Komm dazu.</h2>
              <p className="mt-2 max-w-xl text-primary-foreground/80">
                Ein Konto in einer Minute. Keine Kreditkarte, keine Werbung, keine versteckten Stufen. Und jederzeit löschbar.
              </p>
            </div>
            <Link href="/registrieren" className={buttonClasses("accent", "lg")}>
              Konto erstellen
            </Link>
          </div>
        </section>
      ) : null}
    </main>
  );
}
