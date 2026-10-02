"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";
import { sendMessage } from "@/app/(site)/nachrichten/actions";
import { initialActionState } from "@/lib/action-state";
import { MESSAGE_MAX } from "@/lib/validation/messages";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { submitOnCtrlEnter } from "./submit-on-ctrl-enter";

/** Reply box of a conversation. The form resets itself after a successful send. */
export function MessageForm({ conversationId }: { conversationId: string }) {
  const [state, formAction, pending] = useActionState(sendMessage.bind(null, conversationId), initialActionState);
  const fieldError = state.errors?.body?.join(" ");
  const message = !state.ok && !fieldError ? state.message : undefined;
  const errorId = fieldError ? "body-error" : message ? "message-form-error" : undefined;

  return (
    <form action={formAction} className="space-y-1.5" aria-label="Nachricht schreiben">
      <div className="flex items-end gap-2">
        <div className="min-w-0 flex-1">
          <label htmlFor="body" className="sr-only">
            Nachricht
          </label>
          <Textarea
            id="body"
            name="body"
            rows={2}
            required
            maxLength={MESSAGE_MAX}
            autoFocus
            placeholder="Schreib eine Nachricht …"
            className="max-h-48 min-h-11"
            defaultValue={state.values?.body ?? ""}
            onKeyDown={submitOnCtrlEnter}
            aria-invalid={fieldError ? true : undefined}
            aria-describedby={errorId ?? "message-form-hint"}
          />
        </div>
        <Button type="submit" size="icon" loading={pending} aria-label="Senden" className="shrink-0">
          {pending ? null : <Send aria-hidden="true" />}
        </Button>
      </div>
      {fieldError ? (
        <p id="body-error" role="alert" className="text-xs font-medium text-danger">
          {fieldError}
        </p>
      ) : message ? (
        <p id="message-form-error" role="alert" className="text-xs font-medium text-danger">
          {message}
        </p>
      ) : (
        <p id="message-form-hint" className="text-[11px] text-muted-foreground">
          Strg + Enter sendet die Nachricht.
        </p>
      )}
    </form>
  );
}
