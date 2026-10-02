"use client";

import { useActionState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, Select, Textarea } from "@/components/ui/input";
import { FormMessage } from "@/components/auth/form-message";
import { initialActionState } from "@/lib/action-state";
import {
  reactivateUser,
  removeContent,
  resolveReport,
  restoreContent,
  setUserRole,
  suspendUser,
} from "@/lib/moderation/admin-actions";
import { ROLE_LABELS, USER_ROLES, type UserRoleValue } from "@/lib/validation/admin";

/**
 * Client forms for the moderation actions. Every destructive step asks for a
 * confirmation; results come back as `ActionState` via `useActionState`.
 */

function confirmOnSubmit(message: string) {
  return (e: FormEvent<HTMLFormElement>) => {
    if (!window.confirm(message)) e.preventDefault();
  };
}

// ---------------------------------------------------------------------------
// Meldung abschließen
// ---------------------------------------------------------------------------

export function ResolveReportForm({ reportId }: { reportId: string }) {
  const [state, formAction, pending] = useActionState(resolveReport.bind(null, reportId), initialActionState);
  const errors = state.errors ?? {};
  const id = `resolution-${reportId}`;

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const message =
      submitter?.value === "DISMISSED"
        ? "Meldung abweisen? Die meldende Person erfährt, dass kein Verstoß festgestellt wurde."
        : "Meldung als erledigt markieren? Die meldende Person wird benachrichtigt.";
    if (!window.confirm(message)) e.preventDefault();
  };

  return (
    <form action={formAction} onSubmit={onSubmit} className="space-y-4">
      <FormMessage state={state} />
      <Field label="Notiz zur Entscheidung" htmlFor={id} hint="Intern, nur für die Moderation sichtbar. Optional." error={errors.resolution}>
        <Textarea
          id={id}
          name="resolution"
          rows={3}
          maxLength={1000}
          aria-invalid={errors.resolution ? true : undefined}
          aria-describedby={errors.resolution ? `${id}-error` : `${id}-hint`}
        />
      </Field>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" name="status" value="RESOLVED" loading={pending}>
          Erledigt
        </Button>
        <Button type="submit" name="status" value="DISMISSED" variant="outline" disabled={pending}>
          Abweisen
        </Button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Inhalt entfernen / wiederherstellen
// ---------------------------------------------------------------------------

export function RemoveContentForm({ targetType, targetId }: { targetType: string; targetId: string }) {
  const [state, formAction, pending] = useActionState(removeContent.bind(null, targetType, targetId), initialActionState);
  const errors = state.errors ?? {};
  const id = `reason-${targetType}-${targetId}`;
  const isGroup = targetType === "group";

  return (
    <form
      action={formAction}
      onSubmit={confirmOnSubmit(
        isGroup
          ? "Gruppe verbergen? Sie ist danach nur noch für die Gründerin/den Gründer sichtbar."
          : "Inhalt entfernen? Das Mitglied erhält eine Benachrichtigung mit deiner Begründung.",
      )}
      className="space-y-4"
    >
      <FormMessage state={state} />
      <Field label="Begründung" htmlFor={id} hint="Wird dem Mitglied mitgeteilt. Bitte sachlich und konkret." required error={errors.reason}>
        <Textarea
          id={id}
          name="reason"
          rows={3}
          required
          minLength={3}
          maxLength={500}
          aria-invalid={errors.reason ? true : undefined}
          aria-describedby={errors.reason ? `${id}-error` : `${id}-hint`}
        />
      </Field>
      <Button type="submit" variant="danger" loading={pending}>
        {isGroup ? "Gruppe verbergen" : "Inhalt entfernen"}
      </Button>
    </form>
  );
}

export function RestoreContentForm({ targetType, targetId }: { targetType: string; targetId: string }) {
  const [state, formAction, pending] = useActionState(() => restoreContent(targetType, targetId), initialActionState);
  return (
    <form action={formAction} onSubmit={confirmOnSubmit("Inhalt wiederherstellen? Er ist danach wieder sichtbar.")} className="space-y-4">
      <FormMessage state={state} />
      <Button type="submit" variant="outline" loading={pending}>
        Wiederherstellen
      </Button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Mitglied sperren / reaktivieren / Rolle
// ---------------------------------------------------------------------------

export function SuspendUserForm({ userId, name }: { userId: string; name: string }) {
  const [state, formAction, pending] = useActionState(suspendUser.bind(null, userId), initialActionState);
  const errors = state.errors ?? {};
  const id = `suspend-reason-${userId}`;
  return (
    <form
      action={formAction}
      onSubmit={confirmOnSubmit(`${name} sperren? Alle Sitzungen werden beendet, eine Anmeldung ist nicht mehr möglich.`)}
      className="space-y-4"
    >
      <FormMessage state={state} />
      <Field label="Begründung" htmlFor={id} hint="Wird dem Mitglied nach einer Aufhebung angezeigt." required error={errors.reason}>
        <Textarea
          id={id}
          name="reason"
          rows={3}
          required
          minLength={3}
          maxLength={500}
          aria-invalid={errors.reason ? true : undefined}
          aria-describedby={errors.reason ? `${id}-error` : `${id}-hint`}
        />
      </Field>
      <Button type="submit" variant="danger" loading={pending}>
        Mitglied sperren
      </Button>
    </form>
  );
}

export function ReactivateUserForm({ userId, name }: { userId: string; name: string }) {
  const [state, formAction, pending] = useActionState(() => reactivateUser(userId), initialActionState);
  return (
    <form action={formAction} onSubmit={confirmOnSubmit(`Sperre von ${name} aufheben?`)} className="space-y-4">
      <FormMessage state={state} />
      <Button type="submit" variant="outline" loading={pending}>
        Sperre aufheben
      </Button>
    </form>
  );
}

export function SetRoleForm({ userId, currentRole }: { userId: string; currentRole: UserRoleValue }) {
  const [state, formAction, pending] = useActionState(setUserRole.bind(null, userId), initialActionState);
  const errors = state.errors ?? {};
  const id = `role-${userId}`;
  return (
    <form action={formAction} onSubmit={confirmOnSubmit("Rolle ändern? Das Mitglied wird benachrichtigt.")} className="space-y-4">
      <FormMessage state={state} />
      <Field label="Rolle" htmlFor={id} hint="Moderation darf Inhalte und Mitglieder verwalten; Administration zusätzlich Rollen." error={errors.role}>
        <Select
          id={id}
          name="role"
          defaultValue={currentRole}
          aria-invalid={errors.role ? true : undefined}
          aria-describedby={errors.role ? `${id}-error` : `${id}-hint`}
        >
          {USER_ROLES.map((role) => (
            <option key={role} value={role}>
              {ROLE_LABELS[role]}
            </option>
          ))}
        </Select>
      </Field>
      <Button type="submit" variant="secondary" loading={pending}>
        Rolle speichern
      </Button>
    </form>
  );
}
