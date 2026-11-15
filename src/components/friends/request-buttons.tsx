"use client";

import { useTransition } from "react";
import { Check, UserMinus, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { acceptFriendRequest, declineFriendRequest, removeFriendship, sendFriendRequest } from "@/lib/friends/actions";

export function IncomingRequestButtons({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <div className="flex gap-2">
      <Button size="sm" loading={pending} onClick={() => start(async () => void (await acceptFriendRequest(id)))}>
        <Check aria-hidden="true" /> Annehmen
      </Button>
      <Button size="sm" variant="ghost" loading={pending} onClick={() => start(async () => void (await declineFriendRequest(id)))}>
        <X aria-hidden="true" /> Ablehnen
      </Button>
    </div>
  );
}

export function CancelRequestButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <Button size="sm" variant="ghost" loading={pending} onClick={() => start(async () => void (await removeFriendship(id)))}>
      Zurückziehen
    </Button>
  );
}

export function RemoveFriendButton({ id, name }: { id: string; name?: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      size="icon"
      variant="ghost"
      loading={pending}
      aria-label={name ? `Freundschaft mit ${name} beenden` : "Freundschaft beenden"}
      title="Freundschaft beenden"
      className="text-muted-foreground"
      onClick={() => {
        if (confirm("Freundschaft beenden?")) start(async () => void (await removeFriendship(id)));
      }}
    >
      {pending ? null : <UserMinus aria-hidden="true" />}
    </Button>
  );
}

export function AddFriendButton({ username }: { username: string }) {
  const [pending, start] = useTransition();
  return (
    <Button size="sm" variant="outline" loading={pending} onClick={() => start(async () => void (await sendFriendRequest(username)))}>
      {pending ? null : <UserPlus aria-hidden="true" />}
      Hinzufügen
    </Button>
  );
}
