import type { ReactNode } from "react";
import { MessageSquareText } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import type { PostListItem } from "@/lib/community/queries";
import type { Viewer } from "@/lib/visibility";
import { PostCard } from "./post-card";

interface Props {
  posts: PostListItem[];
  viewer: Viewer | null;
  translation: string;
  canPin?: boolean;
  hideGroup?: boolean;
  emptyTitle: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
}

/** A column of post cards with an empty state. */
export function PostList({ posts, viewer, translation, canPin, hideGroup, emptyTitle, emptyDescription, emptyAction }: Props) {
  if (posts.length === 0) {
    return <EmptyState icon={<MessageSquareText />} title={emptyTitle} description={emptyDescription} action={emptyAction} />;
  }
  return (
    <ol className="space-y-4">
      {posts.map((post) => (
        <li key={post.id}>
          <PostCard post={post} viewer={viewer} translation={translation} canPin={canPin} hideGroup={hideGroup} />
        </li>
      ))}
    </ol>
  );
}
