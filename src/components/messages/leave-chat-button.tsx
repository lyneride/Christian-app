"use client";

import { useState, useTransition } from "react";
import { LogOut } from "lucide-react";
import { leaveConversation } from "@/app/(site)/nachrichten/actions";
import { Button } from "@/components/ui/button";

/** Two-step "leave chat" control for chats among friends. */
export function LeaveChatButton({ conversationId }: { conversationId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setConfirming(true)} className="text-danger">
        <LogOut aria-hidden="true" />
        Chat verlassen
      </Button>
    );
  }
  return (
    <div className="space-y-2">
      <p className="text-sm">Willst du den Chat wirklich verlassen? Du siehst die Nachrichten danach nicht mehr.</p>
      <div className="flex gap-2">
        <Button
          variant="danger"
          size="sm"
          loading={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await leaveConversation(conversationId);
              if (result && !result.ok && result.message) setError(result.message);
            })
          }
        >
          Ja, verlassen
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setConfirming(false)} disabled={pending}>
          Abbrechen
        </Button>
      </div>
      {error ? (
        <p role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
