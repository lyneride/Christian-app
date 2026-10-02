"use client";

import { useActionState } from "react";
import { requestPasswordReset } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { FormMessage } from "@/components/auth/form-message";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, undefined);
  const errors = state?.errors ?? {};

  return (
    <form action={formAction} className="space-y-5">
      <FormMessage state={state} />

      <Field label="E-Mail-Adresse" htmlFor="email" error={errors.email}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          autoFocus
          defaultValue={state?.values?.email ?? ""}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
      </Field>

      <Button type="submit" loading={pending} className="w-full" size="lg">
        Link anfordern
      </Button>
    </form>
  );
}
