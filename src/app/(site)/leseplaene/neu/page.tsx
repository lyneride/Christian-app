import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth/dal";
import { prisma } from "@/lib/db";
import { listFriends } from "@/lib/friends/queries";
import { PlanBuilderForm } from "./builder-form";

export const metadata: Metadata = { title: "Leseplan erstellen" };

export default async function NeuerLeseplanPage(props: PageProps<"/leseplaene/neu">) {
  const sp = await props.searchParams;
  const presetGroup = typeof sp.gruppe === "string" ? sp.gruppe : "";
  const presetPlan = typeof sp.plan === "string" ? sp.plan : "";
  const user = await requireUser(`/leseplaene/neu${presetGroup ? `?gruppe=${encodeURIComponent(presetGroup)}` : ""}`);
  const [friends, memberships, templates] = await Promise.all([
    listFriends(user.id),
    prisma.groupMember.findMany({ where: { userId: user.id, status: "ACTIVE" }, select: { group: { select: { id: true, name: true } } }, orderBy: { group: { name: "asc" } } }),
    prisma.readingPlan.findMany({
      where: { OR: [{ isSystem: true }, { authorId: user.id }] },
      select: { slug: true, title: true, dayCount: true, category: true },
      orderBy: [{ isSystem: "asc" }, { dayCount: "asc" }, { title: "asc" }],
    }),
  ]);
  const groups = memberships.map((m) => m.group);
  const preset = groups.find((g) => g.id === presetGroup);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <Link href={preset ? `/gruppen` : "/leseplaene"} className="text-sm text-muted-foreground hover:text-primary">
        ← {preset ? "Gruppen" : "Alle Lesepläne"}
      </Link>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Leseplan erstellen</h1>
      <p className="mt-2 max-w-prose text-muted-foreground">
        Sag einfach, was ihr lesen wollt und in wie vielen Tagen. Bleibe verteilt die Kapitel gleichmäßig. Allein, mit Freunden
        oder mit deiner Gruppe{preset ? ` „${preset.name}“` : ""}.
      </p>
      <div className="mt-8">
        <PlanBuilderForm friends={friends} groups={groups} templates={templates} presetGroupId={preset?.id ?? ""} presetPlanSlug={presetPlan} />
      </div>
    </main>
  );
}
