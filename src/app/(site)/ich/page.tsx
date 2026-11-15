import type { Metadata } from "next";
import Link from "next/link";
import { Bell, ChevronRight, MessageCircle, NotebookPen, Settings, Shield, UserPlus, Users } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { Avatar } from "@/components/ui/avatar";
import { ButtonLink } from "@/components/ui/button";
import { LogoutButton } from "@/components/auth/logout-button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Rebi } from "@/components/rebi/rebi";
import { TourButtons } from "@/components/tour/tour-buttons";
import { unreadCount } from "@/lib/notifications";
import { totalUnreadMessages } from "@/lib/messages/queries";
import { countIncomingRequests, listFriends } from "@/lib/friends/queries";

export const metadata: Metadata = { title: "Ich" };

function Tile({
  href,
  icon: Icon,
  title,
  text,
  badge,
  tour,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  text: string;
  badge?: number;
  tour?: string;
}) {
  return (
    <Link
      href={href}
      data-tour={tour}
      className="group flex items-center gap-3 rounded-card bg-surface p-4 shadow-soft transition hover:-translate-y-0.5"
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-area-ich-soft text-area-ich">
        <Icon className="size-6" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 font-display text-[17px] font-black">
          {title}
          {badge ? (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-area-gebet px-1.5 text-[11px] text-[#2b2340]">
              {badge > 9 ? "9+" : badge}
            </span>
          ) : null}
        </span>
        <span className="block text-sm text-muted-foreground">{text}</span>
      </span>
      <ChevronRight className="size-5 text-muted-foreground transition group-hover:translate-x-0.5" aria-hidden="true" />
    </Link>
  );
}

export default async function IchPage() {
  const user = await requireUser("/ich");
  const [notifications, messages, requests, friends] = await Promise.all([
    unreadCount(user.id),
    totalUnreadMessages(user.id),
    countIncomingRequests(user.id),
    listFriends(user.id),
  ]);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
      <section className="relative overflow-hidden rounded-[28px] bg-area-ich-soft p-5 sm:p-7" data-tour="ich-profil">
        <div className="flex items-center gap-4">
          <Avatar name={user.name} src={user.avatarUrl} size="lg" className="ring-4 ring-surface" />
          <div className="min-w-0">
            <h1 className="truncate text-2xl sm:text-3xl">{user.name}</h1>
            <p className="truncate text-sm font-semibold text-muted-foreground">
              @{user.username}
              {user.location ? ` · ${user.location}` : ""}
            </p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <ButtonLink href={`/@${user.username}`} variant="outline" size="sm">
            Profil ansehen
          </ButtonLink>
          <ButtonLink href="/einstellungen/profil" variant="primary" size="sm">
            Profil bearbeiten
          </ButtonLink>
        </div>
      </section>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Tile
          href="/freunde"
          icon={Users}
          title="Freunde"
          text={friends.length === 1 ? "1 Freund" : `${friends.length} Freunde`}
          badge={requests}
          tour="ich-freunde"
        />
        <Tile href="/nachrichten" icon={MessageCircle} title="Nachrichten" text="Einzel- und Gruppenchats" badge={messages} tour="ich-nachrichten" />
        <Tile href="/tagebuch" icon={NotebookPen} title="Tagebuch" text="Nur für dich" tour="ich-tagebuch" />
        <Tile href="/benachrichtigungen" icon={Bell} title="Benachrichtigungen" text="Alles Neue für dich" badge={notifications} tour="ich-benachrichtigungen" />
        <Tile href="/einstellungen/profil" icon={Settings} title="Einstellungen" text="Profil, Konto, Daten" tour="ich-einstellungen" />
        <Tile href="/freunde#einladen" icon={UserPlus} title="Freunde einladen" text="Mit Link oder QR-Code" />
        {user.role !== "USER" ? <Tile href="/admin" icon={Shield} title="Moderation" text="Meldungen und Mitglieder" /> : null}
      </div>

      <section className="mt-5 rounded-card bg-surface p-5 shadow-soft">
        <h2 className="text-lg">Darstellung</h2>
        <p className="mt-1 text-sm text-muted-foreground">Hell, dunkel oder wie dein Gerät.</p>
        <div className="mt-3">
          <ThemeToggle showLabel />
        </div>
      </section>

      <section className="mt-5 flex items-center gap-4 rounded-card bg-primary-soft p-5">
        <Rebi pose="point" size={84} />
        <div className="min-w-0 flex-1">
          <h2 className="text-lg">Hilfe von Rebi</h2>
          <p className="mt-1 text-sm text-muted-foreground">Lass dir Bleibe nochmal zeigen – alles oder nur einen Bereich.</p>
          <div className="mt-3">
            <TourButtons />
          </div>
        </div>
      </section>

      <div className="mt-6 flex justify-center">
        <LogoutButton variant="outline" />
      </div>
    </main>
  );
}
