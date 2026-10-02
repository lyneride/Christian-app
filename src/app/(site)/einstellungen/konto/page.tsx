import type { Metadata } from "next";
import { SettingsSection } from "@/components/settings/settings-section";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/lib/auth/dal";
import { prisma } from "@/lib/db";
import { DeleteAccountForm } from "./delete-account-form";
import { EmailForm } from "./email-form";
import { NotificationsForm } from "./notifications-form";
import { PasswordForm } from "./password-form";

export const metadata: Metadata = { title: "Konto" };

export default async function KontoPage() {
  const user = await requireUser("/einstellungen/konto");
  const { notifyByEmail } = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { notifyByEmail: true },
  });

  return (
    <>
      <SettingsSection
        id="email"
        title="E-Mail-Adresse"
        description="Wir schicken einen Bestätigungslink an die neue Adresse. Erst wenn du ihn öffnest, wird sie übernommen."
      >
        <p className="mb-5 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">Aktuell:</span>
          <span className="font-medium">{user.email}</span>
          {user.emailVerifiedAt ? <Badge variant="success">Bestätigt</Badge> : <Badge variant="warning">Noch nicht bestätigt</Badge>}
        </p>
        <EmailForm />
      </SettingsSection>

      <SettingsSection
        id="passwort"
        title="Passwort"
        description="Nach der Änderung wirst du auf allen anderen Geräten abgemeldet."
      >
        <PasswordForm />
      </SettingsSection>

      <SettingsSection id="benachrichtigungen" title="Benachrichtigungen">
        <NotificationsForm notifyByEmail={notifyByEmail} />
      </SettingsSection>

      <SettingsSection
        id="konto-loeschen"
        title="Konto löschen"
        tone="danger"
        description="Dein Profil, deine Notizen, Markierungen, Lesezeichen, Tagebucheinträge, Lernverse und Lesepläne werden gelöscht. Beiträge, Kommentare und Gebetsanliegen bleiben anonym als „Gelöschtes Mitglied“ bestehen. Das lässt sich nicht rückgängig machen."
      >
        <DeleteAccountForm />
      </SettingsSection>
    </>
  );
}
