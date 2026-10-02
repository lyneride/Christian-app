import type { Metadata } from "next";
import Link from "next/link";
import { SettingsSection } from "@/components/settings/settings-section";
import { requireUser } from "@/lib/auth/dal";
import { listTranslations } from "@/lib/bible/data";
import { prisma } from "@/lib/db";
import { profilePath } from "@/lib/profile";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = { title: "Profil bearbeiten" };

export default async function ProfilEinstellungenPage() {
  const user = await requireUser("/einstellungen/profil");
  const [settings, translations] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: user.id },
      select: { profileVisibility: true, openForPartner: true, preferredTranslation: true },
    }),
    listTranslations(),
  ]);

  return (
    <SettingsSection
      id="profil"
      title="Dein Profil"
      description="So sehen dich andere Mitglieder. Alles außer Name und Benutzername ist freiwillig."
    >
      <p className="mb-5 text-sm text-muted-foreground">
        Dein Profil ist unter{" "}
        <Link href={profilePath(user.username)} className="font-medium text-primary underline-offset-4 hover:underline">
          {profilePath(user.username)}
        </Link>{" "}
        erreichbar.
      </p>
      <ProfileForm
        initial={{
          name: user.name,
          username: user.username,
          bio: user.bio ?? "",
          location: user.location ?? "",
          church: user.church ?? "",
          avatarUrl: user.avatarUrl ?? "",
          profileVisibility: settings.profileVisibility,
          openForPartner: settings.openForPartner ? "on" : "",
          preferredTranslation: settings.preferredTranslation,
        }}
        translations={translations.map((t) => ({ id: t.id, name: t.name, language: t.language }))}
      />
    </SettingsSection>
  );
}
