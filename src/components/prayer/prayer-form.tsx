"use client";

import { useActionState, useState } from "react";
import { ChevronDown } from "lucide-react";
import { createPrayerRequest, updatePrayerRequest } from "@/app/(site)/gebet/actions";
import { FormMessage } from "@/components/auth/form-message";
import { Button, ButtonLink } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/input";
import { initialActionState } from "@/lib/action-state";
import {
  CATEGORY_LABELS,
  PRAYER_CATEGORIES,
  PRAYER_VISIBILITIES,
  isPrayerCategory,
  type PrayerCategory,
  type PrayerVisibility,
} from "@/lib/validation/prayer";
import { VISIBILITY_LABELS } from "@/lib/visibility";

export interface PrayerFormInitial {
  title: string;
  body: string;
  category: string;
  visibility: PrayerVisibility;
  groupId: string | null;
  isAnonymous: boolean;
}

export interface PrayerFormProps {
  /** Groups the user may post into (active memberships). */
  groups: { id: string; name: string }[];
  /** Set for editing an existing request. */
  requestId?: string;
  initial?: PrayerFormInitial;
}

function SelectWithChevron({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown
        aria-hidden="true"
        className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
      />
    </div>
  );
}

export function PrayerForm({ groups, requestId, initial }: PrayerFormProps) {
  const action = requestId ? updatePrayerRequest.bind(null, requestId) : createPrayerRequest;
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const errors = state.errors ?? {};
  const values = state.values ?? {};

  const initialCategory = isPrayerCategory(values.category ?? initial?.category)
    ? (values.category ?? initial?.category)
    : "allgemein";
  const [category, setCategory] = useState<PrayerCategory>(initialCategory as PrayerCategory);

  const visibilities = groups.length > 0 ? PRAYER_VISIBILITIES : PRAYER_VISIBILITIES.filter((v) => v !== "GROUP");
  const initialVisibility = (values.visibility ?? initial?.visibility ?? "MEMBERS") as PrayerVisibility;
  const [visibility, setVisibility] = useState<PrayerVisibility>(
    (visibilities as readonly string[]).includes(initialVisibility) ? initialVisibility : "MEMBERS",
  );

  const isAnonymous = "isAnonymous" in values ? values.isAnonymous === "on" : (initial?.isAnonymous ?? false);

  return (
    <form action={formAction} className="space-y-6">
      <FormMessage state={state} />

      <Field label="Worum geht es?" htmlFor="title" error={errors.title} required>
        <Input
          id="title"
          name="title"
          type="text"
          required
          minLength={3}
          maxLength={120}
          placeholder="z. B. Kraft für die Prüfungswoche"
          defaultValue={values.title ?? initial?.title ?? ""}
          aria-invalid={errors.title ? true : undefined}
          aria-describedby={errors.title ? "title-error" : undefined}
        />
      </Field>

      <Field
        label="Dein Anliegen"
        htmlFor="body"
        hint="Schreib so viel oder so wenig, wie du magst. Bibelstellen wie „Ps 23,1“ werden automatisch verlinkt."
        error={errors.body}
        required
      >
        <Textarea
          id="body"
          name="body"
          required
          minLength={10}
          maxLength={4000}
          rows={8}
          defaultValue={values.body ?? initial?.body ?? ""}
          aria-invalid={errors.body ? true : undefined}
          aria-describedby={errors.body ? "body-error" : "body-hint"}
        />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          label="Kategorie"
          htmlFor="category"
          hint={CATEGORY_LABELS[category].description}
          error={errors.category}
        >
          <SelectWithChevron>
            <Select
              id="category"
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as PrayerCategory)}
              aria-invalid={errors.category ? true : undefined}
              aria-describedby={errors.category ? "category-error" : "category-hint"}
            >
              {PRAYER_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c].label}
                </option>
              ))}
            </Select>
          </SelectWithChevron>
        </Field>

        <Field
          label="Wer darf es sehen?"
          htmlFor="visibility"
          hint={VISIBILITY_LABELS[visibility].hint}
          error={errors.visibility}
        >
          <SelectWithChevron>
            <Select
              id="visibility"
              name="visibility"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as PrayerVisibility)}
              aria-invalid={errors.visibility ? true : undefined}
              aria-describedby={errors.visibility ? "visibility-error" : "visibility-hint"}
            >
              {visibilities.map((v) => (
                <option key={v} value={v}>
                  {VISIBILITY_LABELS[v].label}
                </option>
              ))}
            </Select>
          </SelectWithChevron>
        </Field>
      </div>

      {visibility === "GROUP" ? (
        <Field label="Gruppe" htmlFor="groupId" error={errors.groupId} required>
          <SelectWithChevron>
            <Select
              id="groupId"
              name="groupId"
              required
              defaultValue={values.groupId ?? initial?.groupId ?? groups[0]?.id ?? ""}
              aria-invalid={errors.groupId ? true : undefined}
              aria-describedby={errors.groupId ? "groupId-error" : undefined}
            >
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </Select>
          </SelectWithChevron>
        </Field>
      ) : null}

      <div className="space-y-1.5">
        <label htmlFor="isAnonymous" className="text-foreground flex items-start gap-2.5 text-sm">
          <Checkbox
            id="isAnonymous"
            name="isAnonymous"
            defaultChecked={isAnonymous}
            className="mt-0.5"
            aria-describedby="isAnonymous-hint"
          />
          <span>Anonym teilen</span>
        </label>
        <p id="isAnonymous-hint" className="text-muted-foreground pl-6.5 text-xs">
          Nur Moderatoren sehen, von wem das Anliegen stammt.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Button type="submit" loading={pending} size="lg">
          {requestId ? "Änderungen speichern" : "Anliegen teilen"}
        </Button>
        <ButtonLink href={requestId ? `/gebet/${requestId}` : "/gebet"} variant="ghost" size="lg">
          Abbrechen
        </ButtonLink>
      </div>
    </form>
  );
}
