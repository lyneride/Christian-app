import { listComments, type CommentNode, type CommentTarget } from "@/lib/comments/queries";
import { commentAnchor } from "@/lib/comments/target";
import { renderMarkdown } from "@/lib/markdown";
import { formatRelative } from "@/lib/utils";
import type { Viewer } from "@/lib/visibility";
import { AuthorLine } from "@/components/prayer/author-line";
import { ReportButton } from "@/components/moderation/report-button";
import { CommentBody, DeleteCommentButton } from "./comment-controls";
import { ReplyForm } from "./comment-form";

export interface CommentListProps {
  target: CommentTarget;
  viewer: Viewer | null;
  /** Shown when there are no comments yet. */
  emptyText?: string;
  /** Label of the inline reply textarea. */
  replyLabel?: string;
}

function isModerator(viewer: Viewer | null) {
  return viewer?.role === "MODERATOR" || viewer?.role === "ADMIN";
}

function wasEdited(c: CommentNode) {
  return c.updatedAt.getTime() - c.createdAt.getTime() > 60_000;
}

function CommentItem({
  comment,
  target,
  viewer,
  replyLabel,
}: {
  comment: CommentNode;
  target: CommentTarget;
  viewer: Viewer | null;
  replyLabel?: string;
}) {
  const own = viewer?.id === comment.authorId;
  const canDelete = own || isModerator(viewer);

  return (
    <li id={commentAnchor(comment.id)} className="scroll-mt-24">
      {comment.deletedAt ? (
        <p className="text-muted-foreground text-sm italic">Kommentar gelöscht</p>
      ) : (
        <>
          <AuthorLine
            author={comment.author}
            size="xs"
            meta={
              <>
                <time dateTime={comment.createdAt.toISOString()}>{formatRelative(comment.createdAt)}</time>
                {wasEdited(comment) ? " · bearbeitet" : null}
              </>
            }
          />
          <div className="pl-8">
            <CommentBody
              commentId={comment.id}
              target={target}
              html={renderMarkdown(comment.body, { headings: false })}
              markdown={comment.body}
              canEdit={own}
            >
              {viewer ? <ReplyForm target={target} parentId={comment.id} label={replyLabel} /> : null}
              {canDelete ? <DeleteCommentButton commentId={comment.id} /> : null}
              {viewer && !own ? (
                <ReportButton targetType="comment" targetId={comment.id} signedIn variant="link" />
              ) : null}
            </CommentBody>
          </div>
        </>
      )}

      {comment.replies.length > 0 ? (
        <ol className="border-border mt-3 space-y-4 border-l-2 pl-4 sm:ml-8">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} target={target} viewer={viewer} replyLabel={replyLabel} />
          ))}
        </ol>
      ) : null}
    </li>
  );
}

/** Server component: threaded comments (one level) for a post or prayer request. */
export async function CommentList({
  target,
  viewer,
  emptyText = "Noch keine Kommentare.",
  replyLabel,
}: CommentListProps) {
  const comments = await listComments(target);
  if (comments.length === 0) return <p className="text-muted-foreground text-sm">{emptyText}</p>;

  return (
    <ol className="space-y-6">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} target={target} viewer={viewer} replyLabel={replyLabel} />
      ))}
    </ol>
  );
}
