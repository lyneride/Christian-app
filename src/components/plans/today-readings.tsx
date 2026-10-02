import type { ReactNode } from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getPreferredTranslation, readerContext, todaysReadings } from "@/lib/plans/queries";
import { cn } from "@/lib/utils";
import { MarkDayButton } from "./mark-day-button";
import { planHref } from "./plan-card";
import { ProgressBar } from "./progress-bar";
import { ReadingLinks } from "./reading-links";

export interface TodayReadingsProps {
  userId: string;
  /** preferred translation id; looked up when omitted */
  translation?: string;
  /** shown when there is nothing to read (default: nothing) */
  fallback?: ReactNode;
  className?: string;
}

/**
 * "Heute dran": the next open day of every active plan, compact, with a
 * "Gelesen" toggle. Server component – used on the dashboard and under
 * /leseplaene/meine.
 */
export async function TodayReadings({ userId, translation, fallback = null, className }: TodayReadingsProps) {
  const items = await todaysReadings(userId);
  if (items.length === 0) return <>{fallback}</>;
  const preferred = translation ?? (await getPreferredTranslation(userId));
  const reader = await readerContext(preferred);

  return (
    <ul className={cn("grid gap-3", className)}>
      {items.map((item) => (
        <li key={item.subscriptionId}>
          <Card>
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4">
              <div className="min-w-0 flex-1 space-y-1.5">
                <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <BookOpen className="size-3.5" aria-hidden="true" />
                  <Link href={planHref(item.plan, item.day)} className="truncate hover:text-primary">
                    {item.plan.title}
                  </Link>
                  <span aria-hidden="true">·</span>
                  <span className="shrink-0">
                    Tag {item.day} von {item.plan.dayCount}
                  </span>
                </p>
                <ReadingLinks readings={item.readings} locale={reader.locale} translation={reader.translation} className="text-base" />
                <ProgressBar value={item.completedCount} max={item.plan.dayCount} label={`Fortschritt: ${item.plan.title}`} size="sm" className="max-w-xs" />
              </div>
              <MarkDayButton planId={item.plan.id} day={item.day} done={false} size="md" className="shrink-0" />
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
