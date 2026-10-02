import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { GroupForm } from "@/components/groups/group-form";
import { requireUser } from "@/lib/auth/dal";
import { createGroup } from "../actions";

export const metadata: Metadata = { title: "Gruppe gründen" };

export default async function NewGroupPage() {
  await requireUser("/gruppen/neu");

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 md:py-14">
      <Link href="/gruppen" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" /> Zurück zu den Gruppen
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">Gruppe gründen</h1>
      <p className="mt-2 text-muted-foreground">
        Ein Hauskreis, eine Gebetsgruppe, ein Kreis zu einem Thema – du leitest die Gruppe und kannst später andere in die Leitung holen.
      </p>
      <div className="mt-8">
        <GroupForm action={createGroup} submitLabel="Gruppe gründen" cancelHref="/gruppen" />
      </div>
    </main>
  );
}
