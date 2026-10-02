"use client";

import { useActionState, useId, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Flag, X } from "lucide-react";
import { createReport } from "@/lib/moderation/report-actions";
import { initialActionState } from "@/lib/action-state";
import { REPORT_REASONS, REPORT_REASON_LABELS, type ReportTargetType } from "@/lib/validation/report";
import { Button, buttonClasses, type ButtonVariant } from "@/components/ui/button";
import { Field, Select, Textarea } from "@/components/ui/input";
import { FormMessage } from "@/components/auth/form-message";

export interface ReportButtonProps {
  targetType: ReportTargetType;
  targetId: string;
  signedIn: boolean;
  variant?: ButtonVariant;
  className?: string;
}

/**
 * Small "Melden" button that opens a native <dialog> with reason + details.
 * Guests get a link to the login page.
 */
export function ReportButton({ targetType, targetId, signedIn, variant = "ghost", className }: ReportButtonProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const id = useId();
  const [state, formAction, pending] = useActionState(createReport, initialActionState);
  const errors = state.errors ?? {};
  const values = state.values ?? {};
  const size = "sm";
  const textClass = variant === "link" ? "text-xs text-muted-foreground hover:text-foreground" : undefined;

  if (!signedIn) {
    return (
      <Link href={`/anmelden?next=${encodeURIComponent(pathname)}`} className={buttonClasses(variant, size, className)}>
        <Flag aria-hidden="true" /> Melden
      </Link>
    );
  }

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={`${textClass ?? ""} ${className ?? ""}`.trim()}
        onClick={() => dialogRef.current?.showModal()}
      >
        <Flag aria-hidden="true" /> Melden
      </Button>

      <dialog
        ref={dialogRef}
        aria-labelledby={`${id}-title`}
        className="rounded-card border-border bg-surface text-foreground shadow-soft m-auto w-[min(100%-2rem,28rem)] border p-0 backdrop:bg-black/40"
      >
        <form action={formAction} className="space-y-4 p-5">
          <input type="hidden" name="targetType" value={targetType} />
          <input type="hidden" name="targetId" value={targetId} />

          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id={`${id}-title`} className="text-lg font-semibold">
                Inhalt melden
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Die Moderation prüft jede Meldung. Danke, dass du hinschaust.
              </p>
            </div>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Schließen"
              className="hover:bg-surface-muted inline-flex size-8 shrink-0 items-center justify-center rounded-full"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>

          {state.ok ? (
            <>
              <FormMessage state={state} />
              <div className="flex justify-end">
                <Button type="button" variant="outline" size="sm" onClick={() => dialogRef.current?.close()}>
                  Fertig
                </Button>
              </div>
            </>
          ) : (
            <>
              <FormMessage state={state} />
              <Field label="Grund" htmlFor={`${id}-reason`} error={errors.reason}>
                <div className="relative">
                  <Select
                    id={`${id}-reason`}
                    name="reason"
                    required
                    defaultValue={values.reason ?? ""}
                    aria-invalid={errors.reason ? true : undefined}
                    aria-describedby={errors.reason ? `${id}-reason-error` : undefined}
                  >
                    <option value="" disabled>
                      Bitte wählen …
                    </option>
                    {REPORT_REASONS.map((r) => (
                      <option key={r} value={r}>
                        {REPORT_REASON_LABELS[r]}
                      </option>
                    ))}
                  </Select>
                  <ChevronDown
                    aria-hidden="true"
                    className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
                  />
                </div>
              </Field>
              <Field label="Was ist passiert? (optional)" htmlFor={`${id}-details`} error={errors.details}>
                <Textarea
                  id={`${id}-details`}
                  name="details"
                  maxLength={1000}
                  rows={3}
                  defaultValue={values.details ?? ""}
                  className="min-h-20"
                  aria-invalid={errors.details ? true : undefined}
                  aria-describedby={errors.details ? `${id}-details-error` : undefined}
                />
              </Field>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => dialogRef.current?.close()}>
                  Abbrechen
                </Button>
                <Button type="submit" size="sm" loading={pending}>
                  Meldung senden
                </Button>
              </div>
            </>
          )}
        </form>
      </dialog>
    </>
  );
}
