import type { Metadata } from "next";
import Link from "next/link";
import { Search, Users } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { prisma } from "@/lib/db";
import { getFriendState, listFriends, listIncomingRequests, listOutgoingRequests, searchMembers } from "@/lib/friends/queries";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { AddFriendButton, CancelRequestButton, IncomingRequestButtons, RemoveFriendButton } from "@/components/friends/request-buttons";
import { formatRelative } from "@/lib/utils";

export const metadata: Metadata = { title: "Freunde" };

function Person({ user, children }: { user: { name: string; username: string; avatarUrl: string | null; location?: string | null }; children?: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3 py-3">
      <Avatar name={user.name} src={user.avatarUrl} size="md" />
      <div className="min-w-0 flex-1">
        <Link href={`/@${user.username}`} className="font-medium hover:underline">
          {user.name}
        </Link>
        <p className="truncate text-xs text-muted-foreground">
          @{user.username}
          {user.location ? ` · ${user.location}` : ""}
        </p>
      </div>
      {children}
    </li>
  );
}

export default async function FreundePage(props: PageProps<"/freunde">) {
  const user = await requireUser("/freunde");
  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === "string" ? searchParams.q : "";
  const [friends, incoming, outgoing, results] = await Promise.all([
    listFriends(user.id),
    listIncomingRequests(user.id),
    listOutgoingRequests(user.id),
    q ? searchMembers(user.id, q) : Promise.resolve([]),
  ]);
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
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Freunde</h1>
        <p className="mt-2 text-muted-foreground">
          Mit Freunden kannst du gemeinsam Lesepläne starten und seht gegenseitig, wo ihr gerade seid.
        </p>
      </header>

      <form method="get" className="mb-8 flex gap-2" role="search">
        <label htmlFor="q" className="sr-only">
          Mitglieder suchen
        </label>
        <Input id="q" name="q" defaultValue={q} placeholder="Name oder @benutzername" />
        <Button type="submit" variant="secondary">
          <Search aria-hidden="true" /> Suchen
        </Button>
      </form>

      {q ? (
        <section className="mb-10" aria-labelledby="ergebnisse">
          <h2 id="ergebnisse" className="font-semibold">
            Ergebnisse für „{q}“
          </h2>
          {results.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">Niemand gefunden. Vielleicht einen anderen Namen probieren?</p>
          ) : (
            <ul className="mt-2 divide-y divide-border">
              {results.map((r, i) => {
                const state = resultStates[i];
                return (
                  <Person key={r.id} user={r}>
                    {state.kind === "none" ? <AddFriendButton username={r.username} /> : null}
                    {state.kind === "sent" ? <Badge>Anfrage gesendet</Badge> : null}
                    {state.kind === "received" ? <IncomingRequestButtons id={state.friendshipId} /> : null}
                    {state.kind === "friends" ? <Badge variant="success">Befreundet</Badge> : null}
                  </Person>
                );
              })}
            </ul>
          )}
        </section>
      ) : null}

      {incoming.length > 0 ? (
        <section className="mb-10" aria-labelledby="anfragen">
          <h2 id="anfragen" className="font-semibold">
            Anfragen an dich ({incoming.length})
          </h2>
          <ul className="mt-2 divide-y divide-border">
            {incoming.map((r) => (
              <Person key={r.id} user={r.requester}>
                <IncomingRequestButtons id={r.id} />
              </Person>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="freunde">
        <h2 id="freunde" className="font-semibold">
          Deine Freunde ({friends.length})
        </h2>
        {friends.length === 0 ? (
          <EmptyState
            className="mt-3"
            icon={<Users />}
            title="Noch keine Freunde hier"
            description="Such oben nach Menschen, die du kennst, oder lerne jemanden in einer Gruppe kennen."
          />
        ) : (
          <ul className="mt-2 divide-y divide-border">
            {friends.map((f) => (
              <Person key={f.id} user={f}>
                <RemoveFriendButton id={friendshipIds.get(f.id) ?? ""} />
              </Person>
            ))}
          </ul>
        )}
      </section>

      {outgoing.length > 0 ? (
        <section className="mt-10" aria-labelledby="gesendet">
          <h2 id="gesendet" className="font-semibold">
            Gesendete Anfragen
          </h2>
          <ul className="mt-2 divide-y divide-border">
            {outgoing.map((r) => (
              <Person key={r.id} user={r.addressee}>
                <span className="text-xs text-muted-foreground">{formatRelative(r.createdAt)}</span>
                <CancelRequestButton id={r.id} />
              </Person>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
