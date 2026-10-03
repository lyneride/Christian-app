"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { initialActionState } from "@/lib/action-state";
import { createPlanGroup } from "../actions";

interface Props {
  plan: { id: string; title: string; dayCount: number };
  friends: { id: string; name: string; username: string; avatarUrl: string | null }[];
  groups: { id: string; name: string }[];
}

export function CreatePlanGroupForm({ plan, friends, groups }: Props) {
  const [state, action, pending] = useActionState(createPlanGroup, initialActionState);
  const v = state.values ?? {};
  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="planId" value={plan.id} />
      <Field label="Name" htmlFor="name" required error={state.errors?.name}>
        <Input id="name" name="name" required maxLength={80} defaultValue={v.name ?? `${plan.title} – gemeinsam`} />
      </Field>

      <fieldset>
        <legend className="text-sm font-medium">Freunde einladen</legend>
        {friends.length === 0 ? (
          <p className="mt-1 text-sm text-muted-foreground">
            Du hast noch keine Freunde hier.{" "}
            <Link href="/freunde" className="text-primary underline-offset-4 hover:underline">
              Freunde finden
            </Link>
          </p>
        ) : (
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {friends.map((f) => (
              <li key={f.id}>
                <label className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm hover:bg-surface-muted">
                  <Checkbox name="friends" value={f.id} />
                  <Avatar name={f.name} src={f.avatarUrl} size="xs" />
                  <span className="truncate">{f.name}</span>
                  <span className="truncate text-xs text-muted-foreground">@{f.username}</span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </fieldset>

      <Field label="Oder eine ganze Gruppe einladen" htmlFor="groupId" hint="Alle aktiven Mitglieder der Gruppe bekommen eine Einladung.">
        <Select id="groupId" name="groupId" defaultValue={v.groupId ?? ""}>
          <option value="">– keine Gruppe –</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </Select>
      </Field>

      {state.message && state.ok === false ? <Alert tone="danger">{state.message}</Alert> : null}
      <Button type="submit" loading={pending} size="lg">
        Gemeinsam starten
      </Button>
    </form>
  );
}
