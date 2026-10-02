"use client";

import { useActionState, useId, useRef, useState } from "react";
import { addComment, editComment } from "@/lib/comments/actions";
import type { CommentTarget } from "@/lib/comments/target";
import { FormMessage } from "@/components/auth/form-message";
import { Button } from "@/components/ui/button";
import { Field, Textarea } from "@/components/ui/input";
import { initialActionState, type ActionState } from "@/lib/action-state";

export interface CommentFormProps {
  target: CommentTarget;
  /** Reply to this comment (one level deep). */
  parentId?: string;
  /** Edit this comment instead of creating one. */
  commentId?: string;
  initialBody?: string;
  /** Textarea label, e.g. "Ermutigung schreiben" (prayers) or "Kommentar schreiben" (posts). */
  label: string;
  submitLabel?: string;
  placeholder?: string;
  autoFocus?: boolean;
  /** Called after a successful submit (e.g. to close an inline reply form). */
  onDone?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function CommentForm({
  target,
  parentId,
  commentId,
  initialBody,
  label,
  submitLabel = "Absenden",
  placeholder,
  autoFocus,
  onDone,
  onCancel,
  className,
}: CommentFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const fieldId = useId();
  const [state, formAction, pending] = useActionState(async (prev: ActionState, formData: FormData) => {
    const result = commentId ? await editComment(prev, formData) : await addComment(prev, formData);
    if (result.ok) {
      formRef.current?.reset();
      onDone?.();
    }
    return result;
  }, initialActionState);

  const errors = state.errors ?? {};
  const body = state.ok ? "" : (state.values?.body ?? initialBody ?? "");

  return (
    <form ref={formRef} action={formAction} className={className}>
      {target.postId ? <input type="hidden" name="postId" value={target.postId} /> : null}
      {target.prayerRequestId ? <input type="hidden" name="prayerRequestId" value={target.prayerRequestId} /> : null}
      {parentId ? <input type="hidden" name="parentId" value={parentId} /> : null}
      {commentId ? <input type="hidden" name="commentId" value={commentId} /> : null}

      {!state.ok ? <FormMessage state={state} className="mb-3" /> : null}

      <Field label={label} htmlFor={fieldId} error={errors.body}>
        <Textarea
          id={fieldId}
          name="body"
          required
          maxLength={2000}
          rows={commentId || parentId ? 3 : 4}
          placeholder={placeholder}
          defaultValue={body}
          autoFocus={autoFocus}
          aria-invalid={errors.body ? true : undefined}
          aria-describedby={errors.body ? `${fieldId}-error` : undefined}
          className="min-h-20"
        />
      </Field>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button type="submit" size="sm" loading={pending}>
          {submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
            Abbrechen
          </Button>
        ) : null}
        {state.ok && state.message ? (
          <span role="status" className="text-success text-xs">
            {state.message}
          </span>
        ) : null}
      </div>
    </form>
  );
}

/** "Antworten" link that toggles an inline reply form underneath a comment. */
export function ReplyForm({
  target,
  parentId,
  label = "Antwort schreiben",
}: {
  target: CommentTarget;
  parentId: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <Button type="button" variant="link" size="sm" className="text-xs" onClick={() => setOpen(true)}>
        Antworten
      </Button>
    );
  }
  return (
    <CommentForm
      target={target}
      parentId={parentId}
      label={label}
      submitLabel="Antworten"
      autoFocus
      onDone={() => setOpen(false)}
      onCancel={() => setOpen(false)}
      className="mt-2 w-full"
    />
  );
}
