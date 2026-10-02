import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PostCompose } from "@/components/community/post-compose";
import { requireUser } from "@/lib/auth/dal";
import { getPost } from "@/lib/community/queries";
import { getUserGroups } from "@/lib/groups/queries";
import { postPath, verseKeyToInput } from "@/lib/validation/community";
import { updatePost } from "../../../actions";

export const metadata: Metadata = { title: "Beitrag bearbeiten" };

export default async function EditPostPage(props: PageProps<"/gemeinschaft/beitrag/[id]/bearbeiten">) {
  const { id } = await props.params;
  const user = await requireUser(`${postPath(id)}/bearbeiten`);
  const post = await getPost(id, user);
  if (!post) notFound();
  if (post.authorId !== user.id) redirect(postPath(id));
  const groups = await getUserGroups(user.id);
  const lockedGroup = post.group?.visibility === "PRIVATE" ? { id: post.group.id, name: post.group.name } : undefined;

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 md:py-14">
      <Link href={postPath(id)} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" /> Zurück zum Beitrag
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">Beitrag bearbeiten</h1>
      <div className="mt-8">
        <PostCompose
          action={updatePost.bind(null, post.id)}
          mode="full"
          groups={groups.map((g) => ({ id: g.id, name: g.name }))}
          lockedGroup={lockedGroup}
          defaults={{
            kind: post.kind,
            title: post.title ?? "",
            body: post.body,
            verseRef: verseKeyToInput(post.verseRef),
            visibility: post.visibility === "PRIVATE" ? "MEMBERS" : post.visibility,
            groupId: post.groupId ?? "",
          }}
          submitLabel="Änderungen speichern"
          cancelHref={postPath(id)}
        />
      </div>
    </main>
  );
}
