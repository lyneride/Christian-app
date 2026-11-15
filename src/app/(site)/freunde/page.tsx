import type { Metadata } from "next";
import Link from "next/link";
import QRCode from "qrcode";
import { MessageCircle, Search, Users } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { prisma } from "@/lib/db";
import { getFriendState, listFriends, listIncomingRequests, listOutgoingRequests, searchMembers } from "@/lib/friends/queries";
import { getOrCreateInviteCode, inviteUrl, suggestFriends } from "@/lib/friends/invites";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button, buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Rebi } from "@/components/rebi/rebi";
import { AddFriendButton, CancelRequestButton, IncomingRequestButtons, RemoveFriendButton } from "@/components/friends/request-buttons";
import { InviteShare } from "@/components/friends/invite-share";
import { cn, formatRelative, pluralize } from "@/lib/utils";

export const metadata: Metadata = { title: "Freunde" };

type PersonUser = { name: string; username: string; avatarUrl: string | null; location?: string | null };

function Person({ user, note, children }: { user: PersonUser; note?: string; children?: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <Avatar name={user.name} src={user.avatarUrl} size="md" />
      <div className="min-w-0 flex-1">
        <Link href={`/@${user.username}`} className="block truncate font-semibold hover:underline">
          {user.name}
        </Link>
        <p className="truncate text-xs text-muted-foreground">
          {note ?? `@${user.username}${user.location ? ` · ${user.location}` : ""}`}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">{children}</div>
    </li>
  );
}

function Section({
  id,
  title,
  action,
  tour,
  tone = "plain",
  children,
}: {
  id: string;
  title: string;
  action?: React.ReactNode;
  tour?: string;
  tone?: "plain" | "highlight";
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-titel`} data-tour={tour} className="scroll-mt-24">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 id={`${id}-titel`} className="text-lg font-extrabold">
          {title}
        </h2>
        {action}
      </div>
      <div
        className={cn(
          "overflow-hidden rounded-card border shadow-soft",
          tone === "highlight" ? "border-area-ich/40 bg-area-ich-soft" : "border-border bg-surface",
        )}
      >
        {children}
      </div>
    </section>
  );
}

export default async function FreundePage(props: PageProps<"/freunde">) {
  const user = await requireUser("/freunde");
  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === "string" ? searchParams.q.slice(0, 60) : "";
  const [friends, incoming, outgoing, results, suggestions, code] = await Promise.all([
    listFriends(user.id),
    listIncomingRequests(user.id),
    listOutgoingRequests(user.id),
    q ? searchMembers(user.id, q) : Promise.resolve([]),
    suggestFriends(user.id),
    getOrCreateInviteCode(user.id),
  ]);
  const url = inviteUrl(code);
  const qrSvg = await QRCode.toString(url, {
    type: "svg",
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#2b2340", light: "#ffffff" },
  });

  const friendshipIds = new Map<string, string>();
  if (friends.length) {
    const rows = await prisma.friendship.findMany({
      where: { status: "ACCEPTED", OR: [{ requesterId: user.id }, { addresseeId: user.id }] },
      select: { id: true, requesterId: true, addresseeId: true },
    });
    for (const r of rows) friendshipIds.set(r.requesterId === user.id ? r.addresseeId : r.requesterId, r.id);
  }
  const resultStates = await Promise.all(results.map((r) => getFriendState(user.id, r.id)));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6 sm:py-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[30px] leading-tight sm:text-4xl">Freunde</h1>
          <p className="mt-2 text-muted-foreground">Mit Freunden lest ihr gemeinsam, betet füreinander und schreibt im Gruppenchat.</p>
        </div>
        <Rebi pose="heart" size={72} className="shrink-0" />
      </header>

      <div className="mt-6 space-y-8">
        {incoming.length > 0 ? (
          <Section id="anfragen" title={`Anfragen an dich (${incoming.length})`} tone="highlight">
            <ul className="divide-y divide-area-ich/20">
              {incoming.map((r) => (
                <Person key={r.id} user={r.requester} note={`möchte mit dir befreundet sein · ${formatRelative(r.createdAt)}`}>
                  <IncomingRequestButtons id={r.id} />
                </Person>
              ))}
            </ul>
          </Section>
        ) : null}

        <Section id="einladen" title="Freunde einladen" tour="friends-invite">
          <div className="p-4 sm:p-5">
            <p className="mb-4 text-sm text-muted-foreground">
              Schick deinen Link per WhatsApp & Co. oder lass den QR-Code scannen. Wer ihn öffnet, ist sofort mit dir befreundet – auch wer
              sich erst noch anmeldet.
            </p>
            <InviteShare url={url} qrSvg={qrSvg} />
          </div>
        </Section>

        <Section id="suchen" title="Mitglieder suchen" tour="friends-search">
          <form method="get" action="/freunde#suchen" className="flex gap-2 p-4" role="search">
            <label htmlFor="q" className="sr-only">
              Mitglieder suchen
            </label>
            <Input id="q" name="q" type="search" defaultValue={q} placeholder="Name oder @benutzername" className="min-w-0" />
            <Button type="submit" variant="secondary" aria-label="Suchen" className="shrink-0">
              <Search aria-hidden="true" />
              <span className="hidden sm:inline">Suchen</span>
            </Button>
          </form>
          {q ? (
            results.length === 0 ? (
              <p className="border-t border-border px-4 py-4 text-sm text-muted-foreground">
                Niemand gefunden für „{q}“. Vielleicht ein anderer Name – oder schick deinen Einladungslink.
              </p>
            ) : (
              <ul className="divide-y divide-border border-t border-border" aria-label={`Ergebnisse für ${q}`}>
                {results.map((r, i) => {
                  const state = resultStates[i];
                  return (
                    <Person key={r.id} user={r}>
                      {state.kind === "none" ? <AddFriendButton username={r.username} /> : null}
                      {state.kind === "sent" ? <Badge>Angefragt</Badge> : null}
                      {state.kind === "received" ? <IncomingRequestButtons id={state.friendshipId} /> : null}
                      {state.kind === "friends" ? <Badge variant="success">Befreundet</Badge> : null}
                    </Person>
                  );
                })}
              </ul>
            )
          ) : null}
        </Section>

        {suggestions.length > 0 ? (
          <Section id="vorschlaege" title="Kennst du sie?" tour="friends-suggestions">
            <ul className="divide-y divide-border">
              {suggestions.map((s) => (
                <Person key={s.id} user={s} note={`${pluralize(s.sharedGroups, "gemeinsame Gruppe", "gemeinsame Gruppen")}`}>
                  <AddFriendButton username={s.username} />
                </Person>
              ))}
            </ul>
          </Section>
        ) : null}

        <Section
          id="freunde"
          title={`Deine Freunde (${friends.length})`}
          action={
            friends.length > 0 ? (
              <Link href="/nachrichten/neu?art=gruppe" className={buttonClasses("outline", "sm")}>
                <Users aria-hidden="true" />
                Gruppenchat
              </Link>
            ) : null
          }
        >
          {friends.length === 0 ? (
            <EmptyState
              className="shadow-none"
              pose="wave"
              title="Noch keine Freunde hier"
              description="Teile oben deinen Einladungslink oder such nach Menschen, die du kennst."
            />
          ) : (
            <ul className="divide-y divide-border">
              {friends.map((f) => (
                <Person key={f.id} user={f}>
                  <Link
                    href={`/nachrichten/neu?an=${encodeURIComponent(f.username)}`}
                    className={buttonClasses("ghost", "icon", "text-primary")}
                    aria-label={`${f.name} eine Nachricht schreiben`}
                    title="Nachricht schreiben"
                  >
                    <MessageCircle aria-hidden="true" />
                  </Link>
                  <RemoveFriendButton id={friendshipIds.get(f.id) ?? ""} name={f.name} />
                </Person>
              ))}
            </ul>
          )}
        </Section>

        {outgoing.length > 0 ? (
          <Section id="gesendet" title="Gesendete Anfragen">
            <ul className="divide-y divide-border">
              {outgoing.map((r) => (
                <Person key={r.id} user={r.addressee} note={`angefragt ${formatRelative(r.createdAt)}`}>
                  <CancelRequestButton id={r.id} />
                </Person>
              ))}
            </ul>
          </Section>
        ) : null}
      </div>
    </main>
  );
}
