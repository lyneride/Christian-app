import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CommentForm } from "@/components/comments/comment-form";
import { CommentList } from "@/components/comments/comment-list";
import { PostCard } from "@/components/community/post-card";
import { buttonClasses } from "@/components/ui/button";
import { getCurrentUser, isModerator } from "@/lib/auth/dal";
import { resolveTranslationId } from "@/lib/bible/data";
import { getPost } from "@/lib/community/queries";
import { getMembership } from "@/lib/groups/queries";
import { canManageGroup } from "@/lib/groups/roles";
import { markdownToText } from "@/lib/markdown";
import { POST_KIND_LABELS, groupPath, postPath } from "@/lib/validation/community";

type Props = PageProps<"/gemeinschaft/beitrag/[id]">;

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { id } = await props.params;
  const user = await getCurrentUser();
  const post = await getPost(id, user);
  if (!post) return { title: "Beitrag" };
  const kind = POST_KIND_LABELS[post.kind].label;
  return {
    title: post.title ?? `${kind} von ${post.author.name}`,
    description: markdownToText(post.body, 160),
    robots: post.visibility === "PUBLIC" ? undefined : { index: false },
  };
}

export default async function PostPage(props: Props) {
  const { id } = await props.params;
  const user = await getCurrentUser();
  const post = await getPost(id, user);
  if (!post) notFound();

  const translation = await resolveTranslationId(user?.preferredTranslation);
  const membership = user && post.groupId ? await getMembership(post.groupId, user.id) : null;
  const canPin = !!post.groupId && (canManageGroup(membership) || isModerator(user));
  const back = post.group ? { href: groupPath(post.group.slug), label: post.group.name } : { href: "/gemeinschaft", label: "Gemeinschaft" };
  const target = { postId: post.id };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 md:py-14">
      <Link href={back.href} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" /> Zurück zu {back.label}
      </Link>

      <div className="mt-4">
        <PostCard post={post} viewer={user} translation={translation} detail canPin={canPin} />
      </div>

      <section id="kommentare" aria-labelledby="kommentare-titel" className="mt-10 scroll-mt-24">
        <h2 id="kommentare-titel" className="text-xl font-semibold tracking-tight">
          {post._count.comments === 0 ? "Kommentare" : post._count.comments === 1 ? "1 Kommentar" : `${post._count.comments} Kommentare`}
        </h2>
        <div className="mt-5">
          <CommentList target={target} viewer={user} emptyText="Noch keine Kommentare – deiner könnte der erste sein." />
        </div>
        <div className="mt-8 rounded-card border border-border bg-surface p-5">
          {user ? (
            <CommentForm target={target} label="Kommentar schreiben" submitLabel="Kommentieren" placeholder="Was möchtest du dazu sagen?" />
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">Melde dich an, um zu kommentieren.</p>
              <Link href={`/anmelden?next=${encodeURIComponent(postPath(post.id))}`} className={buttonClasses("primary", "sm")}>
                Anmelden
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
