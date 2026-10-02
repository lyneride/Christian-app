import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { listUserGroups } from "@/lib/prayer/queries";
import { PrayerForm } from "@/components/prayer/prayer-form";

export const metadata: Metadata = { title: "Anliegen teilen" };

export default async function NeuesAnliegenPage() {
  const user = await requireUser("/gebet/neu");
  const groups = await listUserGroups(user.id);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      <Link
        href="/gebet"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Zur Gebetswand
      </Link>
      <header className="mt-4 mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Anliegen teilen</h1>
        <p className="text-muted-foreground mt-2">
          Schreib auf, was dich bewegt. Andere beten mit – ohne Bewertung und ohne Druck.
        </p>
      </header>
      <PrayerForm groups={groups} />
    </main>
  );
}
