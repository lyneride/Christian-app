import { dateBlockParts } from "@/lib/events/time";
import { cn } from "@/lib/utils";

export interface DateBlockProps {
  date: Date;
  past?: boolean;
  size?: "sm" | "md";
  className?: string;
}

/** Calendar-leaf style date: weekday, day and month in Europe/Berlin. */
export function DateBlock({ date, past, size = "md", className }: DateBlockProps) {
  const p = dateBlockParts(date);
  return (
    <time
      dateTime={p.iso}
      className={cn(
        "border-border bg-surface-muted flex shrink-0 flex-col items-center justify-center rounded-xl border text-center leading-none",
        size === "md" ? "w-16 py-2.5" : "w-12 py-1.5",
        past && "opacity-70",
        className,
      )}
    >
      <span
        className={cn(
          "text-muted-foreground font-medium tracking-wide uppercase",
          size === "md" ? "text-[11px]" : "text-[10px]",
        )}
      >
        {p.weekday}
      </span>
      <span className={cn("mt-1 font-semibold tabular-nums", size === "md" ? "text-2xl" : "text-lg")}>{p.day}</span>
      <span className={cn("text-primary mt-1 font-medium", size === "md" ? "text-xs" : "text-[11px]")}>{p.month}</span>
    </time>
  );
}
