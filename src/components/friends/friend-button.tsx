"use client";

import { useState, useTransition } from "react";
import { Check, UserMinus, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FriendState } from "@/lib/friends/queries";
import { acceptFriendRequest, declineFriendRequest, removeFriendship, sendFriendRequest } from "@/lib/friends/actions";

export function FriendButton({ username, state }: { username: string; state: FriendState }) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const run = (fn: () => Promise<{ ok?: boolean; message?: string }>) =>
    start(async () => {
      const res = await fn();
      setMessage(res.message ?? null);
    });

  return (
    <div className="flex flex-wrap items-center gap-2">
      {state.kind === "none" ? (
        <Button variant="primary" loading={pending} onClick={() => run(() => sendFriendRequest(username))}>
          <UserPlus aria-hidden="true" /> Als Freund hinzufügen
        </Button>
      ) : null}
      {state.kind === "sent" ? (
        <Button variant="outline" loading={pending} onClick={() => run(() => removeFriendship(state.friendshipId))} title="Anfrage zurückziehen">
          <Check aria-hidden="true" /> Anfrage gesendet
        </Button>
      ) : null}
      {state.kind === "received" ? (
        <>
          <Button variant="primary" loading={pending} onClick={() => run(() => acceptFriendRequest(state.friendshipId))}>
            <Check aria-hidden="true" /> Anfrage annehmen
          </Button>
          <Button variant="ghost" loading={pending} onClick={() => run(() => declineFriendRequest(state.friendshipId))} aria-label="Anfrage ablehnen">
            <X aria-hidden="true" /> Ablehnen
          </Button>
        </>
      ) : null}
      {state.kind === "friends" ? (
        <Button
          variant="outline"
          loading={pending}
          onClick={() => {
            if (confirm("Freundschaft beenden?")) run(() => removeFriendship(state.friendshipId));
          }}
          title="Freundschaft beenden"
        >
          <UserMinus aria-hidden="true" /> Befreundet
        </Button>
      ) : null}
      {message ? (
        <span role="status" className="text-xs text-muted-foreground">
          {message}
        </span>
      ) : null}
    </div>
  );
}
