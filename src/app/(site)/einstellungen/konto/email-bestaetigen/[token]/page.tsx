import type { Metadata } from "next";
import { SettingsSection } from "@/components/settings/settings-section";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/dal";
import { confirmEmailChange } from "../../email-change";

export const metadata: Metadata = { title: "Neue E-Mail-Adresse bestätigen" };

const REASONS = {
  invalid: "Dieser Link funktioniert nicht. Vielleicht wurde er schon benutzt, durch einen neueren ersetzt oder beim Kopieren gekürzt.",
  expired: "Dieser Link ist abgelaufen. Links sind 24 Stunden gültig – fordere einfach einen neuen an.",
  foreign: "Dieser Link gehört zu einem anderen Konto. Melde dich bitte mit dem Konto an, dessen Adresse du ändern möchtest.",
  taken: "Diese E-Mail-Adresse ist inzwischen von einem anderen Konto belegt. Bitte wähle eine andere.",
} as const;

export default async function EmailBestaetigenPage(props: PageProps<"/einstellungen/konto/email-bestaetigen/[token]">) {
  const { token } = await props.params;
  const user = await requireUser(`/einstellungen/konto/email-bestaetigen/${token}`);
  const result = await confirmEmailChange(user.id, token);

  return (
    <SettingsSection id="email-bestaetigen" title="E-Mail-Adresse ändern">
      <div className="space-y-5">
        {result.ok ? (
          <Alert tone="success" title="Deine E-Mail-Adresse wurde geändert.">
            Ab jetzt erreichen wir dich unter {result.email}. Zum Anmelden benutzt du ebenfalls die neue Adresse.
          </Alert>
        ) : (
          <Alert tone="danger" title="Das hat nicht geklappt.">
            {REASONS[result.reason]}
          </Alert>
        )}
        <ButtonLink href="/einstellungen/konto" variant="outline">
          Zurück zu den Kontoeinstellungen
        </ButtonLink>
      </div>
    </SettingsSection>
  );
}
