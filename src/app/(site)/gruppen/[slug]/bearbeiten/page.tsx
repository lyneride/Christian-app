import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { GroupForm } from "@/components/groups/group-form";
import { requireUser } from "@/lib/auth/dal";
import { getGroupBySlug } from "@/lib/groups/queries";
import { groupPath } from "@/lib/validation/community";
import { updateGroup } from "../../actions";

export const metadata: Metadata = { title: "Gruppe bearbeiten", robots: { index: false } };

export default async function EditGroupPage(props: PageProps<"/gruppen/[slug]/bearbeiten">) {
  const { slug } = await props.params;
  const user = await requireUser(`${groupPath(slug)}/bearbeiten`);
  const detail = await getGroupBySlug(slug, user);
  if (!detail) notFound();
  if (!detail.canManage) redirect(groupPath(slug));
  const { group } = detail;

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 md:py-14">
      <Link href={groupPath(slug)} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" /> Zurück zu {group.name}
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">Gruppe bearbeiten</h1>
      <p className="mt-2 text-muted-foreground">Die Adresse der Gruppe (/gruppen/{group.slug}) bleibt auch bei einem neuen Namen gleich.</p>
      <div className="mt-8">
        <GroupForm
          action={updateGroup.bind(null, group.id)}
          defaults={{
            name: group.name,
            description: group.description,
            kind: group.kind,
            city: group.city,
            visibility: group.visibility === "PRIVATE" ? "PRIVATE" : "PUBLIC",
            imageUrl: group.imageUrl,
          }}
          submitLabel="Änderungen speichern"
          cancelHref={groupPath(slug)}
        />
      </div>
    </main>
  );
}
