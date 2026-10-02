"use client";

import Link from "next/link";
import { useActionState, useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { FormMessage } from "@/components/auth/form-message";
import { Button, buttonClasses } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { initialActionState, type ActionState } from "@/lib/action-state";
import { POST_KINDS, POST_KIND_LABELS, POST_VISIBILITIES, type PostKindValue, type PostVisibility } from "@/lib/validation/community";
import { VISIBILITY_LABELS } from "@/lib/visibility";
import { cn } from "@/lib/utils";

export interface ComposeDefaults {
  kind?: PostKindValue;
  title?: string;
  body?: string;
  verseRef?: string;
  visibility?: PostVisibility;
  groupId?: string;
}

export interface PostComposeProps {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  /** Groups the member may post into (shown for GROUP visibility). */
  groups: { id: string; name: string }[];
  /** `inline`: compact box in a feed that resets after posting. `full`: own page, redirects on success. */
  mode: "inline" | "full";
  defaults?: ComposeDefaults;
  /** Group page: posts go to this group only. */
  lockedGroup?: { id: string; name: string };
  submitLabel?: string;
  cancelHref?: string;
  /** Full mode: where to go after posting (defaults to the new post). */
  returnTo?: string;
  className?: string;
}

const TITLE_REQUIRED: readonly PostKindValue[] = ["TESTIMONY", "QUESTION"];

function SelectWithChevron({ className, ...props }: React.ComponentProps<typeof Select>) {
  return (
    <div className="relative">
      <Select className={className} {...props} />
      <ChevronDown aria-hidden="true" className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

/** Compose / edit form for posts, used inline in feeds and on the full page. */
export function PostCompose({ action, groups, mode, defaults = {}, lockedGroup, submitLabel, cancelHref, returnTo, className }: PostComposeProps) {
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const id = useId();
  const errors = state.errors ?? {};
  const values = state.ok ? {} : (state.values ?? {});
  const initialKind = (values.kind as PostKindValue | undefined) ?? defaults.kind ?? "POST";
  const initialVisibility = lockedGroup ? "GROUP" : ((values.visibility as PostVisibility | undefined) ?? defaults.visibility ?? "MEMBERS");
  const [kind, setKind] = useState<PostKindValue>(initialKind);
  const [visibility, setVisibility] = useState<PostVisibility>(initialVisibility);
  const titleRequired = TITLE_REQUIRED.includes(kind);
  const inline = mode === "inline";
  // A successful inline post returns a nonce; the key remounts the form so every field resets.
  const formKey = state.ok && typeof state.data?.nonce === "number" ? state.data.nonce : 0;
  const visibilities = groups.length > 0 || lockedGroup ? POST_VISIBILITIES : POST_VISIBILITIES.filter((v) => v !== "GROUP");

  return (
    <form key={formKey} action={formAction} className={cn("space-y-4", className)}>
      {inline ? <input type="hidden" name="mode" value="inline" /> : null}
      {returnTo ? <input type="hidden" name="returnTo" value={returnTo} /> : null}
      {lockedGroup ? (
        <>
          <input type="hidden" name="visibility" value="GROUP" />
          <input type="hidden" name="groupId" value={lockedGroup.id} />
        </>
      ) : null}

      <FormMessage state={state} />

      <Field label="Dein Text" htmlFor={`${id}-body`} error={errors.body} hint={inline ? undefined : "Markdown ist erlaubt. Bibelstellen wie „Joh 3,16“ werden automatisch verlinkt."}>
        <Textarea
          id={`${id}-body`}
          name="body"
          required
          minLength={3}
          maxLength={8000}
          rows={inline ? 3 : 10}
          placeholder={inline ? "Was bewegt dich gerade?" : undefined}
          defaultValue={values.body ?? defaults.body ?? ""}
          aria-invalid={errors.body ? true : undefined}
          aria-describedby={errors.body ? `${id}-body-error` : inline ? undefined : `${id}-body-hint`}
          className={inline ? "min-h-20" : undefined}
        />
      </Field>

      <div className={cn("grid gap-4", inline ? "sm:grid-cols-2" : "sm:grid-cols-2")}>
        <Field label="Art" htmlFor={`${id}-kind`} error={errors.kind} hint={POST_KIND_LABELS[kind].description}>
          <SelectWithChevron
            id={`${id}-kind`}
            name="kind"
            value={kind}
            onChange={(e) => setKind(e.target.value as PostKindValue)}
            aria-invalid={errors.kind ? true : undefined}
            aria-describedby={errors.kind ? `${id}-kind-error` : `${id}-kind-hint`}
          >
            {POST_KINDS.map((k) => (
              <option key={k} value={k}>
                {POST_KIND_LABELS[k].label}
              </option>
            ))}
          </SelectWithChevron>
        </Field>

        <Field label={titleRequired ? "Titel" : "Titel (optional)"} htmlFor={`${id}-title`} error={errors.title} required={titleRequired}>
          <Input
            id={`${id}-title`}
            name="title"
            type="text"
            required={titleRequired}
            maxLength={120}
            placeholder={kind === "QUESTION" ? "Worum geht es in deiner Frage?" : kind === "TESTIMONY" ? "Was hat Gott getan?" : undefined}
            defaultValue={values.title ?? defaults.title ?? ""}
            aria-invalid={errors.title ? true : undefined}
            aria-describedby={errors.title ? `${id}-title-error` : undefined}
          />
        </Field>

        <Field label="Bibelstelle (optional)" htmlFor={`${id}-verse`} error={errors.verseRef} hint="Der Vers wird unter deinem Beitrag zitiert.">
          <Input
            id={`${id}-verse`}
            name="verseRef"
            type="text"
            maxLength={60}
            placeholder="z. B. Röm 8,28"
            autoComplete="off"
            defaultValue={values.verseRef ?? defaults.verseRef ?? ""}
            aria-invalid={errors.verseRef ? true : undefined}
            aria-describedby={errors.verseRef ? `${id}-verse-error` : `${id}-verse-hint`}
          />
        </Field>

        {lockedGroup ? (
          <Field label="Sichtbarkeit" htmlFor={`${id}-visibility-locked`} hint={`Nur für Mitglieder von „${lockedGroup.name}“ sichtbar.`}>
            <Input id={`${id}-visibility-locked`} type="text" value="Nur Gruppe" readOnly aria-describedby={`${id}-visibility-locked-hint`} />
          </Field>
        ) : (
          <Field label="Wer darf das sehen?" htmlFor={`${id}-visibility`} error={errors.visibility} hint={VISIBILITY_LABELS[visibility].hint}>
            <SelectWithChevron
              id={`${id}-visibility`}
              name="visibility"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as PostVisibility)}
              aria-invalid={errors.visibility ? true : undefined}
              aria-describedby={errors.visibility ? `${id}-visibility-error` : `${id}-visibility-hint`}
            >
              {visibilities.map((v) => (
                <option key={v} value={v}>
                  {VISIBILITY_LABELS[v].label}
                </option>
              ))}
            </SelectWithChevron>
          </Field>
        )}

        {!lockedGroup && visibility === "GROUP" ? (
          <Field label="Gruppe" htmlFor={`${id}-group`} error={errors.groupId} required className="sm:col-span-2">
            <SelectWithChevron
              id={`${id}-group`}
              name="groupId"
              required
              defaultValue={values.groupId ?? defaults.groupId ?? ""}
              aria-invalid={errors.groupId ? true : undefined}
              aria-describedby={errors.groupId ? `${id}-group-error` : undefined}
            >
              <option value="" disabled>
                Bitte wählen …
              </option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </SelectWithChevron>
          </Field>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" loading={pending}>
          {submitLabel ?? (inline ? "Teilen" : "Veröffentlichen")}
        </Button>
        {cancelHref ? (
          <Link href={cancelHref} className={buttonClasses("ghost")}>
            Abbrechen
          </Link>
        ) : null}
        {inline && state.ok && typeof state.data?.href === "string" ? (
          <Link href={state.data.href} className="text-sm text-primary hover:underline">
            Beitrag ansehen
          </Link>
        ) : null}
      </div>
    </form>
  );
}
