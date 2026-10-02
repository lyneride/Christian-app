import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { getCurrentUser } from "@/lib/auth/dal";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Anmelden" };

/** Messages other flows can hand over via `?nachricht=…`. */
const MESSAGES: Record<string, { tone: "info" | "success" | "warning"; text: string }> = {
  registriert: { tone: "success", text: "Dein Konto ist angelegt. Du kannst dich jetzt anmelden." },
  "passwort-geaendert": {
    tone: "success",
    text: "Dein Passwort wurde geändert. Melde dich bitte mit dem neuen Passwort an.",
  },
  abgemeldet: { tone: "info", text: "Du bist jetzt abgemeldet." },
  "email-bestaetigt": {
    tone: "success",
    text: "Deine E-Mail-Adresse ist bestätigt. Melde dich an, um weiterzumachen.",
  },
  "sitzung-abgelaufen": { tone: "warning", text: "Deine Sitzung ist abgelaufen. Bitte melde dich noch einmal an." },
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AnmeldenPage(props: PageProps<"/anmelden">) {
  const searchParams = await props.searchParams;
  if (await getCurrentUser()) redirect("/start");
  const rawNext = first(searchParams.next) ?? "";
  // Only in-app paths are passed on; the action checks again before redirecting.
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : undefined;
  const notice = MESSAGES[first(searchParams.nachricht) ?? ""];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-serif text-2xl font-semibold tracking-tight">Willkommen zurück</h1>
        <p className="text-muted-foreground text-sm">Melde dich an, um weiterzulesen, zu beten und dabei zu sein.</p>
      </div>

      {notice ? <Alert tone={notice.tone}>{notice.text}</Alert> : null}
      {!notice && next ? <Alert tone="info">Bitte melde dich an, um fortzufahren.</Alert> : null}

      <LoginForm next={next} />

      <p className="text-muted-foreground text-center text-sm">
        Noch kein Konto?{" "}
        <Link href="/registrieren" className="text-primary font-medium underline-offset-4 hover:underline">
          Jetzt registrieren
        </Link>
      </p>
    </div>
  );
}
