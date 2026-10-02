import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { getOwnPrayerRequest, listUserGroups } from "@/lib/prayer/queries";
import { PRAYER_VISIBILITIES, type PrayerVisibility } from "@/lib/validation/prayer";
import { PrayerForm } from "@/components/prayer/prayer-form";

export const metadata: Metadata = { title: "Anliegen bearbeiten" };

export default async function AnliegenBearbeitenPage(props: PageProps<"/gebet/[id]/bearbeiten">) {
  const { id } = await props.params;
  const user = await requireUser(`/gebet/${id}/bearbeiten`);
  const request = await getOwnPrayerRequest(id, user.id);
  if (!request) notFound();
  const groups = await listUserGroups(user.id);

  const visibility: PrayerVisibility = (PRAYER_VISIBILITIES as readonly string[]).includes(request.visibility)
    ? (request.visibility as PrayerVisibility)
    : "MEMBERS";

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      <Link
        href={`/gebet/${id}`}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Zurück zum Anliegen
      </Link>
      <header className="mt-4 mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Anliegen bearbeiten</h1>
        <p className="text-muted-foreground mt-2">Du kannst Text, Kategorie und Sichtbarkeit jederzeit anpassen.</p>
      </header>
      <PrayerForm
        groups={groups}
        requestId={request.id}
        initial={{
          title: request.title,
          body: request.body,
          category: request.category,
          visibility,
          groupId: request.groupId,
          isAnonymous: request.isAnonymous,
        }}
      />
    </main>
  );
}
