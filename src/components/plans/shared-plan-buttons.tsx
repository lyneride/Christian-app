"use client";

import { useState, useTransition } from "react";
import { LogOut, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/input";
import { joinPlanGroup, leavePlanGroup, setShareHighlights } from "@/app/(site)/leseplaene/gemeinsam/actions";

export function JoinPlanGroupButton({ id, invited }: { id: string; invited: boolean }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button loading={pending} onClick={() => start(async () => setMsg((await joinPlanGroup(id)).message ?? null))}>
        <UserPlus aria-hidden="true" /> {invited ? "Einladung annehmen" : "Mitlesen"}
      </Button>
      {msg ? <span role="status" className="text-xs text-muted-foreground">{msg}</span> : null}
    </div>
  );
}

export function LeavePlanGroupButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      variant="ghost"
      size="sm"
      loading={pending}
      onClick={() => {
        if (confirm("Nicht mehr gemeinsam lesen? Dein eigener Fortschritt bleibt erhalten.")) start(async () => void (await leavePlanGroup(id)));
      }}
    >
      <LogOut aria-hidden="true" /> Verlassen
    </Button>
  );
}

export function ShareHighlightsToggle({ id, share }: { id: string; share: boolean }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <div className="space-y-1">
      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          defaultChecked={share}
          disabled={pending}
          onChange={(e) => {
            const next = e.currentTarget.checked;
            start(async () => setMsg((await setShareHighlights(id, next)).message ?? null));
          }}
        />
        Meine Markierungen und geteilten Notizen für die anderen sichtbar machen
      </label>
      {msg ? <p role="status" className="text-xs text-muted-foreground">{msg}</p> : null}
    </div>
  );
}
