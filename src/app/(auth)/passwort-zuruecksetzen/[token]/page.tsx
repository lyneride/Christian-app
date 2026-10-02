import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { hashToken } from "@/lib/auth/tokens";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = { title: "Neues Passwort festlegen" };

async function isResetTokenUsable(token: string): Promise<boolean> {
  if (token.length < 20 || token.length > 128) return false;
  const record = await prisma.verificationToken.findUnique({
    where: { tokenHash: hashToken(token) },
    select: { purpose: true, expiresAt: true, usedAt: true, user: { select: { status: true } } },
  });
  return Boolean(
    record &&
    record.purpose === "PASSWORD_RESET" &&
    !record.usedAt &&
    record.expiresAt.getTime() > Date.now() &&
    record.user.status === "ACTIVE",
  );
}

export default async function PasswortZuruecksetzenPage(props: PageProps<"/passwort-zuruecksetzen/[token]">) {
  const { token } = await props.params;
  const usable = await isResetTokenUsable(token);

  if (!usable) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="font-serif text-2xl font-semibold tracking-tight">Link ungültig oder abgelaufen</h1>
          <p className="text-muted-foreground text-sm">
            Dieser Link zum Zurücksetzen funktioniert nicht mehr. Links sind eine Stunde gültig und können nur einmal
            verwendet werden.
          </p>
        </div>
        <Alert tone="warning">
          Fordere einfach einen neuen Link an. Dein bisheriges Passwort bleibt bis dahin unverändert.
        </Alert>
        <ButtonLink href="/passwort-vergessen" className="w-full" size="lg">
          Neuen Link anfordern
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-serif text-2xl font-semibold tracking-tight">Neues Passwort festlegen</h1>
        <p className="text-muted-foreground text-sm">
          Wähle ein neues Passwort. Danach bist du auf allen anderen Geräten abgemeldet.
        </p>
      </div>

      <ResetPasswordForm token={token} />
    </div>
  );
}
