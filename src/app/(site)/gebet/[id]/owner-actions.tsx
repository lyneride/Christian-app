"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Lock, Pencil, Sparkles, Trash2 } from "lucide-react";
import { closePrayerRequest, deletePrayerRequest, markAnswered } from "../actions";
import { FormMessage } from "@/components/auth/form-message";
import { Button, buttonClasses } from "@/components/ui/button";
import { Field, Textarea } from "@/components/ui/input";
import { initialActionState } from "@/lib/action-state";

export interface OwnerActionsProps {
  id: string;
  status: "OPEN" | "ANSWERED" | "CLOSED";
  /** Author: edit, mark answered, close. */
  canEdit: boolean;
  /** Author or moderator. */
  canDelete: boolean;
}

export function OwnerActions({ id, status, canEdit, canDelete }: OwnerActionsProps) {
  const [answerOpen, setAnswerOpen] = useState(false);
  const [answerState, answerAction, answerPending] = useActionState(markAnswered.bind(null, id), initialActionState);
  const [closeState, closeAction, closePending] = useActionState(closePrayerRequest.bind(null, id), initialActionState);
  const [deleteState, deleteAction, deletePending] = useActionState(
    deletePrayerRequest.bind(null, id),
    initialActionState,
  );

  const errors = answerState.errors ?? {};
  const showAnswerForm = canEdit && status === "OPEN" && answerOpen;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {canEdit ? (
          <Link href={`/gebet/${id}/bearbeiten`} className={buttonClasses("outline", "sm")}>
            <Pencil aria-hidden="true" /> Bearbeiten
          </Link>
        ) : null}

        {canEdit && status === "OPEN" ? (
          <Button
            type="button"
            variant="accent"
            size="sm"
            aria-expanded={answerOpen}
            onClick={() => setAnswerOpen((v) => !v)}
          >
            <Sparkles aria-hidden="true" /> Als erhört markieren
          </Button>
        ) : null}

        {canEdit && status === "OPEN" ? (
          <form action={closeAction} className="contents">
            <Button type="submit" variant="ghost" size="sm" loading={closePending}>
              <Lock aria-hidden="true" /> Schließen
            </Button>
          </form>
        ) : null}

        {canDelete ? (
          <form
            action={deleteAction}
            className="contents"
            onSubmit={(e) => {
              if (!window.confirm("Dieses Anliegen wirklich löschen? Das lässt sich nicht rückgängig machen."))
                e.preventDefault();
            }}
          >
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-danger"
              loading={deletePending}
            >
              <Trash2 aria-hidden="true" /> Löschen
            </Button>
          </form>
        ) : null}
      </div>

      {showAnswerForm ? (
        <form action={answerAction} className="rounded-card border-border bg-surface shadow-soft space-y-4 border p-5">
          <div>
            <h2 className="text-base font-semibold">So hat Gott geantwortet</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Deine Worte erscheinen beim Anliegen – als Ermutigung für alle, die mitgebetet haben. Du kannst das Feld
              auch leer lassen.
            </p>
          </div>
          <FormMessage state={answerState.ok ? undefined : answerState} />
          <Field label="Deine Notiz (optional)" htmlFor="answerNote" error={errors.answerNote}>
            <Textarea
              id="answerNote"
              name="answerNote"
              maxLength={2000}
              rows={4}
              className="min-h-24"
              aria-invalid={errors.answerNote ? true : undefined}
              aria-describedby={errors.answerNote ? "answerNote-error" : undefined}
            />
          </Field>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" variant="accent" size="sm" loading={answerPending}>
              Als erhört markieren
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setAnswerOpen(false)}>
              Abbrechen
            </Button>
          </div>
        </form>
      ) : null}

      {answerState.ok ? <FormMessage state={answerState} /> : null}
      <FormMessage state={closeState} />
      {deleteState.ok === false ? <FormMessage state={deleteState} /> : null}
    </div>
  );
}
