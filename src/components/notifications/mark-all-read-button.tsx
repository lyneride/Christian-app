"use client";

import { useActionState } from "react";
import { CheckCheck } from "lucide-react";
import { markAllNotificationsRead } from "@/app/(site)/benachrichtigungen/actions";
import { initialActionState } from "@/lib/action-state";
import { Button } from "@/components/ui/button";

export function MarkAllReadButton({ disabled }: { disabled?: boolean }) {
  const [state, formAction, pending] = useActionState(markAllNotificationsRead, initialActionState);
  return (
    <form action={formAction} className="flex flex-col items-start gap-1 sm:items-end">
      <Button type="submit" variant="outline" size="sm" loading={pending} disabled={disabled}>
        {pending ? null : <CheckCheck aria-hidden="true" />}
        Alle als gelesen markieren
      </Button>
      {state.message ? (
        <p role={state.ok ? "status" : "alert"} className={state.ok ? "text-xs text-muted-foreground" : "text-xs font-medium text-danger"}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
