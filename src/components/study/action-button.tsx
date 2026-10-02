"use client";

import { useActionState } from "react";
import { initialActionState, type ActionState } from "@/lib/action-state";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ActionButtonProps extends Omit<ButtonProps, "type" | "onClick" | "loading"> {
  /** A (bound) server action without arguments, e.g. `deleteNote.bind(null, id)`. */
  action: () => Promise<ActionState>;
  /** Asks before running the action. */
  confirmText?: string;
  /** Class for the wrapping form. */
  formClassName?: string;
}

/** One-click server action with pending state, optional confirmation and inline error. */
export function ActionButton({ action, confirmText, formClassName, children, ...rest }: ActionButtonProps) {
  const [state, formAction, pending] = useActionState(() => action(), initialActionState);
  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (confirmText && !window.confirm(confirmText)) e.preventDefault();
      }}
      className={cn("inline-flex flex-col items-start", formClassName)}
    >
      <Button type="submit" loading={pending} {...rest}>
        {children}
      </Button>
      {state.message && !state.ok ? (
        <p role="alert" className="text-danger mt-1 text-xs font-medium">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
