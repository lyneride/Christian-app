"use client";

import { useActionState } from "react";
import { FormMessage } from "@/components/auth/form-message";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { initialActionState } from "@/lib/action-state";
import { requestEmailChange } from "../actions";

export function EmailForm() {
  const [state, formAction, pending] = useActionState(requestEmailChange, initialActionState);
  const errors = state.errors ?? {};

  return (
    <form action={formAction} className="space-y-5">
      <FormMessage state={state} />
      <Field label="Neue E-Mail-Adresse" htmlFor="newEmail" error={errors.newEmail} required>
        <Input
          id="newEmail"
          name="newEmail"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          defaultValue={state.ok ? "" : (state.values?.newEmail ?? "")}
          aria-invalid={errors.newEmail ? true : undefined}
          aria-describedby={errors.newEmail ? "newEmail-error" : undefined}
        />
      </Field>
      <Field label="Aktuelles Passwort" htmlFor="emailCurrentPassword" hint="Zur Sicherheit, damit niemand sonst deine Adresse ändern kann." error={errors.currentPassword}>
        <PasswordInput
          id="emailCurrentPassword"
          name="currentPassword"
          autoComplete="current-password"
          required
          aria-invalid={errors.currentPassword ? true : undefined}
          aria-describedby={errors.currentPassword ? "emailCurrentPassword-error" : "emailCurrentPassword-hint"}
        />
      </Field>
      <div className="flex justify-end">
        <Button type="submit" loading={pending}>
          Bestätigungslink senden
        </Button>
      </div>
    </form>
  );
}
