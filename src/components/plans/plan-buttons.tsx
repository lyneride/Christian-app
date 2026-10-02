"use client";

import { useState, useTransition, type ReactNode } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { archivePlan, resetPlan, subscribePlan } from "@/app/(site)/leseplaene/actions";
import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/button";
import type { ActionState } from "@/lib/action-state";
import { cn } from "@/lib/utils";

interface ActionButtonProps {
  run: () => Promise<ActionState>;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** ask before running (window.confirm) */
  confirmText?: string;
  className?: string;
  children: ReactNode;
}

/** Runs a plan action in a transition and shows its message underneath. */
function ActionButton({ run, variant = "primary", size = "md", confirmText, className, children }: ActionButtonProps) {
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<ActionState | null>(null);

  function onClick() {
    if (confirmText && !window.confirm(confirmText)) return;
    setState(null);
    startTransition(async () => {
      const result = await run();
      setState(result);
    });
  }

  return (
    <span className={cn("inline-flex flex-col items-start gap-1.5", className)}>
      <Button type="button" variant={variant} size={size} loading={pending} onClick={onClick}>
        {children}
      </Button>
      {state?.message ? (
        <span role={state.ok ? "status" : "alert"} className={cn("text-xs font-medium", state.ok ? "text-success" : "text-danger")}>
          {state.message}
        </span>
      ) : null}
    </span>
  );
}

export interface PlanButtonProps {
  planId: string;
  size?: ButtonSize;
  className?: string;
}

/** Starts the plan – or resumes a paused one. */
export function SubscribeButton({ planId, size = "lg", className, label = "Plan starten" }: PlanButtonProps & { label?: string }) {
  return (
    <ActionButton run={() => subscribePlan(planId)} size={size} className={className}>
      <Play aria-hidden="true" />
      {label}
    </ActionButton>
  );
}

export function ArchiveButton({ planId, size = "md", className }: PlanButtonProps) {
  return (
    <ActionButton run={() => archivePlan(planId)} variant="outline" size={size} className={className}>
      <Pause aria-hidden="true" />
      Pausieren
    </ActionButton>
  );
}

export function ResetButton({ planId, size = "md", className, label = "Von vorn beginnen" }: PlanButtonProps & { label?: string }) {
  return (
    <ActionButton
      run={() => resetPlan(planId)}
      variant="ghost"
      size={size}
      className={className}
      confirmText="Dein Fortschritt in diesem Plan wird gelöscht und du beginnst wieder bei Tag 1. Fortfahren?"
    >
      <RotateCcw aria-hidden="true" />
      {label}
    </ActionButton>
  );
}
