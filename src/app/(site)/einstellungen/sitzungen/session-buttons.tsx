"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { initialActionState } from "@/lib/action-state";
import { endOtherSessions, endSession } from "../actions";

export function EndSessionButton({ sessionId, isCurrent }: { sessionId: string; isCurrent: boolean }) {
  const [state, formAction, pending] = useActionState(endSession, initialActionState);
  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="sessionId" value={sessionId} />
      <Button type="submit" variant="outline" size="sm" loading={pending}>
        {isCurrent ? "Abmelden" : "Beenden"}
      </Button>
      {state.message && !state.ok ? (
        <p role="alert" className="text-xs font-medium text-danger">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

export function EndOtherSessionsButton({ count }: { count: number }) {
  const [state, formAction, pending] = useActionState(endOtherSessions, initialActionState);
  return (
    <form action={formAction} className="flex flex-wrap items-center gap-3">
      <Button type="submit" variant="secondary" loading={pending}>
        Alle anderen beenden ({count})
      </Button>
      {state.message ? (
        <p role={state.ok ? "status" : "alert"} className={state.ok ? "text-sm text-success" : "text-sm font-medium text-danger"}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
