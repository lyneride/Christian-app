import { Check } from "lucide-react";
import type { Locale } from "@/lib/bible/reference";
import type { PlanDayReadings } from "@/lib/plans/queries";
import { weeksOf } from "@/lib/plans/progress";
import { cn } from "@/lib/utils";
import { MarkDayButton } from "./mark-day-button";
import { ReadingLinks } from "./reading-links";

export interface DayListProps {
  planId: string;
  days: PlanDayReadings[];
  /** completed day numbers */
  completedDays: readonly number[];
  /** first open day; highlighted and given the anchor the overview links to */
  currentDay: number | null;
  /** show "Gelesen" toggles (viewer is subscribed and the plan is not paused) */
  interactive: boolean;
  locale?: Locale;
  translation?: string;
  className?: string;
}

export function dayAnchor(day: number): string {
  return `tag-${day}`;
}

/** Every day of the plan, grouped into weeks (details/summary), the current day highlighted. */
export function DayList({ planId, days, completedDays, currentDay, interactive, locale = "de", translation, className }: DayListProps) {
  const done = new Set(completedDays);
  const byDay = new Map(days.map((d) => [d.day, d.readings]));
  const weeks = weeksOf(days.length);
  const single = weeks.length === 1;

  const renderDay = (day: number) => {
    const isDone = done.has(day);
    const isCurrent = day === currentDay;
    return (
      <li
        key={day}
        id={dayAnchor(day)}
        aria-current={isCurrent ? "true" : undefined}
        className={cn(
          "flex scroll-mt-24 items-start gap-3 px-3 py-2.5 sm:items-center",
          isCurrent && "rounded-xl bg-primary-soft/70 ring-1 ring-primary/20",
        )}
      >
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums",
            isDone ? "bg-success-soft text-success" : isCurrent ? "bg-primary text-primary-foreground" : "bg-surface-muted text-muted-foreground",
          )}
          aria-hidden="true"
        >
          {isDone ? <Check className="size-4" /> : day}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground">
            Tag {day}
            {isCurrent ? " · als Nächstes" : ""}
            {isDone ? <span className="sr-only"> · gelesen</span> : null}
          </p>
          <ReadingLinks readings={byDay.get(day) ?? []} locale={locale} translation={translation} className="text-sm" />
        </div>
        {interactive ? <MarkDayButton planId={planId} day={day} done={isDone} className="shrink-0" /> : null}
      </li>
    );
  };

  if (single) {
    return (
      <ol className={cn("divide-y divide-border rounded-card border border-border bg-surface", className)}>
        {weeks[0]?.days.map(renderDay)}
      </ol>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {weeks.map((week) => {
        const first = week.days[0];
        const last = week.days[week.days.length - 1];
        const weekDone = week.days.filter((d) => done.has(d)).length;
        const containsCurrent = currentDay !== null && currentDay >= first && currentDay <= last;
        return (
          <details
            key={week.week}
            open={containsCurrent}
            className="group rounded-card border border-border bg-surface open:shadow-soft"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium select-none marker:hidden [&::-webkit-details-marker]:hidden">
              <span>
                Woche {week.week}
                <span className="ml-2 font-normal text-muted-foreground">
                  Tag {first}
                  {last !== first ? `–${last}` : ""}
                </span>
              </span>
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                {weekDone === week.days.length ? (
                  <span className="inline-flex items-center gap-1 text-success">
                    <Check className="size-3.5" aria-hidden="true" /> fertig
                  </span>
                ) : (
                  `${weekDone}/${week.days.length}`
                )}
                <span aria-hidden="true" className="transition-transform group-open:rotate-180">
                  ⌄
                </span>
              </span>
            </summary>
            <ol className="divide-y divide-border border-t border-border p-1">{week.days.map(renderDay)}</ol>
          </details>
        );
      })}
    </div>
  );
}
