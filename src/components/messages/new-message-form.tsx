"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";
import { startConversation } from "@/app/(site)/nachrichten/actions";
import { initialActionState } from "@/lib/action-state";
import { MESSAGE_MAX } from "@/lib/validation/messages";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { FormMessage } from "@/components/auth/form-message";
import { submitOnCtrlEnter } from "./submit-on-ctrl-enter";

export function NewMessageForm({ initialUsername }: { initialUsername?: string }) {
  const [state, formAction, pending] = useActionState(startConversation, initialActionState);
  const errors = state.errors ?? {};
  const values = state.values ?? {};

  return (
    <form action={formAction} className="space-y-5">
      <FormMessage state={state} />

      <Field
        label="An"
        htmlFor="username"
        hint="Der Benutzername steht auf jedem Profil, z. B. @maria."
        error={errors.username}
        required
      >
        <Input
          id="username"
          name="username"
          type="text"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          required
          maxLength={31}
          placeholder="@benutzername"
          defaultValue={values.username ?? initialUsername ?? ""}
          autoFocus={!initialUsername}
          aria-invalid={errors.username ? true : undefined}
          aria-describedby={errors.username ? "username-error" : "username-hint"}
        />
      </Field>

      <Field
        label="Nachricht"
        htmlFor="body"
        hint="Bibelstellen wie Joh 3,16 werden automatisch verlinkt. Strg + Enter sendet."
        error={errors.body}
        required
      >
        <Textarea
          id="body"
          name="body"
          rows={6}
          required
          maxLength={MESSAGE_MAX}
          defaultValue={values.body ?? ""}
          autoFocus={Boolean(initialUsername)}
          onKeyDown={submitOnCtrlEnter}
          aria-invalid={errors.body ? true : undefined}
          aria-describedby={errors.body ? "body-error" : "body-hint"}
        />
      </Field>

      <div className="flex justify-end">
        <Button type="submit" loading={pending}>
          {pending ? null : <Send aria-hidden="true" />}
          Senden
        </Button>
      </div>
    </form>
  );
}
