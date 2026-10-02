"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Check, Circle } from "lucide-react";
import { markDay } from "@/app/(site)/leseplaene/actions";
import { buttonClasses, type ButtonSize } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface MarkDayButtonProps {
  planId: string;
  day: number;
  /** server truth */
  done: boolean;
  size?: ButtonSize;
  className?: string;
  /** "Gelesen" by default; the done state always reads "Gelesen" with a check */
  label?: string;
}

/**
 * "Gelesen" toggle for one plan day. Optimistic, settles on the server
 * result; a finished plan shows its celebration line right here.
 */
export function MarkDayButton({ planId, day, done, size = "sm", className, label = "Gelesen" }: MarkDayButtonProps) {
  const [optimistic, setOptimistic] = useOptimistic(done);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  function toggle() {
    const next = !optimistic;
    setMessage(null);
    startTransition(async () => {
      setOptimistic(next);
      const result = await markDay(planId, day, next);
      if (result.ok === false) setMessage({ ok: false, text: result.message ?? "Das hat leider nicht geklappt." });
      else if (result.data?.finished && result.message) setMessage({ ok: true, text: result.message });
    });
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={toggle}
        aria-pressed={optimistic}
        aria-busy={pending || undefined}
        className={cn(
          buttonClasses(optimistic ? "secondary" : "outline", size),
          optimistic && "text-success",
          className,
        )}
      >
        {optimistic ? <Check aria-hidden="true" /> : <Circle aria-hidden="true" />}
        <span className="sr-only">Tag {day}: </span>
        {label}
      </button>
      {message ? (
        <span role={message.ok ? "status" : "alert"} className={cn("text-xs font-medium", message.ok ? "text-success" : "text-danger")}>
          {message.text}
        </span>
      ) : null}
    </span>
  );
}
