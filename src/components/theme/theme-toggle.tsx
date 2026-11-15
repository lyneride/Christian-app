"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun, SunMoon } from "lucide-react";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "system";

const THEME_EVENT = "bleibe:theme";

function readTheme(): Theme {
  try {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark" || stored === "system") return stored;
  } catch {}
  return "system";
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(THEME_EVENT, onChange);
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const onMq = () => {
    if (readTheme() === "system") applyTheme("system");
  };
  mq.addEventListener("change", onMq);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(THEME_EVENT, onChange);
    mq.removeEventListener("change", onMq);
  };
}

function applyTheme(theme: Theme) {
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = theme === "dark" || (theme === "system" && systemDark);
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}

export function setTheme(theme: Theme) {
  try {
    localStorage.setItem("theme", theme);
  } catch {}
  applyTheme(theme);
  window.dispatchEvent(new Event(THEME_EVENT));
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, readTheme, () => "system");
}

const OPTIONS: { value: Theme; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "Hell", Icon: Sun },
  { value: "dark", label: "Dunkel", Icon: Moon },
  { value: "system", label: "Wie Gerät", Icon: SunMoon },
];

export function ThemeToggle({ className, showLabel }: { className?: string; showLabel?: boolean }) {
  const theme = useTheme();
  if (showLabel) {
    return (
      <div role="radiogroup" aria-label="Darstellung" className={cn("inline-flex gap-1 rounded-full bg-surface-muted p-1", className)}>
        {OPTIONS.map(({ value, label, Icon: OptIcon }) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={theme === value}
            onClick={() => setTheme(value)}
            className={cn(
              "inline-flex h-10 items-center gap-1.5 rounded-full px-3.5 font-display text-sm font-extrabold transition",
              theme === value ? "bg-surface text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <OptIcon className="size-4" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>
    );
  }
  const next: Theme = theme === "system" ? "light" : theme === "light" ? "dark" : "system";
  const label = theme === "system" ? "Design: wie System" : theme === "light" ? "Design: Hell" : "Design: Dunkel";
  const Icon = theme === "system" ? SunMoon : theme === "light" ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`${label} – umschalten`}
      title={label}
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-full bg-surface text-foreground shadow-soft transition hover:bg-surface-muted",
        className,
      )}
    >
      <Icon className="size-5" aria-hidden="true" />
    </button>
  );
}
