"use client";

import { useActionState, useEffect, useRef, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { addDayPost, deleteDayPost } from "@/app/(site)/leseplaene/gemeinsam/actions";
import { Alert } from "@/components/ui/alert";
import { Button, buttonClasses } from "@/components/ui/button";
import { Field, Textarea } from "@/components/ui/input";
import { initialActionState } from "@/lib/action-state";

export function DayPostForm({ planGroupId, day }: { planGroupId: string; day: number }) {
  const [state, action, pending] = useActionState(addDayPost, initialActionState);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} action={action} className="space-y-3">
      <input type="hidden" name="planGroupId" value={planGroupId} />
      <input type="hidden" name="day" value={day} />
      <Field label="Was nimmst du aus dem heutigen Abschnitt mit?" htmlFor={`post-${day}`} error={state.errors?.body}>
        <Textarea id={`post-${day}`} name="body" rows={3} maxLength={2000} required placeholder="Ein Vers, ein Gedanke, eine Frage an die anderen …" />
      </Field>
      {state.message && state.ok === false ? <Alert tone="danger">{state.message}</Alert> : null}
      <Button type="submit" loading={pending} size="sm">
        Teilen
      </Button>
    </form>
  );
}

export function DeleteDayPostButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      onClick={() => {
        if (confirm("Diesen Beitrag löschen?")) start(() => deleteDayPost(id).then(() => undefined));
      }}
      disabled={pending}
      className={buttonClasses("ghost", "sm", "text-muted-foreground")}
      aria-label="Beitrag löschen"
    >
      <Trash2 aria-hidden="true" />
    </button>
  );
}
