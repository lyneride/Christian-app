"use client";

import { useActionState, useState } from "react";
import { FormMessage } from "@/components/auth/form-message";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/input";
import { initialActionState } from "@/lib/action-state";
import { BIO_MAX, PROFILE_VISIBILITIES } from "@/lib/validation/profile";
import { VISIBILITY_LABELS } from "@/lib/visibility";
import { updateProfile } from "../actions";

export interface ProfileFormValues {
  name: string;
  username: string;
  bio: string;
  location: string;
  church: string;
  profileVisibility: string;
  /** "on" when checked, "" otherwise (mirrors FormData) */
  openForPartner: string;
  preferredTranslation: string;
}

interface Props {
  initial: ProfileFormValues;
  translations: { id: string; name: string; language: "de" | "en" }[];
}

export function ProfileForm({ initial, translations }: Props) {
  const [state, formAction, pending] = useActionState(updateProfile, initialActionState);
  const errors = state.errors ?? {};
  const v: ProfileFormValues = { ...initial, ...(state.values as Partial<ProfileFormValues> | undefined) };
  const [bioLength, setBioLength] = useState(v.bio.length);

  const describedBy = (field: keyof ProfileFormValues, hasHint = true) =>
    errors[field] ? `${field}-error` : hasHint ? `${field}-hint` : undefined;

  return (
    <form action={formAction} className="space-y-5">
      <FormMessage state={state} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" htmlFor="name" hint="So wirst du anderen angezeigt." error={errors.name} required>
          <Input
            id="name"
            name="name"
            autoComplete="name"
            required
            minLength={2}
            maxLength={60}
            defaultValue={v.name}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={describedBy("name")}
          />
        </Field>
        <Field label="Benutzername" htmlFor="username" hint="Nur Buchstaben, Zahlen, . _ - – Teil deiner Profiladresse." error={errors.username} required>
          <Input
            id="username"
            name="username"
            autoComplete="username"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            required
            minLength={3}
            maxLength={30}
            defaultValue={v.username}
            aria-invalid={errors.username ? true : undefined}
            aria-describedby={describedBy("username")}
          />
        </Field>
      </div>

      <Field
        label="Über dich"
        htmlFor="bio"
        hint={`${bioLength} von ${BIO_MAX} Zeichen. Markdown ist erlaubt, Bibelstellen werden automatisch verlinkt.`}
        error={errors.bio}
      >
        <Textarea
          id="bio"
          name="bio"
          maxLength={BIO_MAX}
          defaultValue={v.bio}
          onChange={(e) => setBioLength(e.target.value.length)}
          aria-invalid={errors.bio ? true : undefined}
          aria-describedby={describedBy("bio")}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Ort" htmlFor="location" hint="Stadt oder Region, falls du magst." error={errors.location}>
          <Input id="location" name="location" maxLength={80} defaultValue={v.location} autoComplete="address-level2" aria-invalid={errors.location ? true : undefined} aria-describedby={describedBy("location")} />
        </Field>
        <Field label="Gemeinde" htmlFor="church" hint="Zu welcher Gemeinde du gehörst." error={errors.church}>
          <Input id="church" name="church" maxLength={120} defaultValue={v.church} aria-invalid={errors.church ? true : undefined} aria-describedby={describedBy("church")} />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Wer darf dein Profil sehen?" htmlFor="profileVisibility" hint="Name und Benutzername sind immer sichtbar." error={errors.profileVisibility}>
          <Select
            id="profileVisibility"
            name="profileVisibility"
            defaultValue={v.profileVisibility}
            aria-invalid={errors.profileVisibility ? true : undefined}
            aria-describedby={describedBy("profileVisibility")}
          >
            {PROFILE_VISIBILITIES.map((value) => (
              <option key={value} value={value}>
                {VISIBILITY_LABELS[value].label} – {VISIBILITY_LABELS[value].hint}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Bevorzugte Bibelübersetzung" htmlFor="preferredTranslation" hint="Wird beim Lesen und in Verweisen vorausgewählt." error={errors.preferredTranslation}>
          <Select
            id="preferredTranslation"
            name="preferredTranslation"
            defaultValue={v.preferredTranslation}
            aria-invalid={errors.preferredTranslation ? true : undefined}
            aria-describedby={describedBy("preferredTranslation")}
          >
            {translations.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
                {t.language === "en" ? " (englisch)" : ""}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="openForPartner" className="flex items-start gap-2.5 text-sm text-foreground">
          <Checkbox id="openForPartner" name="openForPartner" defaultChecked={v.openForPartner === "on"} className="mt-0.5" />
          <span>
            <span className="font-medium">Offen für eine Gebetspartnerschaft</span>
            <span className="block text-xs text-muted-foreground">Andere Mitglieder sehen ein Abzeichen auf deinem Profil und können dich anfragen.</span>
          </span>
        </label>
      </div>

      <div className="flex justify-end">
        <Button type="submit" loading={pending}>
          Profil speichern
        </Button>
      </div>
    </form>
  );
}
