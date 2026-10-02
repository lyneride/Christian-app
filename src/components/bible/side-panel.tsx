"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: ReactNode;
  /** Rendered between header and content (e.g. filter chips). */
  toolbar?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  /** Marks the content as loading for assistive tech. */
  busy?: boolean;
  closeLabel?: string;
}

/**
 * Drawer on the right (md+) / bottom sheet (mobile). Modal: Escape closes,
 * focus moves to the close button on open and back to the opener on close.
 */
export function SidePanel({ open, onClose, title, subtitle, toolbar, footer, children, busy, closeLabel = "Schließen" }: Props) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    return () => previous?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-foreground/20" aria-hidden="true" onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "fixed z-50 flex flex-col border-border bg-surface shadow-soft",
          "inset-x-0 bottom-0 max-h-[80vh] rounded-t-2xl border-t",
          "md:inset-y-0 md:right-0 md:left-auto md:w-[26rem] md:max-h-none md:rounded-none md:border-t-0 md:border-l",
        )}
      >
        <header className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <h2 id={titleId} className="text-base font-semibold">
              {title}
            </h2>
            {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full hover:bg-surface-muted"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>
        {toolbar}
        <div className="flex-1 overflow-y-auto px-5 py-4" aria-live="polite" aria-busy={busy}>
          {children}
        </div>
        {footer ? <div className="border-t border-border px-5 py-2.5 text-xs text-muted-foreground">{footer}</div> : null}
      </aside>
    </>
  );
}
