import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Bell, BookOpen, Compass, HandHeart, MessageCircle, Users } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { VerseOfTheDay } from "@/components/bible/verse-of-the-day";
import { TodayReadings } from "@/components/plans/today-readings";
import { Alert } from "@/components/ui/alert";
import { buttonClasses } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listPrayerRequests } from "@/lib/prayer/queries";
import { unreadCount } from "@/lib/notifications";
import { totalUnreadMessages } from "@/lib/messages/queries";
import { formatRelative, truncate } from "@/lib/utils";

export const metadata: Metadata = { title: "Mein Bereich" };

const QUICK = [
  { href: "/bibel", label: "Weiterlesen", icon: BookOpen },
  { href: "/gebet", label: "Gebetswand", icon: HandHeart },
  { href: "/leseplaene", label: "Lesepläne", icon: Compass },
  { href: "/gemeinschaft", label: "Gemeinschaft", icon: Users },
];

function greeting(date = new Date()): string {
  const h = Number(new Intl.DateTimeFormat("de-DE", { hour: "numeric", hour12: false, timeZone: "Europe/Berlin" }).format(date));
  if (h < 5) return "Gute Nacht";
  if (h < 11) return "Guten Morgen";
  if (h < 18) return "Hallo";
  return "Guten Abend";
}

async function OpenPrayers({ viewer }: { viewer: { id: string; role: "USER" | "MODERATOR" | "ADMIN" } }) {
  const { items, total } = await listPrayerRequests({
    viewer,
    filter: "offen",
    page: { page: 1, perPage: 4, skip: 0, take: 4 },
  });
  return (
    <section aria-labelledby="gebet-heute" className="rounded-card border border-border bg-surface p-5 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <h2 id="gebet-heute" className="font-semibold">
          Füreinander beten
        </h2>
        <Link href="/gebet" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          Alle {total > 0 ? `(${total})` : ""} <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Gerade gibt es keine offenen Anliegen. Teile deins, wenn dich etwas bewegt.</p>
      ) : (
        <ul className="mt-3 divide-y divide-border">
          {items.map((p) => (
            <li key={p.id} className="py-3">
              <Link href={`/gebet/${p.id}`} className="block hover:underline">
                <span className="font-medium">{p.title}</span>
              </Link>
              <p className="mt-0.5 text-sm text-muted-foreground">{truncate(p.body, 110)}</p>
              <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <span>{p.isAnonymous ? "Anonym" : p.author.name}</span>
                <span>·</span>
                <span>{formatRelative(p.createdAt)}</span>
                {p.prayedToday ? <Badge variant="success">Heute gebetet</Badge> : null}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

async function Inbox({ userId }: { userId: string }) {
  const [notifications, messages] = await Promise.all([unreadCount(userId), totalUnreadMessages(userId)]);
  if (notifications === 0 && messages === 0) return null;
  return (
    <section className="rounded-card border border-border bg-primary-soft p-5">
      <h2 className="font-semibold">Für dich</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {notifications > 0 ? (
          <li>
            <Link href="/benachrichtigungen" className="inline-flex items-center gap-2 font-medium text-primary hover:underline">
              <Bell className="size-4" aria-hidden="true" />
              {notifications === 1 ? "1 neue Benachrichtigung" : `${notifications} neue Benachrichtigungen`}
            </Link>
          </li>
        ) : null}
        {messages > 0 ? (
          <li>
            <Link href="/nachrichten" className="inline-flex items-center gap-2 font-medium text-primary hover:underline">
              <MessageCircle className="size-4" aria-hidden="true" />
              {messages === 1 ? "1 ungelesene Nachricht" : `${messages} ungelesene Nachrichten`}
            </Link>
          </li>
        ) : null}
      </ul>
    </section>
  );
}

function Skeleton({ h = "h-32" }: { h?: string }) {
  return <div className={`${h} animate-pulse rounded-card bg-surface-muted`} aria-hidden="true" />;
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
          Schön, dass du da bist. Wir haben dir eine E-Mail zur Bestätigung deiner Adresse geschickt. Ein guter erster Schritt:{" "}
          <Link href="/leseplaene" className="underline">
            einen Leseplan aussuchen
          </Link>{" "}
          oder{" "}
          <Link href="/gruppen" className="underline">
            eine Gruppe finden
          </Link>
          .
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
          <Suspense fallback={<Skeleton h="h-48" />}>
            <VerseOfTheDay translationId={user.preferredTranslation} tParam={user.preferredTranslation} />
          </Suspense>

          <Suspense fallback={<Skeleton />}>
            <TodayReadings
              userId={user.id}
              translation={user.preferredTranslation}
              fallback={
                <section className="rounded-card border border-dashed border-border p-5">
                  <h2 className="font-semibold">Heute lesen</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Du hast noch keinen Leseplan. Such dir einen aus – von sieben Tagen bis zur ganzen Bibel, ohne Druck.
                  </p>
                  <Link href="/leseplaene" className={`${buttonClasses("outline", "sm")} mt-3`}>
                    Pläne entdecken
                  </Link>
                </section>
              }
            />
          </Suspense>

          <Suspense fallback={<Skeleton />}>
            <OpenPrayers viewer={{ id: user.id, role: user.role }} />
          </Suspense>
        </div>

        <aside className="space-y-6">
          <Suspense fallback={null}>
            <Inbox userId={user.id} />
          </Suspense>

          <section aria-labelledby="schnell" className="rounded-card border border-border bg-surface p-5 shadow-soft">
            <h2 id="schnell" className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
              Schnell dorthin
            </h2>
            <ul className="mt-3 grid gap-2">
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
