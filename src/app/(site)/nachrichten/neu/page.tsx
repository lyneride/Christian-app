import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, User, Users } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { listFriends } from "@/lib/friends/queries";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { NewMessageForm } from "@/components/messages/new-message-form";
import { NewGroupChatForm } from "@/components/messages/new-group-chat-form";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Neue Nachricht",
  description: "Schreib einem Mitglied oder starte einen Gruppenchat mit deinen Freunden.",
};

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function NewMessagePage(props: PageProps<"/nachrichten/neu">) {
  const sp = await props.searchParams;
  const group = first(sp.art) === "gruppe";
  const an = (first(sp.an) ?? "").trim().replace(/^@/, "").slice(0, 30);
  const self = group ? "/nachrichten/neu?art=gruppe" : an ? `/nachrichten/neu?an=${encodeURIComponent(an)}` : "/nachrichten/neu";
  const user = await requireUser(self);
  const friends = group ? await listFriends(user.id) : [];

  const tabs = [
    { href: "/nachrichten/neu", label: "Eine Person", icon: User, active: !group },
    { href: "/nachrichten/neu?art=gruppe", label: "Gruppenchat", icon: Users, active: group },
  ];

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-5 sm:px-6 sm:py-8">
      <Link href="/nachrichten" className={buttonClasses("ghost", "sm", "-ml-3")}>
        <ArrowLeft aria-hidden="true" />
        Alle Nachrichten
      </Link>
      <h1 className="mt-4 text-[30px] leading-tight sm:text-4xl">{group ? "Neuer Gruppenchat" : "Neue Nachricht"}</h1>

      <nav aria-label="Art der Unterhaltung" className="mt-5 grid grid-cols-2 gap-1 rounded-full bg-surface-muted p-1">
        {tabs.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            aria-current={t.active ? "page" : undefined}
            className={cn(
              "inline-flex h-11 items-center justify-center gap-2 rounded-full font-display text-sm font-extrabold transition",
              t.active ? "bg-surface text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <t.icon aria-hidden="true" className="size-4" />
            {t.label}
          </Link>
        ))}
      </nav>

      <p className="mt-4 text-muted-foreground">
        {group
          ? "Gib dem Chat einen Namen und wähl aus, wer dabei sein soll. Alle Ausgewählten sehen alle Nachrichten."
          : "Gibt es schon eine Unterhaltung mit dieser Person, landet deine Nachricht dort."}
      </p>

      <div className="mt-6 rounded-card border border-border bg-surface p-5 shadow-soft sm:p-6">
        {!group ? (
          <NewMessageForm initialUsername={an || undefined} />
        ) : friends.length === 0 ? (
          <EmptyState
            mascot
            pose="wave"
            title="Erst Freunde, dann Gruppenchat"
            description="In einen Gruppenchat kannst du deine Freunde holen. Füge zuerst jemanden als Freund hinzu – über die Suche oder deinen Einladungslink."
            action={
              <Link href="/freunde" className={buttonClasses("primary", "md")}>
                Freunde finden
              </Link>
            }
          />
        ) : (
          <NewGroupChatForm friends={friends.map(({ id, name, username, avatarUrl }) => ({ id, name, username, avatarUrl }))} />
        )}
      </div>
    </main>
  );
}
