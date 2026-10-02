import Link from "next/link";
import { MessageSquareText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { markdownToText } from "@/lib/markdown";
import { formatRelative } from "@/lib/utils";
import type { PostPreview } from "./queries";

const KIND_LABELS: Record<PostPreview["kind"], string> = {
  POST: "Beitrag",
  TESTIMONY: "Zeugnis",
  QUESTION: "Frage",
  IMPULSE: "Impuls",
};

export function PostList({ posts, emptyTitle, emptyDescription }: { posts: PostPreview[]; emptyTitle: string; emptyDescription: string }) {
  if (posts.length === 0) {
    return <EmptyState icon={<MessageSquareText aria-hidden="true" />} title={emptyTitle} description={emptyDescription} />;
  }
  return (
    <ul className="space-y-3">
      {posts.map((post) => {
        const title = post.title?.trim() || KIND_LABELS[post.kind];
        return (
          <li key={post.id}>
            <Link
              href={`/gemeinschaft/beitrag/${post.id}`}
              className="block rounded-card border border-border bg-surface p-4 shadow-soft transition hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-ring"
            >
              <div className="flex items-center justify-between gap-3">
                <Badge variant={post.kind === "TESTIMONY" ? "accent" : "default"}>{KIND_LABELS[post.kind]}</Badge>
                <time dateTime={post.createdAt.toISOString()} className="text-xs text-muted-foreground">
                  {formatRelative(post.createdAt)}
                </time>
              </div>
              <h3 className="mt-2 font-semibold">{title}</h3>
              <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{markdownToText(post.body, 200)}</p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
