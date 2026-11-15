"use client";

import Link from "next/link";
import { useActionState, useId, useRef, useState } from "react";
import { Camera, Trash2 } from "lucide-react";
import { FormMessage } from "@/components/auth/form-message";
import { Button, buttonClasses } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { AvatarCropper } from "@/components/settings/avatar-cropper";
import { GroupAvatar } from "./group-avatar";
import { initialActionState, type ActionState } from "@/lib/action-state";
import {
  GROUP_KINDS,
  GROUP_KIND_LABELS,
  GROUP_VISIBILITIES,
  GROUP_VISIBILITY_LABELS,
  type GroupImageAction,
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

/**
 * Group picture: choose a photo and crop it, just like the profile picture.
 * The cropped JPEG is attached to the form data on submit (see GroupForm).
 */
function GroupImageField({
  name,
  current,
  preview,
  action,
  onChange,
  error,
}: {
  name: string;
  current: string | null;
  /** object URL of the newly chosen, cropped picture */
  preview: string | null;
  action: GroupImageAction;
  onChange: (image: Blob | null, action: GroupImageAction) => void;
  error?: string[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const shown = action === "replace" ? preview : action === "remove" ? null : current;

  return (
    <fieldset className="space-y-2">
      <legend className="font-display text-sm font-extrabold">Gruppenbild (freiwillig)</legend>
      <input type="hidden" name="imageAction" value={action} />
      {file ? (
        <AvatarCropper
          file={file}
          shape="rounded"
          label="Gruppenbild zuschneiden"
          onCancel={() => setFile(null)}
          onConfirm={(blob) => {
            setFile(null);
            onChange(blob, "replace");
          }}
        />
      ) : (
        <div className="flex flex-wrap items-center gap-4">
          <GroupAvatar name={name || "Gruppe"} src={shown} size="lg" />
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
              onChange={(e) => {
                const f = e.currentTarget.files?.[0];
                if (f) setFile(f);
                e.currentTarget.value = "";
              }}
            />
            <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
              <Camera aria-hidden="true" /> {shown ? "Anderes Bild" : "Bild auswählen"}
            </Button>
            {shown ? (
              <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null, current ? "remove" : "keep")}>
                <Trash2 aria-hidden="true" /> Entfernen
              </Button>
            ) : action === "remove" ? (
              <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null, "keep")}>
                Doch behalten
              </Button>
            ) : null}
          </div>
        </div>
      )}
      <p className="text-muted-foreground text-xs">Ein Foto von deinem Handy – du wählst den Ausschnitt selbst.</p>
      {error?.length ? (
        <p role="alert" className="text-danger text-xs font-medium">
          {error.join(" ")}
        </p>
      ) : null}
    </fieldset>
  );
}

/** Create / edit form for a group. */
export function GroupForm({ action, defaults = {}, submitLabel, cancelHref }: Props) {
  const image = useRef<Blob | null>(null);
  const [imageState, setImageState] = useState<{ preview: string | null; action: GroupImageAction }>({ preview: null, action: "keep" });
  const [state, formAction, pending] = useActionState(async (prev: ActionState, formData: FormData) => {
    if (image.current) formData.set("image", new File([image.current], "gruppenbild.jpg", { type: "image/jpeg" }));
    return action(prev, formData);
  }, initialActionState);
  const id = useId();
  const [name, setName] = useState(defaults.name ?? "");
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
          onChange={(e) => setName(e.currentTarget.value)}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? `${id}-name-error` : undefined}
        />
      </Field>

      <GroupImageField
        name={values.name ?? name}
        current={defaults.imageUrl ?? null}
        preview={imageState.preview}
        action={imageState.action}
        error={errors.image}
        onChange={(blob, next) => {
          image.current = blob;
          if (imageState.preview) URL.revokeObjectURL(imageState.preview);
          setImageState({ preview: blob ? URL.createObjectURL(blob) : null, action: next });
        }}
      />

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
