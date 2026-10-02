import type { Metadata } from "next";
import Link from "next/link";
import { MailCheck, MailX } from "lucide-react";
import { verifyEmail } from "@/lib/auth/actions";
import { getCurrentUser } from "@/lib/auth/dal";
import { ButtonLink } from "@/components/ui/button";
import { ResendVerificationForm } from "./resend-form";

export const metadata: Metadata = { title: "E-Mail-Adresse bestätigen" };

export default async function EmailBestaetigenPage(props: PageProps<"/email-bestaetigen/[token]">) {
  const { token } = await props.params;
  const [result, user] = await Promise.all([verifyEmail(token), getCurrentUser()]);

  if (result.ok) {
    return (
      <div className="space-y-6 text-center">
        <div className="bg-success-soft text-success mx-auto flex size-14 items-center justify-center rounded-full">
          <MailCheck className="size-7" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h1 className="font-serif text-2xl font-semibold tracking-tight">E-Mail-Adresse bestätigt</h1>
          <p className="text-muted-foreground text-sm">
            {result.status === "already-verified"
              ? "Deine E-Mail-Adresse war schon bestätigt. Alles ist bereit."
              : "Danke, deine E-Mail-Adresse ist jetzt bestätigt. Alles ist bereit."}
          </p>
        </div>
        {user ? (
          <ButtonLink href="/start" className="w-full" size="lg">
            Weiter zu Bleibe
          </ButtonLink>
        ) : (
          <ButtonLink href="/anmelden?nachricht=email-bestaetigt" className="w-full" size="lg">
            Jetzt anmelden
          </ButtonLink>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center">
        <div className="bg-warning-soft text-warning mb-4 flex size-14 items-center justify-center rounded-full">
          <MailX className="size-7" aria-hidden="true" />
        </div>
        <h1 className="font-serif text-2xl font-semibold tracking-tight">Link ungültig oder abgelaufen</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {result.status === "expired"
            ? "Dieser Bestätigungslink ist abgelaufen. Links sind 24 Stunden gültig."
            : "Dieser Bestätigungslink funktioniert nicht. Vielleicht wurde er schon benutzt oder beim Kopieren gekürzt."}
        </p>
      </div>

      {user ? (
        user.emailVerifiedAt ? (
          <div className="space-y-4 text-center">
            <p className="text-muted-foreground text-sm">
              Deine E-Mail-Adresse ist aber schon bestätigt, du musst nichts weiter tun.
            </p>
            <ButtonLink href="/start" className="w-full" size="lg">
              Weiter zu Bleibe
            </ButtonLink>
          </div>
        ) : (
          <ResendVerificationForm email={user.email} />
        )
      ) : (
        <div className="space-y-4 text-center">
          <p className="text-muted-foreground text-sm">Melde dich an, dann kannst du einen neuen Link anfordern.</p>
          <ButtonLink href={`/anmelden?next=${encodeURIComponent("/start")}`} className="w-full" size="lg">
            Anmelden
          </ButtonLink>
          <p className="text-muted-foreground text-sm">
            Noch kein Konto?{" "}
            <Link href="/registrieren" className="text-primary font-medium underline-offset-4 hover:underline">
              Registrieren
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
