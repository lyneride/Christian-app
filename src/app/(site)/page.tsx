import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Ban, Check, HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { VerseOfTheDay } from "@/components/bible/verse-of-the-day";
import { getCurrentUser } from "@/lib/auth/dal";
import { DEFAULT_TRANSLATION } from "@/lib/bible/data";
import { Rebi, RebiBubble } from "@/components/rebi/rebi";
import { AreaTile } from "@/components/layout/area-card";
import { AREA_STYLE, type AreaKey } from "@/components/layout/areas";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Bleibe – Bibel. Gebet. Gemeinschaft.",
  description:
    "Ein werbefreier Ort für Christen: Bibel lesen und verstehen, füreinander beten, echte Gemeinschaft finden – ohne Abo, ohne Tracking, ohne Druck.",
};

/** The five areas of the app, as the landing page introduces them. */
const AREA_INTRO: { area: AreaKey; title: string; text: string; points: string[]; href: string }[] = [
  {
    area: "heute",
    title: "Heute",
    text: "Dein Tag auf einen Blick.",
    points: ["Tagesvers", "Dein Leseplan für heute", "Neue Anliegen und Treffen"],
    href: "/registrieren",
  },
  {
    area: "bibel",
    title: "Bibel",
    text: "In Ruhe lesen und verstehen.",
    points: ["Sechs Übersetzungen, Parallelansicht", "Markieren, notieren, merken", "Lesepläne – allein oder gemeinsam"],
    href: "/bibel",
  },
  {
    area: "gebet",
    title: "Gebet",
    text: "Füreinander da sein.",
    points: ["Anliegen teilen – auf Wunsch anonym", "Mitbeten mit einem Tipp", "Erfahren, wenn Gott antwortet"],
    href: "/gebet",
  },
  {
    area: "gemeinschaft",
    title: "Gemeinschaft",
    text: "Menschen, die den Weg mitgehen.",
    points: ["Gruppen online und vor Ort", "Gruppenchats", "Treffen und Zeugnisse"],
    href: "/gemeinschaft",
  },
  {
    area: "ich",
    title: "Ich",
    text: "Dein persönlicher Bereich.",
    points: ["Freunde per Link oder QR-Code", "Nachrichten", "Privates Tagebuch"],
    href: "/registrieren",
  },
];

const STEPS = [
  { title: "Konto erstellen", text: "Name, E-Mail, Passwort – in einer Minute." },
  { title: "Rebi zeigt dir alles", text: "Eine kurze Tour, und in jedem Bereich erklärt Rebi, was geht." },
  { title: "Loslegen", text: "Lesen, beten, Freunde einladen – in deinem Tempo." },
];

const PRINCIPLES = [
  {
    area: "gebet" as AreaKey,
    icon: Ban,
    title: "Werbefrei und ohne Abo",
    text: "Alle Funktionen für alle. Kein Premium, keine Werbung, keine Spenden-Pop-ups.",
  },
  {
    area: "bibel" as AreaKey,
    icon: ShieldCheck,
    title: "Deine Daten gehören dir",
    text: "Kein Tracking, keine Weitergabe. Gebet und Glaube sind sensibel – wir behandeln sie so.",
  },
  {
    area: "gemeinschaft" as AreaKey,
    icon: HeartHandshake,
    title: "Menschen statt Feed",
    text: "Bleibe will dich nicht an den Bildschirm binden, sondern mit Gott und mit anderen verbinden.",
  },
  {
    area: "heute" as AreaKey,
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
    <main className="overflow-x-clip">
      {notice ? (
        <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
          <Alert tone={notice.tone}>{notice.text}</Alert>
        </div>
      ) : null}

      {/* Hero */}
      <section className="relative">
        <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-area-heute-soft blur-2xl sm:size-96" />
        <div aria-hidden="true" className="pointer-events-none absolute top-64 -left-28 size-64 rounded-full bg-area-ich-soft blur-2xl" />
        <div className="relative mx-auto grid max-w-6xl gap-8 px-4 pt-6 pb-10 sm:px-6 md:grid-cols-[1.15fr_1fr] md:items-center md:gap-12 md:pt-16 md:pb-16">
          <div>
            <div className="flex items-end gap-1">
              <Rebi pose="wave" size={112} priority className="-ml-2 shrink-0" />
              <RebiBubble tail="left" className="mb-10 max-w-52">
                Hi, ich bin Rebi! Ich zeig dir alles.
              </RebiBubble>
            </div>
            <h1 className="mt-2 text-[40px] leading-[1.05] font-black text-balance sm:text-5xl md:text-6xl">
              Bleib in seiner Nähe. <span className="text-primary">Und nicht allein.</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">
              Bleibe ist ein werbefreier Ort für Christen: die Bibel in Ruhe lesen, füreinander beten, Menschen finden, die den Weg mitgehen
              – online und vor Ort.
            </p>
            <div className="mt-7 grid gap-3 sm:flex sm:flex-wrap">
              {user ? (
                <Link href="/start" className={buttonClasses("primary", "lg")}>
                  Zu „Heute“
                  <ArrowRight aria-hidden="true" />
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
            <p className="mt-4 text-sm text-muted-foreground">Lesen geht ohne Konto. Für Gebet und Gemeinschaft brauchst du eins – kostenlos.</p>
          </div>
          <Suspense fallback={<div className="h-56 animate-pulse rounded-card bg-surface-muted" />}>
            <VerseOfTheDay translationId={translation} />
          </Suspense>
        </div>
      </section>

      {/* The five areas */}
      <section aria-labelledby="bereiche" className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-16">
        <h2 id="bereiche" className="text-[28px] leading-tight font-black sm:text-4xl">
          Fünf Bereiche. Alles an einem Ort.
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          <span className="md:hidden">Unten in der Leiste</span>
          <span className="hidden md:inline">Links in der Leiste</span> – mit einem Tipp bist du überall.
        </p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {AREA_INTRO.map((a) => (
            <li key={a.area}>
              <Link
                href={a.href}
                className={cn(
                  "group flex h-full flex-col rounded-card border-2 border-transparent bg-surface p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-pop",
                )}
              >
                <div className="flex items-center gap-3 lg:flex-col lg:items-start">
                  <AreaTile area={a.area} size="lg" />
                  <div>
                    <h3 className="text-lg font-black">{a.title}</h3>
                    <p className="text-sm text-muted-foreground">{a.text}</p>
                  </div>
                </div>
                <ul className="mt-4 space-y-1.5">
                  {a.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-2 text-sm">
                      <Check aria-hidden="true" className={cn("mt-0.5 size-4 shrink-0", AREA_STYLE[a.area].text)} strokeWidth={3} />
                      {pt}
                    </li>
                  ))}
                </ul>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* How it works */}
      <section aria-labelledby="so-gehts" className="bg-surface">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[auto_1fr] md:items-center md:gap-14 md:py-16">
          <Rebi pose="point" size={150} className="mx-auto hidden md:block" />
          <div>
            <h2 id="so-gehts" className="text-[28px] leading-tight font-black sm:text-4xl">
              So einfach geht&apos;s
            </h2>
            <ol className="mt-6 grid gap-4 md:grid-cols-3">
              {STEPS.map((step, i) => (
                <li key={step.title} className="flex gap-4 rounded-card bg-background p-5 md:flex-col md:gap-3">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary font-display text-lg font-black text-primary-foreground shadow-[0_3px_0_var(--primary-press)]">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-black">{step.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section aria-labelledby="prinzipien" className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-16">
        <h2 id="prinzipien" className="text-[28px] leading-tight font-black sm:text-4xl">
          Was Bleibe anders macht
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">Viele christliche Apps sind laut, teuer oder sammeln Daten. Bleibe ist bewusst das Gegenteil.</p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PRINCIPLES.map((pr) => (
            <li key={pr.title} className="rounded-card bg-surface p-5 shadow-soft">
              <span className={cn("inline-flex size-11 items-center justify-center rounded-2xl", AREA_STYLE[pr.area].soft, AREA_STYLE[pr.area].text)}>
                <pr.icon className="size-5" aria-hidden="true" strokeWidth={2.4} />
              </span>
              <h3 className="mt-3 font-black">{pr.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{pr.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Quote */}
      <section className="mx-auto max-w-3xl px-4 pb-12 text-center sm:px-6 md:pb-16">
        <blockquote className="scripture text-xl text-balance sm:text-2xl">
          „Bleibt in mir und ich in euch. Wie die Rebe keine Frucht bringen kann aus sich selbst, sie bleibe denn am Weinstock, also auch ihr
          nicht, ihr bleibet denn in mir.“
        </blockquote>
        <p className="mt-4 text-sm text-muted-foreground">
          <Link href="/bibel/john/15?v=4" className="font-semibold text-primary hover:underline">
            Johannes 15,4
          </Link>{" "}
          · Luther 1912
        </p>
      </section>

      {/* Final CTA */}
      {!user ? (
        <section className="px-4 pb-10 sm:px-6 md:pb-16">
          <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-5 overflow-hidden rounded-[28px] bg-primary px-6 py-10 text-center text-primary-foreground md:flex-row md:px-12 md:text-left">
            <Rebi pose="celebrate" size={120} className="shrink-0" />
            <div className="flex-1">
              <h2 className="text-[28px] leading-tight font-black sm:text-4xl">Komm dazu!</h2>
              <p className="mt-2 max-w-xl text-primary-foreground/85">
                Ein Konto in einer Minute. Keine Kreditkarte, keine Werbung, keine versteckten Stufen. Jederzeit löschbar.
              </p>
            </div>
            <Link href="/registrieren" className={buttonClasses("accent", "lg", "w-full sm:w-auto")}>
              Konto erstellen
            </Link>
          </div>
        </section>
      ) : null}
    </main>
  );
}
