import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { MemberList } from "@/components/groups/group-sections";
import { requireUser } from "@/lib/auth/dal";
import { getGroupBySlug } from "@/lib/groups/queries";
import { groupPath } from "@/lib/validation/community";

type Props = PageProps<"/gruppen/[slug]/mitglieder">;

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  return { title: `Mitglieder – ${slug}`, robots: { index: false } };
}

export default async function MembersPage(props: Props) {
  const { slug } = await props.params;
  const path = `${groupPath(slug)}/mitglieder`;
  const user = await requireUser(path);
  const detail = await getGroupBySlug(slug, user);
  if (!detail) notFound();
  if (!detail.canViewContent) redirect(groupPath(slug));
  const { group, membership, memberCount, pendingCount, canManage } = detail;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 md:py-14">
      <Link href={groupPath(slug)} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" /> Zurück zu {group.name}
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">{canManage ? "Mitglieder verwalten" : "Mitglieder"}</h1>
      <p className="mt-2 text-muted-foreground">
        {memberCount === 1 ? "Eine Person ist" : `${memberCount} Menschen sind`} in „{group.name}“ dabei.
        {canManage && detail.isOwner ? " Als Leitung kannst du Rollen vergeben und die Leitung übergeben." : ""}
      </p>

      {canManage ? (
        <section aria-labelledby="anfragen" className="mt-8">
          <h2 id="anfragen" className="text-xl font-semibold tracking-tight">
            Offene Anfragen {pendingCount > 0 ? `(${pendingCount})` : ""}
          </h2>
          <div className="mt-3 rounded-card border border-border bg-surface px-4">
            <MemberList groupId={group.id} viewerId={user.id} actor={membership} status="PENDING" manage emptyText="Keine offenen Anfragen." />
          </div>
        </section>
      ) : null}

      <section aria-labelledby="aktive" className="mt-8">
        <h2 id="aktive" className="text-xl font-semibold tracking-tight">
          Mitglieder
        </h2>
        <div className="mt-3 rounded-card border border-border bg-surface px-4">
          <MemberList groupId={group.id} viewerId={user.id} actor={membership} manage={canManage} />
        </div>
      </section>

      {canManage ? (
        <section aria-labelledby="gesperrt" className="mt-8">
          <h2 id="gesperrt" className="text-xl font-semibold tracking-tight">
            Gesperrt
          </h2>
          <div className="mt-3 rounded-card border border-border bg-surface px-4">
            <MemberList groupId={group.id} viewerId={user.id} actor={membership} status="BANNED" manage emptyText="Niemand ist gesperrt." />
          </div>
        </section>
      ) : null}
    </main>
  );
}
