import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Bell, Heart, MessageCircle } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { VerseOfTheDay } from "@/components/bible/verse-of-the-day";
import { TodayReadings } from "@/components/plans/today-readings";
import { UpcomingEvents } from "@/components/events/upcoming-events";
import { Alert } from "@/components/ui/alert";
import { buttonClasses } from "@/components/ui/button";
import { AreaCard, AreaTile } from "@/components/layout/area-card";
import { AREAS, AREA_STYLE } from "@/components/layout/areas";
import { Rebi, RebiBubble } from "@/components/rebi/rebi";
import { Badge } from "@/components/ui/badge";
import { listPrayerRequests } from "@/lib/prayer/queries";
import { unreadCount } from "@/lib/notifications";
import { totalUnreadMessages } from "@/lib/messages/queries";
import { cn, formatRelative, truncate } from "@/lib/utils";

export const metadata: Metadata = { title: "Heute" };

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
    <AreaCard area="gebet" title={total > 0 ? `Füreinander beten · ${total}` : "Füreinander beten"} href="/gebet" tour="home-prayers">
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Gerade gibt es keine offenen Anliegen. Teile deins, wenn dich etwas bewegt.</p>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((p) => (
            <li key={p.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0 flex-1">
                <Link href={`/gebet/${p.id}`} className="block font-display font-extrabold hover:underline">
                  {p.title}
                </Link>
                <p className="mt-0.5 text-sm text-muted-foreground">{truncate(p.body, 90)}</p>
                <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{p.isAnonymous ? "Anonym" : p.author.name}</span>
                  <span aria-hidden="true">·</span>
                  <span>{formatRelative(p.createdAt)}</span>
                  {p.prayedToday ? <Badge variant="success">Heute gebetet</Badge> : null}
                </p>
              </div>
              <Link
                href={`/gebet/${p.id}`}
                aria-label={`Für „${p.title}“ beten`}
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-area-gebet-soft text-area-gebet"
              >
                <Heart className="size-5" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AreaCard>
  );
}

async function Inbox({ userId }: { userId: string }) {
  const [notifications, messages] = await Promise.all([unreadCount(userId), totalUnreadMessages(userId)]);
  if (notifications === 0 && messages === 0) return null;
  return (
    <section className="rounded-card bg-primary-soft p-5">
      <h2 className="text-[17px]">Neu für dich</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {notifications > 0 ? (
          <li>
            <Link href="/benachrichtigungen" className="inline-flex items-center gap-2 font-display font-extrabold hover:underline">
              <Bell className="size-4" aria-hidden="true" />
              {notifications === 1 ? "1 neue Benachrichtigung" : `${notifications} neue Benachrichtigungen`}
            </Link>
          </li>
        ) : null}
        {messages > 0 ? (
          <li>
            <Link href="/nachrichten" className="inline-flex items-center gap-2 font-display font-extrabold hover:underline">
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
    <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-8">
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

      <header className="mb-5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[30px] leading-tight sm:text-4xl">
            {greeting()}, {firstName}!
          </h1>
          <p className="mt-1 text-[15px] text-muted-foreground">Schön, dass du da bist. Das wartet heute auf dich.</p>
        </div>
        <Rebi pose="wave" size={84} className="-my-2 sm:hidden" priority />
        <div className="hidden items-center gap-1 sm:flex">
          <RebiBubble tail="right">Schön, dass du da bist!</RebiBubble>
          <Rebi pose="wave" size={110} priority />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-6">
        <div className="space-y-4 lg:space-y-6">
          <div data-tour="home-verse">
            <Suspense fallback={<Skeleton h="h-48" />}>
              <VerseOfTheDay translationId={user.preferredTranslation} tParam={user.preferredTranslation} />
            </Suspense>
          </div>

          <AreaCard area="bibel" title="Dein Leseplan heute" href="/leseplaene" linkLabel="Pläne" tour="home-plan">
            <Suspense fallback={<Skeleton h="h-24" />}>
              <TodayReadings
                userId={user.id}
                translation={user.preferredTranslation}
                fallback={
                  <div className="flex items-center gap-3">
                    <Rebi pose="read" size={72} />
                    <div>
                      <p className="text-sm text-muted-foreground">Noch kein Leseplan. Such dir einen aus – von 7 Tagen bis zur ganzen Bibel, ohne Druck.</p>
                      <Link href="/leseplaene" className={`${buttonClasses("primary", "sm")} mt-2`}>
                        Plan aussuchen
                      </Link>
                    </div>
                  </div>
                }
              />
            </Suspense>
          </AreaCard>

          <Suspense fallback={<Skeleton />}>
            <OpenPrayers viewer={{ id: user.id, role: user.role }} />
          </Suspense>
        </div>

        <aside className="space-y-4 lg:space-y-6">
          <Suspense fallback={null}>
            <Inbox userId={user.id} />
          </Suspense>

          <div data-tour="home-events" className="rounded-card bg-surface p-4 shadow-soft sm:p-5">
            <Suspense fallback={<Skeleton h="h-24" />}>
              <UpcomingEvents userId={user.id} limit={3} />
            </Suspense>
          </div>

          <section aria-labelledby="schnell">
            <h2 id="schnell" className="sr-only">
              Schnell dorthin
            </h2>
            <ul className="grid grid-cols-2 gap-3">
              {AREAS.filter((a) => a.key !== "heute").map((a) => (
                <li key={a.key}>
                  <Link href={a.href} className={cn("flex flex-col gap-2 rounded-card p-4 transition hover:-translate-y-0.5", AREA_STYLE[a.key].soft)}>
                    <AreaTile area={a.key} className="bg-surface" />
                    <span className="font-display text-[16px] font-black">{a.label}</span>
                    <span className="text-xs text-foreground/75">{a.purpose}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </main>
  );
}
