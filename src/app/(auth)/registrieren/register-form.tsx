"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { register } from "@/lib/auth/actions";
import { passwordProblems } from "@/lib/auth/password-rules";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input } from "@/components/ui/input";
import { FormMessage } from "@/components/auth/form-message";
import { PasswordInput } from "@/components/auth/password-input";

const PASSWORD_HINT = "Mindestens 8 Zeichen, nicht nur Ziffern.";

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(register, undefined);
  const [password, setPassword] = useState("");
  const errors = state?.errors ?? {};
  const values = state?.values ?? {};

  const problems = password ? passwordProblems(password) : [];
  const passwordHint = !password ? PASSWORD_HINT : problems.length > 0 ? problems.join(" ") : "Sieht gut aus.";

  return (
    <form action={formAction} className="space-y-5">
      <FormMessage state={state} />

      <Field label="Name" htmlFor="name" hint="So wirst du anderen angezeigt." error={errors.name}>
        <Input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          minLength={2}
          maxLength={60}
          defaultValue={values.name ?? ""}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? "name-error" : "name-hint"}
        />
      </Field>

      <Field label="Benutzername" htmlFor="username" hint="Nur Buchstaben, Zahlen, . _ -" error={errors.username}>
        <Input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          required
          minLength={3}
          maxLength={30}
          defaultValue={values.username ?? ""}
          aria-invalid={errors.username ? true : undefined}
          aria-describedby={errors.username ? "username-error" : "username-hint"}
        />
      </Field>

      <Field label="E-Mail-Adresse" htmlFor="email" error={errors.email}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          defaultValue={values.email ?? ""}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
      </Field>

      <Field label="Passwort" htmlFor="password" hint={passwordHint} error={errors.password}>
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

      <div className="space-y-1.5">
        <label htmlFor="acceptTerms" className="text-foreground flex items-start gap-2.5 text-sm">
          <Checkbox
            id="acceptTerms"
            name="acceptTerms"
            required
            defaultChecked={values.acceptTerms === "on"}
            className="mt-0.5"
            aria-invalid={errors.acceptTerms ? true : undefined}
            aria-describedby={errors.acceptTerms ? "acceptTerms-error" : undefined}
          />
          <span>
            Ich akzeptiere die{" "}
            <Link href="/nutzungsbedingungen" className="text-primary underline-offset-4 hover:underline">
              Nutzungsbedingungen
            </Link>{" "}
            und habe die{" "}
            <Link href="/datenschutz" className="text-primary underline-offset-4 hover:underline">
              Datenschutzerklärung
            </Link>{" "}
            gelesen.
          </span>
        </label>
        {errors.acceptTerms ? (
          <p id="acceptTerms-error" role="alert" className="text-danger text-xs font-medium">
            {errors.acceptTerms.join(" ")}
          </p>
        ) : null}
      </div>

      <Button type="submit" loading={pending} className="w-full" size="lg">
        Konto erstellen
      </Button>
    </form>
  );
}
