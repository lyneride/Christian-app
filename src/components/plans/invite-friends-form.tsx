"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { initialActionState, type ActionState } from "@/lib/action-state";
import { inviteFriendsToPlanGroup } from "@/app/(site)/leseplaene/gemeinsam/actions";

export function InviteFriendsForm({ id, friends }: { id: string; friends: { id: string; name: string; username: string; avatarUrl: string | null }[] }) {
  const [state, action, pending] = useActionState(
    async (_prev: ActionState, formData: FormData) => inviteFriendsToPlanGroup(id, formData),
    initialActionState,
  );
  if (friends.length === 0) return <p className="text-sm text-muted-foreground">Alle deine Freunde sind schon eingeladen.</p>;
  return (
    <form action={action} className="space-y-3">
      <ul className="grid gap-2 sm:grid-cols-2">
        {friends.map((f) => (
          <li key={f.id}>
            <label className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm hover:bg-surface-muted">
              <Checkbox name="friends" value={f.id} />
              <Avatar name={f.name} src={f.avatarUrl} size="xs" />
              <span className="truncate">{f.name}</span>
            </label>
          </li>
        ))}
      </ul>
      <Button type="submit" size="sm" variant="outline" loading={pending}>
        Einladen
      </Button>
      {state.message ? (
        <p role="status" className={`text-sm ${state.ok === false ? "text-danger" : "text-success"}`}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
