"use client";

import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { ALargeSmall } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import {
  FONT_SIZE_OPTIONS,
  parseReaderSettings,
  READER_SETTINGS_KEY,
  type FontFamily,
  type ReaderSettings,
  type VerseLayout,
} from "@/lib/bible/ui";
import { cn } from "@/lib/utils";

const SETTINGS_EVENT = "bleibe:reader-settings";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(SETTINGS_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(SETTINGS_EVENT, onChange);
  };
}

function getSnapshot(): string | null {
  try {
    return localStorage.getItem(READER_SETTINGS_KEY);
  } catch {
    return null;
  }
}

function getServerSnapshot(): string | null {
  return null;
}

/** Reader settings persisted in localStorage, shared by the toolbar and the reader surface. */
export function useReaderSettings(): ReaderSettings {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useMemo(() => parseReaderSettings(raw), [raw]);
}

export function saveReaderSettings(next: ReaderSettings) {
  try {
    localStorage.setItem(READER_SETTINGS_KEY, JSON.stringify(next));
  } catch {
    // ignore – settings simply won't persist
  }
  window.dispatchEvent(new Event(SETTINGS_EVENT));
}

function ToggleGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { value: T; label: string; title?: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <p className="text-muted-foreground mb-1.5 text-xs font-medium">{label}</p>
      <div role="group" aria-label={label} className="bg-surface-muted flex gap-1 rounded-lg p-1">
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={active}
              title={o.title}
              onClick={() => onChange(o.value)}
              className={cn(
                "flex-1 rounded-md px-2 py-1.5 text-sm font-medium transition",
                active ? "bg-surface text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const FONT_OPTIONS: readonly { value: FontFamily; label: string; title: string }[] = [
  { value: "serif", label: "Serif", title: "Serifenschrift" },
  { value: "sans", label: "Sans", title: "Serifenlose Schrift" },
];

const LAYOUT_OPTIONS: readonly { value: VerseLayout; label: string; title: string }[] = [
  { value: "lines", label: "Vers für Vers", title: "Jeder Vers in einer eigenen Zeile" },
  { value: "flow", label: "Fließtext", title: "Verse als zusammenhängender Absatz" },
];

/** "Leseansicht" popover: font size, font family and verse layout. */
export function ReaderSettingsMenu({ className }: { className?: string }) {
  const settings = useReaderSettings();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const update = (patch: Partial<ReaderSettings>) => saveReaderSettings({ ...settings, ...patch });

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        title="Leseansicht anpassen"
        className={buttonClasses("ghost", "sm", "gap-1.5 px-2.5")}
      >
        <ALargeSmall aria-hidden="true" />
        <span className="hidden sm:inline">Leseansicht</span>
        <span className="sr-only sm:hidden">Leseansicht</span>
      </button>
      <div
        id={panelId}
        role="dialog"
        aria-label="Leseansicht"
        className={cn(
          "border-border bg-surface shadow-soft absolute right-0 z-50 mt-2 w-72 space-y-4 rounded-xl border p-4",
          open ? "block" : "hidden",
        )}
      >
        <ToggleGroup
          label="Schriftgröße"
          options={FONT_SIZE_OPTIONS.map((o) => ({ value: o.value, label: o.label, title: `Schriftgröße ${o.label}` }))}
          value={settings.fontSize}
          onChange={(fontSize) => update({ fontSize })}
        />
        <ToggleGroup
          label="Schriftart"
          options={FONT_OPTIONS}
          value={settings.font}
          onChange={(font) => update({ font })}
        />
        <ToggleGroup
          label="Darstellung"
          options={LAYOUT_OPTIONS}
          value={settings.layout}
          onChange={(layout) => update({ layout })}
        />
      </div>
    </div>
  );
}
