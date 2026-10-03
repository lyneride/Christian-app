"use client";

import { useTransition } from "react";
import { Check, X } from "lucide-react";
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

export function RemoveFriendButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      size="sm"
      variant="ghost"
      loading={pending}
      onClick={() => {
        if (confirm("Freundschaft beenden?")) start(async () => void (await removeFriendship(id)));
      }}
    >
      Entfernen
    </Button>
  );
}

export function AddFriendButton({ username }: { username: string }) {
  const [pending, start] = useTransition();
  return (
    <Button size="sm" variant="outline" loading={pending} onClick={() => start(async () => void (await sendFriendRequest(username)))}>
      Hinzufügen
    </Button>
  );
}
