"use client";

import { useActionState } from "react";
import { UserMinus, UserPlus } from "lucide-react";
import { toggleFollow } from "@/app/(site)/profil/[username]/actions";
import { Button } from "@/components/ui/button";
import { initialActionState } from "@/lib/action-state";

/** Follow / unfollow toggle for a member profile; the page re-renders with the new state after the action. */
export function FollowButton({ username, following }: { username: string; following: boolean }) {
  const [state, formAction, pending] = useActionState(toggleFollow, initialActionState);

  return (
    <form action={formAction} className="flex flex-col items-start gap-1">
      <input type="hidden" name="username" value={username} />
      <Button type="submit" variant={following ? "outline" : "primary"} loading={pending} aria-pressed={following}>
        {pending ? null : following ? <UserMinus aria-hidden="true" /> : <UserPlus aria-hidden="true" />}
        {following ? "Entfolgen" : "Folgen"}
      </Button>
      {state.message && !state.ok ? (
        <p role="alert" className="text-xs font-medium text-danger">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
