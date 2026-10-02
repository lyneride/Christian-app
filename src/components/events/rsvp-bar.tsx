"use client";

import { useOptimistic, useState, useTransition } from "react";
import Link from "next/link";
import { Check, CircleHelp, X } from "lucide-react";
import type { RsvpStatus } from "@/generated/prisma/enums";
import { setRsvp } from "@/app/(site)/veranstaltungen/actions";
import { buttonClasses } from "@/components/ui/button";
import { attendeeSummary, isFull } from "@/lib/events/format";
import { cn } from "@/lib/utils";
import { RSVP_LABELS, RSVP_STATUSES } from "@/lib/validation/events";

export interface RsvpBarProps {
  eventId: string;
  /** The viewer's current answer (server truth). */
  status: RsvpStatus | null;
  going: number;
  maybe: number;
  capacity: number | null;
  isPast: boolean;
  signedIn: boolean;
  /** Where to return after signing in. */
  nextPath: string;
  className?: string;
}

interface RsvpState {
  status: RsvpStatus | null;
  going: number;
  maybe: number;
}

/** Applies a new answer to the counts. */
function apply(state: RsvpState, next: RsvpStatus): RsvpState {
  let { going, maybe } = state;
  if (state.status === "GOING") going -= 1;
  if (state.status === "MAYBE") maybe -= 1;
  if (next === "GOING") going += 1;
  if (next === "MAYBE") maybe += 1;
  return { status: next, going, maybe };
}

function isStatus(value: unknown): value is RsvpStatus {
  return value === "GOING" || value === "MAYBE" || value === "DECLINED";
}

/** Reads the server's `data` payload, falling back to the known state. */
function readState(data: Record<string, unknown> | undefined, fallback: RsvpState): RsvpState {
  if (!data) return fallback;
  return {
    status: isStatus(data.status) ? data.status : data.status === null ? null : fallback.status,
    going: typeof data.going === "number" ? data.going : fallback.going,
    maybe: typeof data.maybe === "number" ? data.maybe : fallback.maybe,
  };
}

const icons: Record<RsvpStatus, typeof Check> = { GOING: Check, MAYBE: CircleHelp, DECLINED: X };
const activeClass: Record<RsvpStatus, string> = { GOING: "text-success", MAYBE: "text-warning", DECLINED: "text-muted-foreground" };

/**
 * Three answer buttons with live counts. The choice is applied optimistically
 * and settled on the server result; errors (e.g. "Leider schon voll.") are
 * announced inline.
 */
export function RsvpBar({ eventId, status, going, maybe, capacity, isPast, signedIn, nextPath, className }: RsvpBarProps) {
  const [state, setState] = useState<RsvpState>({ status, going, maybe });
  const [optimistic, setOptimistic] = useOptimistic(state);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const summary = attendeeSummary(optimistic.going, capacity) + (optimistic.maybe > 0 ? ` · ${optimistic.maybe} vielleicht` : "");

  if (isPast) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        Dieses Treffen ist vorbei. {summary}.
      </p>
    );
  }

  if (!signedIn) {
    return (
      <div className={cn("flex flex-wrap items-center gap-3", className)}>
        <Link href={`/anmelden?next=${encodeURIComponent(nextPath)}`} className={buttonClasses("primary", "md")}>
          Anmelden und zusagen
        </Link>
        <span className="text-sm text-muted-foreground">{summary}</span>
      </div>
    );
  }

  const full = isFull(optimistic.going, capacity) && optimistic.status !== "GOING";

  function choose(next: RsvpStatus) {
    if (next === state.status || pending) return;
    setError(null);
    startTransition(async () => {
      setOptimistic(apply(state, next));
      const result = await setRsvp(eventId, next);
      if (result.ok) {
        setState(readState(result.data, apply(state, next)));
      } else {
        setError(result.message ?? "Das hat leider nicht geklappt.");
        setState(readState(result.data, state));
      }
    });
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div role="group" aria-label="Deine Antwort" className="flex flex-wrap gap-2">
        {RSVP_STATUSES.map((s) => {
          const Icon = icons[s];
          const active = optimistic.status === s;
          const blocked = s === "GOING" && full;
          return (
            <button
              key={s}
              type="button"
              onClick={() => choose(s)}
              aria-pressed={active}
              aria-busy={pending || undefined}
              disabled={blocked}
              className={cn(buttonClasses(active ? "secondary" : "outline", "md"), active && activeClass[s])}
            >
              <Icon aria-hidden="true" />
              {RSVP_LABELS[s]}
            </button>
          );
        })}
      </div>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {summary}
      </p>
      {full ? (
        <p className="text-sm text-warning">Alle Plätze sind belegt. Mit „Vielleicht“ bleibst du trotzdem auf dem Laufenden.</p>
      ) : null}
      {error ? (
        <p role="alert" className="text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
