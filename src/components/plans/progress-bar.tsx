import { percent } from "@/lib/plans/progress";
import { cn } from "@/lib/utils";

export interface ProgressBarProps {
  /** completed days */
  value: number;
  /** total days */
  max: number;
  /** accessible name; defaults to "x von y Tagen gelesen" */
  label?: string;
  size?: "sm" | "md";
  className?: string;
}

/** Accessible progress bar for a plan subscription. */
export function ProgressBar({ value, max, label, size = "md", className }: ProgressBarProps) {
  const pct = percent(value, max);
  const done = max > 0 && value >= max;
  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuetext={`${Math.min(value, max)} von ${max} Tagen gelesen`}
      aria-label={label ?? "Fortschritt"}
      className={cn("w-full overflow-hidden rounded-full bg-surface-muted", size === "sm" ? "h-1.5" : "h-2.5", className)}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-500", done ? "bg-success" : "bg-primary")}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
