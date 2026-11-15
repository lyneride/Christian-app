"use client";

import { useActionState, useMemo, useState } from "react";
import { Check, Search, Send } from "lucide-react";
import { startGroupChat } from "@/app/(site)/nachrichten/actions";
import { initialActionState } from "@/lib/action-state";
import { CHAT_TITLE_MAX, GROUP_CHAT_MAX_MEMBERS, MESSAGE_MAX } from "@/lib/validation/messages";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { FormMessage } from "@/components/auth/form-message";
import { cn } from "@/lib/utils";
import { submitOnCtrlEnter } from "./submit-on-ctrl-enter";

export interface PickableFriend {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
}

/** Name, friends to add (search + tap to pick) and the first message for a new group chat. */
export function NewGroupChatForm({ friends, preselected = [] }: { friends: PickableFriend[]; preselected?: string[] }) {
  const [state, formAction, pending] = useActionState(startGroupChat, initialActionState);
  const errors = state.errors ?? {};
  const values = state.values ?? {};
  const [selected, setSelected] = useState<Set<string>>(() => new Set(preselected.filter((id) => friends.some((f) => f.id === id))));
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return friends;
    return friends.filter((f) => f.name.toLowerCase().includes(q) || f.username.includes(q));
  }, [friends, query]);

  const full = selected.size >= GROUP_CHAT_MAX_MEMBERS;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < GROUP_CHAT_MAX_MEMBERS) next.add(id);
      return next;
    });
  }

  return (
    <form action={formAction} className="space-y-6">
      <FormMessage state={state} />

      <Field label="Name des Chats" htmlFor="title" hint="Zum Beispiel „Hauskreis Siegen“ oder „Lesegruppe Römer“." error={errors.title} required>
        <Input
          id="title"
          name="title"
          required
          minLength={2}
          maxLength={CHAT_TITLE_MAX}
          defaultValue={values.title ?? ""}
          autoComplete="off"
          aria-invalid={errors.title ? true : undefined}
          aria-describedby={errors.title ? "title-error" : "title-hint"}
        />
      </Field>

      <fieldset className="space-y-3" aria-describedby={errors.memberIds ? "members-error" : "members-hint"}>
        <legend className="font-display text-sm font-extrabold">
          Wer ist dabei?<span className="ml-0.5 text-danger" aria-hidden="true">*</span>
        </legend>
        <p id="members-hint" className="text-xs text-muted-foreground">
          {selected.size === 0 ? "Tippe auf deine Freunde." : `${selected.size} ausgewählt${full ? " – mehr geht nicht" : ""}.`}
        </p>
        {friends.length > 6 ? (
          <div className="relative">
            <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Freunde suchen"
              aria-label="Freunde suchen"
              className="pl-10"
            />
          </div>
        ) : null}
        <ul className="grid gap-2 sm:grid-cols-2" data-tour="chat-members">
          {visible.map((f) => {
            const on = selected.has(f.id);
            return (
              <li key={f.id}>
                <label
                  className={cn(
                    "flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border-2 px-3 py-2 transition",
                    on ? "border-primary bg-primary-soft" : "border-border bg-surface hover:bg-surface-muted",
                    !on && full && "cursor-not-allowed opacity-60",
                  )}
                >
                  <input
                    type="checkbox"
                    name="memberIds"
                    value={f.id}
                    checked={on}
                    disabled={!on && full}
                    onChange={() => toggle(f.id)}
                    className="sr-only"
                  />
                  <Avatar name={f.name} src={f.avatarUrl} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{f.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">@{f.username}</span>
                  </span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "inline-flex size-6 shrink-0 items-center justify-center rounded-full border-2",
                      on ? "border-primary bg-primary text-white" : "border-border",
                    )}
                  >
                    {on ? <Check className="size-3.5" strokeWidth={3} /> : null}
                  </span>
                </label>
              </li>
            );
          })}
          {visible.length === 0 ? <li className="text-sm text-muted-foreground">Niemand gefunden.</li> : null}
        </ul>
        {errors.memberIds ? (
          <p id="members-error" role="alert" className="text-xs font-medium text-danger">
            {errors.memberIds.join(" ")}
          </p>
        ) : null}
      </fieldset>

      <Field label="Erste Nachricht" htmlFor="body" hint="Strg + Enter sendet." error={errors.body} required>
        <Textarea
          id="body"
          name="body"
          rows={4}
          required
          maxLength={MESSAGE_MAX}
          defaultValue={values.body ?? ""}
          onKeyDown={submitOnCtrlEnter}
          aria-invalid={errors.body ? true : undefined}
          aria-describedby={errors.body ? "body-error" : "body-hint"}
        />
      </Field>

      <div className="flex justify-end">
        <Button type="submit" size="lg" loading={pending} disabled={selected.size === 0} className="w-full sm:w-auto">
          {pending ? null : <Send aria-hidden="true" />}
          Chat starten
        </Button>
      </div>
    </form>
  );
}
