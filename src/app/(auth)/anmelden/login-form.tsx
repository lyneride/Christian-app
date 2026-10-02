"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input } from "@/components/ui/input";
import { FormMessage } from "@/components/auth/form-message";
import { PasswordInput } from "@/components/auth/password-input";

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(login, undefined);
  const errors = state?.errors ?? {};

  return (
    <form action={formAction} className="space-y-5">
      {next ? <input type="hidden" name="next" value={next} /> : null}

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

      <div className="space-y-1.5">
        <Field label="Passwort" htmlFor="password" error={errors.password}>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
            required
            aria-invalid={errors.password ? true : undefined}
            aria-describedby={errors.password ? "password-error" : undefined}
          />
        </Field>
        <p className="text-right text-sm">
          <Link href="/passwort-vergessen" className="text-primary underline-offset-4 hover:underline">
            Passwort vergessen?
          </Link>
        </p>
      </div>

      <label htmlFor="remember" className="text-foreground flex items-center gap-2.5 text-sm">
        <Checkbox id="remember" name="remember" defaultChecked={state?.values?.remember === "on"} />
        Angemeldet bleiben
      </label>

      <Button type="submit" loading={pending} className="w-full" size="lg">
        Anmelden
      </Button>
    </form>
  );
}
