"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { resetPassword } from "@/lib/auth/actions";
import { passwordProblems } from "@/lib/auth/password-rules";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/input";
import { FormMessage } from "@/components/auth/form-message";
import { PasswordInput } from "@/components/auth/password-input";

const PASSWORD_HINT = "Mindestens 8 Zeichen, nicht nur Ziffern.";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetPassword, undefined);
  const [password, setPassword] = useState("");
  const errors = state?.errors ?? {};

  const problems = password ? passwordProblems(password) : [];
  const passwordHint = !password ? PASSWORD_HINT : problems.length > 0 ? problems.join(" ") : "Sieht gut aus.";
  // The link itself is the problem (used, expired): offer the way out instead of the form.
  const linkInvalid = Boolean(state?.message && !state.ok && !state.errors);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="token" value={token} />

      <FormMessage state={state} />
      {linkInvalid ? (
        <p className="text-sm">
          <Link href="/passwort-vergessen" className="text-primary font-medium underline-offset-4 hover:underline">
            Neuen Link anfordern
          </Link>
        </p>
      ) : null}

      <Field label="Neues Passwort" htmlFor="password" hint={passwordHint} error={errors.password}>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={128}
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={errors.password ? true : undefined}
          aria-describedby={errors.password ? "password-error" : "password-hint"}
        />
      </Field>

      <Field label="Passwort wiederholen" htmlFor="confirm" error={errors.confirm}>
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

      <Button type="submit" loading={pending} className="w-full" size="lg">
        Passwort speichern
      </Button>
    </form>
  );
}
