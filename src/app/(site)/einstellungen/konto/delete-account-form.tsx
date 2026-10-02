"use client";

import { useActionState } from "react";
import { FormMessage } from "@/components/auth/form-message";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { initialActionState } from "@/lib/action-state";
import { DELETE_CONFIRMATION } from "@/lib/validation/profile";
import { deleteAccount } from "../actions";

export function DeleteAccountForm() {
  const [state, formAction, pending] = useActionState(deleteAccount, initialActionState);
  const errors = state.errors ?? {};

  return (
    <form action={formAction} className="space-y-5">
      <FormMessage state={state} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={`Zur Bestätigung „${DELETE_CONFIRMATION}“ eingeben`} htmlFor="confirmation" error={errors.confirmation} required>
          <Input
            id="confirmation"
            name="confirmation"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            required
            placeholder={DELETE_CONFIRMATION}
            aria-invalid={errors.confirmation ? true : undefined}
            aria-describedby={errors.confirmation ? "confirmation-error" : undefined}
          />
        </Field>
        <Field label="Dein Passwort" htmlFor="deletePassword" error={errors.password} required>
          <PasswordInput
            id="deletePassword"
            name="password"
            autoComplete="current-password"
            required
            aria-invalid={errors.password ? true : undefined}
            aria-describedby={errors.password ? "deletePassword-error" : undefined}
          />
        </Field>
      </div>
      <div className="flex justify-end">
        <Button type="submit" variant="danger" loading={pending}>
          Konto endgültig löschen
        </Button>
      </div>
    </form>
  );
}
