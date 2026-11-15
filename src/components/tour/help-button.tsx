"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { CircleHelp, Compass, LifeBuoy, Sparkles } from "lucide-react";
import { areaForPath } from "@/components/layout/areas";
import { startTour } from "./tour-events";

/** The „?“ in the header: restart the welcome tour or explain the current area. */
export function HelpButton({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const pathname = usePathname() ?? "/";
  const area = areaForPath(pathname);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const item =
    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left font-display text-[15px] font-extrabold hover:bg-surface-muted disabled:opacity-50";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label="Hilfe und Touren"
        data-tour="help"
        className="inline-flex size-11 items-center justify-center rounded-full bg-surface text-foreground shadow-soft transition hover:bg-surface-muted"
      >
        <CircleHelp className="size-[21px]" aria-hidden="true" />
      </button>
      {open ? (
        <div id={menuId} role="menu" className="absolute right-0 z-50 mt-2 w-72 rounded-2xl border border-border bg-surface p-2 shadow-pop">
          {signedIn ? (
            <>
              <button
                type="button"
                role="menuitem"
                className={item}
                onClick={() => {
                  setOpen(false);
                  startTour("welcome");
                }}
              >
                <Sparkles className="size-5 text-primary" aria-hidden="true" /> Tour mit Rebi
              </button>
              {area ? (
                <button
                  type="button"
                  role="menuitem"
                  className={item}
                  onClick={() => {
                    setOpen(false);
                    startTour(area.key);
                  }}
                >
                  <Compass className="size-5 text-primary" aria-hidden="true" /> {area.label} erklären
                </button>
              ) : null}
            </>
          ) : null}
          <Link href="/hilfe" role="menuitem" className={item} onClick={() => setOpen(false)}>
            <LifeBuoy className="size-5 text-primary" aria-hidden="true" /> Hilfe &amp; Fragen
          </Link>
        </div>
      ) : null}
    </div>
  );
}
