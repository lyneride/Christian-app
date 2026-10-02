import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { SettingsSection } from "@/components/settings/settings-section";
import { buttonClasses } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/dal";

export const metadata: Metadata = { title: "Deine Daten" };

const INCLUDED = [
  "Profil (Name, Benutzername, E-Mail-Adresse, Über dich, Ort, Gemeinde, Einstellungen)",
  "Beiträge und Kommentare",
  "Gebetsanliegen",
  "Notizen, Markierungen und Lesezeichen in der Bibel",
  "Tagebucheinträge",
  "Lernverse",
  "Lesepläne und dein Fortschritt",
];

export default async function DatenPage() {
  await requireUser("/einstellungen/daten");

  return (
    <SettingsSection
      id="daten"
      title="Deine Daten"
      description="Alles, was du bei Bleibe gespeichert hast, kannst du jederzeit als Datei herunterladen (JSON). Passwörter und Anmeldedaten sind nicht enthalten."
    >
      <ul className="mb-6 list-disc space-y-1 pl-5 text-sm text-foreground/90">
        {INCLUDED.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <a href="/api/konto/export" download="bleibe-export.json" className={buttonClasses("primary")}>
        <Download aria-hidden="true" />
        Daten herunterladen
      </a>
      <p className="mt-6 text-sm text-muted-foreground">
        Du möchtest dein Konto schließen?{" "}
        <Link href="/einstellungen/konto#konto-loeschen-titel" className="text-primary underline-offset-4 hover:underline">
          Konto löschen
        </Link>
      </p>
    </SettingsSection>
  );
}
