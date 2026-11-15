import type { Metadata } from "next";
import { MarkerSettings } from "@/components/settings/marker-settings";
import { SettingsSection } from "@/components/settings/settings-section";
import { requireUser } from "@/lib/auth/dal";
import { getMarkerPalette } from "@/lib/study/marker-queries";
import { highlightColorCounts } from "@/lib/study/queries";

export const metadata: Metadata = { title: "Markerfarben" };

export default async function MarkerfarbenPage() {
  const user = await requireUser("/einstellungen/markierungen");
  const [palette, counts] = await Promise.all([getMarkerPalette(user.id), highlightColorCounts(user.id)]);

  return (
    <SettingsSection
      id="markerfarben"
      title="Markerfarben"
      description="Gib jeder Farbe eine Bedeutung, wenn du willst – sie steht dann beim Markieren in der Bibel unter der Farbe. Farbton und Stärke wählst du selbst, und du kannst eigene Farben dazunehmen."
    >
      <MarkerSettings initial={palette} counts={counts} />
    </SettingsSection>
  );
}
