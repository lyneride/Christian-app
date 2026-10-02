import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/dal";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Registrieren" };

export default async function RegistrierenPage() {
  if (await getCurrentUser()) redirect("/start");
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-serif text-2xl font-semibold tracking-tight">Konto erstellen</h1>
        <p className="text-muted-foreground text-sm">Kostenlos und werbefrei. Du brauchst nur eine E-Mail-Adresse.</p>
      </div>

      <RegisterForm />

      <p className="text-muted-foreground text-center text-sm">
        Schon ein Konto?{" "}
        <Link href="/anmelden" className="text-primary font-medium underline-offset-4 hover:underline">
          Anmelden
        </Link>
      </p>
    </div>
  );
}
