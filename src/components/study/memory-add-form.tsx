"use client";

import { useActionState } from "react";
import { Plus } from "lucide-react";
import { initialActionState } from "@/lib/action-state";
import { addMemoryVerseForm } from "@/lib/study/actions";
import type { TranslationOption } from "@/lib/bible/ui";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { FormMessage } from "@/components/auth/form-message";

export interface MemoryAddFormProps {
  translations: TranslationOption[];
  defaultTranslation: string;
}

/** "Vers hinzufügen": reference + translation; the server fetches the text snapshot. */
export function MemoryAddForm({ translations, defaultTranslation }: MemoryAddFormProps) {
  const [state, formAction, pending] = useActionState(addMemoryVerseForm, initialActionState);
  const errors = state.errors ?? {};
  const values = state.values ?? {};

  return (
    <form action={formAction} className="space-y-4">
      <FormMessage state={state} />
      <div className="grid gap-4 sm:grid-cols-[1fr_14rem_auto] sm:items-end">
        <Field label="Bibelstelle" htmlFor="reference" hint="Ein Vers oder ein kurzer Abschnitt, z. B. Joh 3,16 oder Psalm 23,1-3." error={errors.reference} required>
          <Input
            id="reference"
            name="reference"
            type="text"
            required
            maxLength={60}
            autoComplete="off"
            placeholder="Johannes 3,16"
            defaultValue={values.reference ?? ""}
            aria-invalid={errors.reference ? true : undefined}
            aria-describedby={errors.reference ? "reference-error" : "reference-hint"}
          />
        </Field>
        <Field label="Übersetzung" htmlFor="translation" error={errors.translation}>
          <Select
            id="translation"
            name="translation"
            defaultValue={values.translation ?? defaultTranslation}
            aria-invalid={errors.translation ? true : undefined}
            aria-describedby={errors.translation ? "translation-error" : undefined}
          >
            {translations.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
        </Field>
        <Button type="submit" loading={pending} className="sm:mb-6">
          <Plus aria-hidden="true" />
          Hinzufügen
        </Button>
      </div>
    </form>
  );
}
