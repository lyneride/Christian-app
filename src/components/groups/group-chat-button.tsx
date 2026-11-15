"use client";

import { useState, useTransition } from "react";
import { MessagesSquare } from "lucide-react";
import { openGroupChat } from "@/app/(site)/nachrichten/actions";
import { Button } from "@/components/ui/button";

/** Opens the group's own chat (created on first use). Only rendered for active members. */
export function GroupChatButton({ groupId, unread = 0 }: { groupId: string; unread?: number }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <Button
        variant="accent"
        loading={pending}
        data-tour="group-chat"
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const result = await openGroupChat(groupId);
            if (result && !result.ok && result.message) setError(result.message);
          })
        }
      >
        {pending ? null : <MessagesSquare aria-hidden="true" />}
        Gruppenchat
        {unread > 0 ? (
          <span className="ml-0.5 inline-flex min-w-6 items-center justify-center rounded-full bg-surface px-1.5 text-xs text-foreground">
            {unread > 99 ? "99+" : unread}
            <span className="sr-only"> ungelesen</span>
          </span>
        ) : null}
      </Button>
      {error ? (
        <p role="alert" className="mt-2 text-xs font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
