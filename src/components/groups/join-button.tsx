"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { LogOut, UserPlus } from "lucide-react";
import { joinGroup, leaveGroup } from "@/app/(site)/gruppen/actions";
import { Button, buttonClasses } from "@/components/ui/button";
import type { MembershipLike } from "@/lib/groups/roles";
import { membershipLabel } from "@/lib/groups/roles";

interface Props {
  groupId: string;
  membership: MembershipLike | null;
  visibility: "PUBLIC" | "PRIVATE" | "MEMBERS" | "GROUP";
  signedIn: boolean;
  loginHref: string;
}

/** Join / request / leave control with the current membership status. */
export function JoinButton({ groupId, membership, visibility, signedIn, loginHref }: Props) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  function run(action: () => Promise<{ ok?: boolean; message?: string }>) {
    setMessage(null);
    startTransition(async () => {
      const result = await action();
      if (result.message) setMessage({ ok: !!result.ok, text: result.message });
    });
  }

  if (!signedIn) {
    return (
      <Link href={loginHref} className={buttonClasses("primary")}>
        <UserPlus aria-hidden="true" />
        Anmelden und beitreten
      </Link>
    );
  }

  const label = membershipLabel(membership);
  const status = membership?.status;
  const canLeave = !!membership && status !== "BANNED" && membership.role !== "OWNER";

  return (
    <div className="flex flex-wrap items-center gap-3">
      {!membership ? (
        <Button type="button" onClick={() => run(() => joinGroup(groupId))} loading={pending}>
          <UserPlus aria-hidden="true" />
          {visibility === "PRIVATE" ? "Beitritt anfragen" : "Beitreten"}
        </Button>
      ) : (
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      )}
      {canLeave ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            if (status === "ACTIVE" && !window.confirm("Möchtest du die Gruppe wirklich verlassen?")) return;
            run(() => leaveGroup(groupId));
          }}
          disabled={pending}
        >
          <LogOut aria-hidden="true" />
          {status === "PENDING" ? "Anfrage zurückziehen" : "Verlassen"}
        </Button>
      ) : null}
      {message ? (
        <span role={message.ok ? "status" : "alert"} className={message.ok ? "text-sm text-success" : "text-sm text-danger"}>
          {message.text}
        </span>
      ) : null}
    </div>
  );
}
