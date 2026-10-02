import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = { title: "Passwort vergessen" };

export default function PasswortVergessenPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-serif text-2xl font-semibold tracking-tight">Passwort vergessen?</h1>
        <p className="text-muted-foreground text-sm">
          Kein Problem. Gib deine E-Mail-Adresse ein, dann schicken wir dir einen Link, mit dem du ein neues Passwort
          festlegen kannst.
        </p>
      </div>

      <ForgotPasswordForm />

      <p className="text-muted-foreground text-center text-sm">
        <Link href="/anmelden" className="text-primary font-medium underline-offset-4 hover:underline">
          Zurück zur Anmeldung
        </Link>
      </p>
    </div>
  );
}
