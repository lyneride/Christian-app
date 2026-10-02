"use client";

import Link from "next/link";
import { useActionState, useId, useState } from "react";
import { FormMessage } from "@/components/auth/form-message";
import { Button, buttonClasses } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { initialActionState, type ActionState } from "@/lib/action-state";
import {
  GROUP_KINDS,
  GROUP_KIND_LABELS,
  GROUP_VISIBILITIES,
  GROUP_VISIBILITY_LABELS,
  type GroupKindValue,
  type GroupVisibility,
} from "@/lib/validation/groups";
import { cn } from "@/lib/utils";

export interface GroupFormDefaults {
  name?: string;
  description?: string;
  kind?: GroupKindValue;
  city?: string | null;
  visibility?: GroupVisibility;
  imageUrl?: string | null;
}

interface Props {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  defaults?: GroupFormDefaults;
  submitLabel: string;
  cancelHref: string;
}

/** Radio cards for a small set of options with descriptions. */
function RadioCards<T extends string>({
  name,
  legend,
  options,
  labels,
  value,
  onChange,
  error,
}: {
  name: string;
  legend: string;
  options: readonly T[];
  labels: Record<T, { label: string; description: string }>;
  value: T;
  onChange: (v: T) => void;
  error?: string[];
}) {
  const id = useId();
  return (
    <fieldset className="space-y-1.5">
      <legend className="text-sm font-medium">{legend}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((opt) => {
          const l = labels[opt];
          const checked = value === opt;
          return (
            <label
              key={opt}
              className={cn(
                "flex cursor-pointer gap-3 rounded-xl border p-3 text-sm transition",
                checked ? "border-primary bg-primary-soft/50" : "border-border hover:bg-surface-muted",
              )}
            >
              <input type="radio" name={name} value={opt} checked={checked} onChange={() => onChange(opt)} className="mt-1 accent-primary" />
              <span>
                <span className="block font-medium">{l.label}</span>
                <span className="block text-xs text-muted-foreground">{l.description}</span>
              </span>
            </label>
          );
        })}
      </div>
      {error?.length ? (
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-danger">
          {error.join(" ")}
        </p>
      ) : null}
    </fieldset>
  );
}

/** Create / edit form for a group. */
export function GroupForm({ action, defaults = {}, submitLabel, cancelHref }: Props) {
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const id = useId();
  const errors = state.errors ?? {};
  const values = state.values ?? {};
  const [kind, setKind] = useState<GroupKindValue>((values.kind as GroupKindValue | undefined) ?? defaults.kind ?? "ONLINE");
  const [visibility, setVisibility] = useState<GroupVisibility>((values.visibility as GroupVisibility | undefined) ?? defaults.visibility ?? "PUBLIC");

  return (
    <form action={formAction} className="space-y-6">
      <FormMessage state={state} />

      <Field label="Name der Gruppe" htmlFor={`${id}-name`} error={errors.name} required>
        <Input
          id={`${id}-name`}
          name="name"
          type="text"
          required
          minLength={3}
          maxLength={60}
          defaultValue={values.name ?? defaults.name ?? ""}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? `${id}-name-error` : undefined}
        />
      </Field>

      <Field
        label="Worum geht es?"
        htmlFor={`${id}-description`}
        error={errors.description}
        hint="Wer ist eingeladen, wann trefft ihr euch, was macht ihr zusammen? Markdown ist erlaubt."
        required
      >
        <Textarea
          id={`${id}-description`}
          name="description"
          required
          minLength={10}
          maxLength={2000}
          rows={6}
          defaultValue={values.description ?? defaults.description ?? ""}
          aria-invalid={errors.description ? true : undefined}
          aria-describedby={errors.description ? `${id}-description-error` : `${id}-description-hint`}
        />
      </Field>

      <RadioCards name="kind" legend="Wie trefft ihr euch?" options={GROUP_KINDS} labels={GROUP_KIND_LABELS} value={kind} onChange={setKind} error={errors.kind} />

      <Field label={kind === "LOCAL" ? "Stadt" : "Stadt (optional)"} htmlFor={`${id}-city`} error={errors.city} required={kind === "LOCAL"}>
        <Input
          id={`${id}-city`}
          name="city"
          type="text"
          required={kind === "LOCAL"}
          maxLength={80}
          autoComplete="address-level2"
          defaultValue={values.city ?? defaults.city ?? ""}
          aria-invalid={errors.city ? true : undefined}
          aria-describedby={errors.city ? `${id}-city-error` : undefined}
        />
      </Field>

      <RadioCards
        name="visibility"
        legend="Wie kommt man in die Gruppe?"
        options={GROUP_VISIBILITIES}
        labels={GROUP_VISIBILITY_LABELS}
        value={visibility}
        onChange={setVisibility}
        error={errors.visibility}
      />

      <Field label="Bild (optional)" htmlFor={`${id}-image`} error={errors.imageUrl} hint="Adresse eines Bildes, beginnend mit https://">
        <Input
          id={`${id}-image`}
          name="imageUrl"
          type="url"
          maxLength={500}
          placeholder="https://…"
          defaultValue={values.imageUrl ?? defaults.imageUrl ?? ""}
          aria-invalid={errors.imageUrl ? true : undefined}
          aria-describedby={errors.imageUrl ? `${id}-image-error` : `${id}-image-hint`}
        />
      </Field>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" loading={pending}>
          {submitLabel}
        </Button>
        <Link href={cancelHref} className={buttonClasses("ghost")}>
          Abbrechen
        </Link>
      </div>
    </form>
  );
}
