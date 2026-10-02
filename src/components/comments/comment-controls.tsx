"use client";

import { useActionState, useState, type ReactNode } from "react";
import { deleteComment } from "@/lib/comments/actions";
import type { CommentTarget } from "@/lib/comments/target";
import { MarkdownBody } from "@/components/content/markdown-body";
import { Button } from "@/components/ui/button";
import { initialActionState } from "@/lib/action-state";
import { CommentForm } from "./comment-form";

/**
 * Rendered comment body with an inline "Bearbeiten" mode for the author.
 * `children` are the other controls (reply, delete, report) shown under the text.
 */
export function CommentBody({
  commentId,
  target,
  html,
  markdown,
  canEdit,
  children,
}: {
  commentId: string;
  target: CommentTarget;
  html: string;
  markdown: string;
  canEdit: boolean;
  children?: ReactNode;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <CommentForm
        target={target}
        commentId={commentId}
        initialBody={markdown}
        label="Kommentar bearbeiten"
        submitLabel="Speichern"
        autoFocus
        onDone={() => setEditing(false)}
        onCancel={() => setEditing(false)}
        className="mt-1"
      />
    );
  }

  return (
    <>
      <MarkdownBody html={html} className="mt-1 text-sm" />
      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
        {children}
        {canEdit ? (
          <Button type="button" variant="link" size="sm" className="text-xs" onClick={() => setEditing(true)}>
            Bearbeiten
          </Button>
        ) : null}
      </div>
    </>
  );
}

export function DeleteCommentButton({ commentId }: { commentId: string }) {
  const [state, formAction, pending] = useActionState(deleteComment, initialActionState);
  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!window.confirm("Diesen Kommentar wirklich löschen?")) e.preventDefault();
      }}
      className="inline-flex items-center gap-2"
    >
      <input type="hidden" name="commentId" value={commentId} />
      <Button
        type="submit"
        variant="link"
        size="sm"
        className="text-muted-foreground hover:text-danger text-xs"
        loading={pending}
      >
        Löschen
      </Button>
      {state.ok === false && state.message ? (
        <span role="alert" className="text-danger text-xs">
          {state.message}
        </span>
      ) : null}
    </form>
  );
}
