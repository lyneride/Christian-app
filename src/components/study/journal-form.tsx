"use client";

import { useActionState } from "react";
import { initialActionState, type ActionState } from "@/lib/action-state";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { FormMessage } from "@/components/auth/form-message";

export interface JournalFormProps {
  /** `createJournalEntry` or `updateJournalEntry.bind(null, id)` */
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  initial: {
    /** "YYYY-MM-DD" */
    date: string;
    title?: string | null;
    body?: string;
    gratitude?: string | null;
    prayer?: string | null;
    /** typed reference such as "Psalm 23,1" */
    verse?: string;
  };
  submitLabel?: string;
  secondaryAction?: React.ReactNode;
}

export function JournalForm({ action, initial, submitLabel = "Eintrag speichern", secondaryAction }: JournalFormProps) {
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const errors = state.errors ?? {};
  const values = state.values ?? {};
  const describedBy = (name: string, hasHint: boolean) =>
    errors[name] ? `${name}-error` : hasHint ? `${name}-hint` : undefined;

  return (
    <form action={formAction} className="space-y-6">
      <FormMessage state={state} />

      <div className="grid gap-6 sm:grid-cols-[12rem_1fr]">
        <Field label="Datum" htmlFor="date" error={errors.date} required>
          <Input
            id="date"
            name="date"
            type="date"
            required
            defaultValue={values.date ?? initial.date}
            aria-invalid={errors.date ? true : undefined}
            aria-describedby={describedBy("date", false)}
          />
        </Field>
        <Field label="Titel" htmlFor="title" hint="Optional – ein paar Worte, die den Tag zusammenfassen." error={errors.title}>
          <Input
            id="title"
            name="title"
            type="text"
            maxLength={120}
            defaultValue={values.title ?? initial.title ?? ""}
            aria-invalid={errors.title ? true : undefined}
            aria-describedby={describedBy("title", true)}
          />
        </Field>
      </div>

      <Field label="Was bewegt mich" htmlFor="body" hint="Gedanken, Erlebnisse, Fragen. Markdown ist möglich." error={errors.body} required>
        <Textarea
          id="body"
          name="body"
          required
          rows={10}
          maxLength={10_000}
          defaultValue={values.body ?? initial.body ?? ""}
          aria-invalid={errors.body ? true : undefined}
          aria-describedby={describedBy("body", true)}
        />
      </Field>

      <Field label="Wofür ich dankbar bin" htmlFor="gratitude" hint="Optional." error={errors.gratitude}>
        <Textarea
          id="gratitude"
          name="gratitude"
          rows={4}
          maxLength={2000}
          className="min-h-20"
          defaultValue={values.gratitude ?? initial.gratitude ?? ""}
          aria-invalid={errors.gratitude ? true : undefined}
          aria-describedby={describedBy("gratitude", true)}
        />
      </Field>

      <Field label="Mein Gebet" htmlFor="prayer" hint="Optional." error={errors.prayer}>
        <Textarea
          id="prayer"
          name="prayer"
          rows={4}
          maxLength={2000}
          className="min-h-20"
          defaultValue={values.prayer ?? initial.prayer ?? ""}
          aria-invalid={errors.prayer ? true : undefined}
          aria-describedby={describedBy("prayer", true)}
        />
      </Field>

      <Field label="Bibelstelle" htmlFor="verse" hint="Optional, z. B. Psalm 23,1 – wird mit dem Vers angezeigt." error={errors.verse}>
        <Input
          id="verse"
          name="verse"
          type="text"
          maxLength={60}
          autoComplete="off"
          placeholder="Psalm 23,1"
          defaultValue={values.verse ?? initial.verse ?? ""}
          aria-invalid={errors.verse ? true : undefined}
          aria-describedby={describedBy("verse", true)}
        />
      </Field>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" loading={pending} size="lg">
          {submitLabel}
        </Button>
        {secondaryAction}
      </div>
    </form>
  );
}
