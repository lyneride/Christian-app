import Link from "next/link";
import { Pin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UserLink } from "@/components/profile/user-link";
import { ReportButton } from "@/components/moderation/report-button";
import { verseQuote, type PostListItem } from "@/lib/community/queries";
import { markdownToText, renderMarkdown } from "@/lib/markdown";
import { cn, formatRelative } from "@/lib/utils";
import { groupPath, postPath } from "@/lib/validation/community";
import type { Viewer } from "@/lib/visibility";
import { KindBadge } from "./kind-badge";
import { Markdown } from "./markdown";
import { PostActions } from "./post-actions";
import { ReactionBar } from "./reaction-bar";
import { VerseQuote } from "./verse-quote";

/** Bodies longer than this are shown as a plain-text excerpt in lists. */
const COLLAPSE_AT = 700;
const EXCERPT_LENGTH = 480;

export interface PostCardProps {
  post: PostListItem;
  viewer: Viewer | null;
  /** Translation id for the verse quote. */
  translation: string;
  /** Full body, heading as h1, no "Mehr lesen". */
  detail?: boolean;
  /** Whether the viewer may pin this post (group leadership / moderator), decided by the page. */
  canPin?: boolean;
  /** Hide the group badge (on the group page itself). */
  hideGroup?: boolean;
  className?: string;
}

function wasEdited(post: PostListItem) {
  return post.updatedAt.getTime() - post.createdAt.getTime() > 60_000;
}

/** Server component: one post as a card (feed, group page) or as the full detail view. */
export async function PostCard({ post, viewer, translation, detail = false, canPin = false, hideGroup = false, className }: PostCardProps) {
  const href = postPath(post.id);
  const own = viewer?.id === post.authorId;
  const moderator = viewer?.role === "MODERATOR" || viewer?.role === "ADMIN";
  const quote = post.verseRef ? await verseQuote(post.verseRef, translation) : null;
  const collapsed = !detail && post.body.length > COLLAPSE_AT;
  const Heading = detail ? "h1" : "h2";

  return (
    <article className={cn("rounded-card border border-border bg-surface p-5 shadow-soft sm:p-6", className)} aria-labelledby={post.title ? `post-${post.id}-title` : undefined}>
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
        <UserLink user={post.author} size="sm" />
        <span className="flex items-center gap-2">
          <Link href={href} className="hover:underline">
            <time dateTime={post.createdAt.toISOString()}>{formatRelative(post.createdAt)}</time>
          </Link>
          {wasEdited(post) ? <span>· bearbeitet</span> : null}
        </span>
        <span className="ml-auto flex flex-wrap items-center gap-1.5">
          {post.pinned ? (
            <Badge variant="warning">
              <Pin className="size-3" aria-hidden="true" /> Angepinnt
            </Badge>
          ) : null}
          <KindBadge kind={post.kind} />
          {post.group && !hideGroup ? (
            <Link href={groupPath(post.group.slug)} className="inline-flex">
              <Badge variant="outline" className="hover:bg-surface-muted">
                <Users className="size-3" aria-hidden="true" /> {post.group.name}
              </Badge>
            </Link>
          ) : null}
        </span>
      </header>

      {post.title ? (
        <Heading id={`post-${post.id}-title`} className={cn("mt-3 font-semibold tracking-tight", detail ? "text-2xl sm:text-3xl" : "text-lg")}>
          {detail ? post.title : <Link href={href} className="hover:underline">{post.title}</Link>}
        </Heading>
      ) : null}

      {collapsed ? (
        <p className="mt-3 leading-relaxed text-foreground/90">
          {markdownToText(post.body, EXCERPT_LENGTH)}{" "}
          <Link href={href} className="font-medium text-primary hover:underline">
            Mehr lesen
          </Link>
        </p>
      ) : (
        <Markdown html={renderMarkdown(post.body, { headings: false })} className={cn("mt-3", post.kind === "IMPULSE" && "text-lg")} />
      )}

      {quote ? <VerseQuote quote={quote} className="mt-4" /> : null}

      <footer className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <ReactionBar
          postId={post.id}
          reactions={post.reactions}
          viewerReaction={post.viewerReaction}
          signedIn={viewer !== null}
          commentCount={post._count.comments}
          commentHref={`${href}#kommentare`}
          loginHref={`/anmelden?next=${encodeURIComponent(href)}`}
        />
        <div className="flex items-center gap-1">
          {viewer && !own ? <ReportButton targetType="post" targetId={post.id} signedIn variant="link" /> : null}
          <PostActions
            postId={post.id}
            canEdit={own}
            canDelete={own || moderator}
            canPin={canPin && !!post.groupId}
            pinned={post.pinned}
            afterDeleteHref={detail ? (post.group ? groupPath(post.group.slug) : "/gemeinschaft") : undefined}
          />
        </div>
      </footer>
    </article>
  );
}
