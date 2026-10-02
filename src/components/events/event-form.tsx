"use client";

import { useActionState, useState } from "react";
import { ChevronDown } from "lucide-react";
import { createEvent, updateEvent } from "@/app/(site)/veranstaltungen/actions";
import { FormMessage } from "@/components/auth/form-message";
import { Button, ButtonLink } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/input";
import { initialActionState } from "@/lib/action-state";
import { EVENT_VISIBILITIES, type EventVisibility } from "@/lib/validation/events";
import { VISIBILITY_LABELS } from "@/lib/visibility";

export interface EventFormInitial {
  title: string;
  description: string;
  /** datetime-local values in Europe/Berlin ("2026-10-09T19:30"). */
  startsAt: string;
  endsAt: string;
  isOnline: boolean;
  onlineUrl: string;
  location: string;
  city: string;
  visibility: EventVisibility;
  groupId: string | null;
  capacity: string;
}

export interface EventFormProps {
  /** Groups the user may plan for (active memberships). */
  groups: { id: string; name: string }[];
  /** Set for editing an existing event. */
  eventId?: string;
  initial?: Partial<EventFormInitial>;
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

function isVisibility(value: unknown): value is EventVisibility {
  return typeof value === "string" && (EVENT_VISIBILITIES as readonly string[]).includes(value);
}

export function EventForm({ groups, eventId, initial }: EventFormProps) {
  const action = eventId ? updateEvent.bind(null, eventId) : createEvent;
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const errors = state.errors ?? {};
  const values = state.values ?? {};
  const value = (key: keyof EventFormInitial, fallback = "") => values[key] ?? initial?.[key] ?? fallback;

  const [isOnline, setIsOnline] = useState<boolean>(
    "isOnline" in values ? values.isOnline === "on" : (initial?.isOnline ?? false),
  );

  const visibilities = groups.length > 0 ? EVENT_VISIBILITIES : EVENT_VISIBILITIES.filter((v) => v !== "GROUP");
  const initialVisibility = values.visibility ?? initial?.visibility ?? "PUBLIC";
  const [visibility, setVisibility] = useState<EventVisibility>(
    isVisibility(initialVisibility) && (visibilities as readonly string[]).includes(initialVisibility)
      ? initialVisibility
      : "PUBLIC",
  );

  const describedBy = (key: string, hint?: boolean) =>
    errors[key] ? `${key}-error` : hint ? `${key}-hint` : undefined;

  return (
    <form action={formAction} className="space-y-6">
      <FormMessage state={state} />

      <Field label="Titel" htmlFor="title" error={errors.title} required>
        <Input
          id="title"
          name="title"
          type="text"
          required
          minLength={3}
          maxLength={120}
          placeholder="z. B. Bibelabend: Römer 8"
          defaultValue={value("title")}
          aria-invalid={errors.title ? true : undefined}
          aria-describedby={describedBy("title")}
        />
      </Field>

      <Field
        label="Worum geht es?"
        htmlFor="description"
        hint="Ablauf, Mitbringen, für wen es gedacht ist. Bibelstellen wie „Röm 8,28“ werden automatisch verlinkt."
        error={errors.description}
        required
      >
        <Textarea
          id="description"
          name="description"
          required
          minLength={10}
          maxLength={4000}
          rows={8}
          defaultValue={value("description")}
          aria-invalid={errors.description ? true : undefined}
          aria-describedby={describedBy("description", true)}
        />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Beginn" htmlFor="startsAt" hint="Uhrzeit in deutscher Zeit." error={errors.startsAt} required>
          <Input
            id="startsAt"
            name="startsAt"
            type="datetime-local"
            required
            defaultValue={value("startsAt")}
            aria-invalid={errors.startsAt ? true : undefined}
            aria-describedby={describedBy("startsAt", true)}
          />
        </Field>
        <Field label="Ende (optional)" htmlFor="endsAt" error={errors.endsAt}>
          <Input
            id="endsAt"
            name="endsAt"
            type="datetime-local"
            defaultValue={value("endsAt")}
            aria-invalid={errors.endsAt ? true : undefined}
            aria-describedby={describedBy("endsAt")}
          />
        </Field>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="isOnline" className="text-foreground flex items-start gap-2.5 text-sm">
          <Checkbox
            id="isOnline"
            name="isOnline"
            checked={isOnline}
            onChange={(e) => setIsOnline(e.target.checked)}
            className="mt-0.5"
            aria-describedby="isOnline-hint"
          />
          <span>Online-Treffen</span>
        </label>
        <p id="isOnline-hint" className="text-muted-foreground pl-6.5 text-xs">
          Per Video oder Telefon statt an einem Ort.
        </p>
      </div>

      {isOnline ? (
        <Field
          label="Link zum Treffen"
          htmlFor="onlineUrl"
          hint="Nur angemeldete Mitglieder sehen den Link."
          error={errors.onlineUrl}
          required
        >
          <Input
            id="onlineUrl"
            name="onlineUrl"
            type="url"
            inputMode="url"
            placeholder="https://…"
            required
            maxLength={500}
            defaultValue={value("onlineUrl")}
            aria-invalid={errors.onlineUrl ? true : undefined}
            aria-describedby={describedBy("onlineUrl", true)}
          />
        </Field>
      ) : (
        <div className="grid gap-6 sm:grid-cols-[2fr_1fr]">
          <Field label="Ort" htmlFor="location" hint="Adresse oder Treffpunkt." error={errors.location} required>
            <Input
              id="location"
              name="location"
              type="text"
              required
              minLength={2}
              maxLength={200}
              placeholder="z. B. Gemeindehaus, Kirchstraße 3"
              defaultValue={value("location")}
              aria-invalid={errors.location ? true : undefined}
              aria-describedby={describedBy("location", true)}
            />
          </Field>
          <Field label="Stadt" htmlFor="city" error={errors.city} required>
            <Input
              id="city"
              name="city"
              type="text"
              required
              minLength={2}
              maxLength={80}
              autoComplete="address-level2"
              defaultValue={value("city")}
              aria-invalid={errors.city ? true : undefined}
              aria-describedby={describedBy("city")}
            />
          </Field>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
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
              onChange={(e) => setVisibility(e.target.value as EventVisibility)}
              aria-invalid={errors.visibility ? true : undefined}
              aria-describedby={describedBy("visibility", true)}
            >
              {visibilities.map((v) => (
                <option key={v} value={v}>
                  {VISIBILITY_LABELS[v].label}
                </option>
              ))}
            </Select>
          </SelectWithChevron>
        </Field>

        {groups.length > 0 ? (
          <Field
            label="Gruppe"
            htmlFor="groupId"
            hint={
              visibility === "GROUP"
                ? "Nur Mitglieder dieser Gruppe sehen das Treffen."
                : "Optional: Das Treffen erscheint bei der Gruppe."
            }
            error={errors.groupId}
            required={visibility === "GROUP"}
          >
            <SelectWithChevron>
              <Select
                id="groupId"
                name="groupId"
                required={visibility === "GROUP"}
                defaultValue={values.groupId ?? initial?.groupId ?? ""}
                aria-invalid={errors.groupId ? true : undefined}
                aria-describedby={describedBy("groupId", true)}
              >
                <option value="">Keine Gruppe</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </Select>
            </SelectWithChevron>
          </Field>
        ) : null}
      </div>

      <Field
        label="Plätze (optional)"
        htmlFor="capacity"
        hint="Leer lassen, wenn es keine Grenze gibt."
        error={errors.capacity}
        className="sm:max-w-xs"
      >
        <Input
          id="capacity"
          name="capacity"
          type="number"
          inputMode="numeric"
          min={1}
          max={10000}
          step={1}
          defaultValue={value("capacity")}
          aria-invalid={errors.capacity ? true : undefined}
          aria-describedby={describedBy("capacity", true)}
        />
      </Field>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Button type="submit" loading={pending} size="lg">
          {eventId ? "Änderungen speichern" : "Treffen veröffentlichen"}
        </Button>
        <ButtonLink href={eventId ? `/veranstaltungen/${eventId}` : "/veranstaltungen"} variant="ghost" size="lg">
          Abbrechen
        </ButtonLink>
      </div>
    </form>
  );
}
