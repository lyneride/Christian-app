"use client";

import { useActionState } from "react";
import { Trash } from "lucide-react";
import { deleteEvent } from "@/app/(site)/veranstaltungen/actions";
import { Button } from "@/components/ui/button";
import { initialActionState } from "@/lib/action-state";

/** Soft-deletes the event after a confirmation; the action redirects on success. */
export function DeleteEventButton({ eventId, className }: { eventId: string; className?: string }) {
  const [state, formAction, pending] = useActionState(deleteEvent.bind(null, eventId), initialActionState);

  return (
    <form
      action={formAction}
      className={className}
      onSubmit={(e) => {
        if (!window.confirm("Treffen wirklich löschen? Alle Zusagen gehen damit verloren.")) e.preventDefault();
      }}
    >
      <Button type="submit" variant="ghost" size="sm" loading={pending} className="text-danger hover:bg-danger-soft">
        <Trash aria-hidden="true" /> Löschen
      </Button>
      {state.ok === false && state.message ? (
        <p role="alert" className="mt-1 text-xs font-medium text-danger">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
