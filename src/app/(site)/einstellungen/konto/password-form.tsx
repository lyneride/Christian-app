"use client";

import { useActionState, useState } from "react";
import { FormMessage } from "@/components/auth/form-message";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/input";
import { initialActionState } from "@/lib/action-state";
import { passwordProblems } from "@/lib/auth/password-rules";
import { changePassword } from "../actions";

const PASSWORD_HINT = "Mindestens 8 Zeichen, nicht nur Ziffern.";

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(changePassword, initialActionState);
  const [password, setPassword] = useState("");
  const errors = state.errors ?? {};

  const problems = password ? passwordProblems(password) : [];
  const passwordHint = !password ? PASSWORD_HINT : problems.length > 0 ? problems.join(" ") : "Sieht gut aus.";

  return (
    <form action={formAction} className="space-y-5">
      <FormMessage state={state} />
      <Field label="Aktuelles Passwort" htmlFor="currentPassword" error={errors.currentPassword} required>
        <PasswordInput
          id="currentPassword"
          name="currentPassword"
          autoComplete="current-password"
          required
          aria-invalid={errors.currentPassword ? true : undefined}
          aria-describedby={errors.currentPassword ? "currentPassword-error" : undefined}
        />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Neues Passwort" htmlFor="password" hint={passwordHint} error={errors.password} required>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={128}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={errors.password ? true : undefined}
            aria-describedby={errors.password ? "password-error" : "password-hint"}
          />
        </Field>
        <Field label="Neues Passwort wiederholen" htmlFor="confirm" error={errors.confirm} required>
          <PasswordInput
            id="confirm"
            name="confirm"
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={128}
            aria-invalid={errors.confirm ? true : undefined}
            aria-describedby={errors.confirm ? "confirm-error" : undefined}
          />
        </Field>
      </div>
      <div className="flex justify-end">
        <Button type="submit" loading={pending}>
          Passwort ändern
        </Button>
      </div>
    </form>
  );
}
