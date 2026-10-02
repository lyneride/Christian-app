"use client";

import { useActionState } from "react";
import { initialActionState, type ActionState } from "@/lib/action-state";
import { NOTE_VISIBILITIES, NOTE_VISIBILITY_LABELS, type NoteVisibility } from "@/lib/validation/study";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { FormMessage } from "@/components/auth/form-message";

export interface NoteFormProps {
  /** `addNote` or `updateNote.bind(null, id)` */
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  verseKey: string;
  /** e.g. "Johannes 3,16" – shown above the fields */
  reference?: string;
  initial?: {
    verseEnd?: number | null;
    title?: string | null;
    body?: string;
    visibility?: NoteVisibility;
  };
  /** In-app path to go to after a successful save (hidden `next` field). */
  next?: string;
  submitLabel?: string;
  /** Rendered next to the submit button (e.g. a cancel link). */
  secondaryAction?: React.ReactNode;
  /** Tighter layout for the reader's side panel. */
  compact?: boolean;
}

export function NoteForm({
  action,
  verseKey,
  reference,
  initial,
  next,
  submitLabel = "Notiz speichern",
  secondaryAction,
  compact,
}: NoteFormProps) {
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const errors = state.errors ?? {};
  const values = state.values ?? {};
  const verseEnd = values.verseEnd ?? (initial?.verseEnd ? String(initial.verseEnd) : "");
  const uid = verseKey.replace(/:/g, "-");
  const id = (name: string) => `note-${uid}-${name}`;

  return (
    <form action={formAction} className={compact ? "space-y-3" : "space-y-5"}>
      <FormMessage state={state} />
      <input type="hidden" name="verseKey" value={verseKey} />
      {next ? <input type="hidden" name="next" value={next} /> : null}

      {reference ? (
        <p className="text-muted-foreground text-sm">
          Notiz zu <span className="text-foreground font-medium">{reference}</span>
        </p>
      ) : null}

      <div className={compact ? "grid gap-3 sm:grid-cols-[1fr_7rem]" : "grid gap-5 sm:grid-cols-[1fr_9rem]"}>
        <Field label="Titel" htmlFor={id("title")} hint="Optional." error={errors.title}>
          <Input
            id={id("title")}
            name="title"
            type="text"
            maxLength={120}
            defaultValue={values.title ?? initial?.title ?? ""}
            aria-invalid={errors.title ? true : undefined}
            aria-describedby={errors.title ? `${id("title")}-error` : `${id("title")}-hint`}
          />
        </Field>
        <Field label="Bis Vers" htmlFor={id("verseEnd")} hint="Optional." error={errors.verseEnd}>
          <Input
            id={id("verseEnd")}
            name="verseEnd"
            type="number"
            inputMode="numeric"
            min={1}
            max={999}
            defaultValue={verseEnd}
            aria-invalid={errors.verseEnd ? true : undefined}
            aria-describedby={errors.verseEnd ? `${id("verseEnd")}-error` : `${id("verseEnd")}-hint`}
          />
        </Field>
      </div>

      <Field
        label="Notiz"
        htmlFor={id("body")}
        hint="Markdown ist möglich. Bibelstellen werden automatisch verlinkt."
        error={errors.body}
        required
      >
        <Textarea
          id={id("body")}
          name="body"
          required
          maxLength={5000}
          rows={compact ? 4 : 8}
          defaultValue={values.body ?? initial?.body ?? ""}
          aria-invalid={errors.body ? true : undefined}
          aria-describedby={errors.body ? `${id("body")}-error` : `${id("body")}-hint`}
        />
      </Field>

      <Field label="Wer darf die Notiz sehen?" htmlFor={id("visibility")} error={errors.visibility}>
        <Select
          id={id("visibility")}
          name="visibility"
          defaultValue={values.visibility ?? initial?.visibility ?? "PRIVATE"}
          aria-invalid={errors.visibility ? true : undefined}
          aria-describedby={errors.visibility ? `${id("visibility")}-error` : undefined}
        >
          {NOTE_VISIBILITIES.map((v) => (
            <option key={v} value={v}>
              {NOTE_VISIBILITY_LABELS[v].label} – {NOTE_VISIBILITY_LABELS[v].hint}
            </option>
          ))}
        </Select>
      </Field>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" loading={pending}>
          {submitLabel}
        </Button>
        {secondaryAction}
      </div>
    </form>
  );
}
