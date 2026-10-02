import Link from "next/link";
import { ArrowRight, CalendarDays, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { PlanSummary } from "@/lib/plans/queries";
import { categoryLabel, percent, type PlanStatus } from "@/lib/plans/progress";
import { cn, truncate } from "@/lib/utils";
import { ProgressBar } from "./progress-bar";

export interface PlanCardProgress {
  completed: number;
  nextDay: number | null;
  status: PlanStatus;
}

export interface PlanCardProps {
  plan: PlanSummary;
  /** when given the card shows the viewer's progress instead of the description */
  progress?: PlanCardProgress;
  showCategory?: boolean;
  className?: string;
}

export function planHref(plan: Pick<PlanSummary, "slug">, day?: number | null): string {
  return day ? `/leseplaene/${plan.slug}#tag-${day}` : `/leseplaene/${plan.slug}`;
}

/** Overview card: title, description or progress, stats and an "Ansehen" button. */
export function PlanCard({ plan, progress, showCategory, className }: PlanCardProps) {
  const headingId = `plan-${plan.id}`;
  const buttonLabel = !progress ? "Ansehen" : progress.status === "finished" ? "Ansehen" : progress.status === "archived" ? "Wieder aufnehmen" : "Weiterlesen";
  return (
    <Card className={cn("flex flex-col", className)}>
      <CardContent className="flex flex-1 flex-col gap-3">
        {showCategory ? (
          <Badge variant="outline" className="self-start">
            {categoryLabel(plan.category)}
          </Badge>
        ) : null}
        <h3 id={headingId} className="text-lg leading-snug font-semibold tracking-tight">
          <Link href={planHref(plan)} className="hover:text-primary focus-visible:outline-none">
            {plan.title}
          </Link>
        </h3>
        {progress ? (
          <div className="space-y-2">
            <ProgressBar value={progress.completed} max={plan.dayCount} label={`Fortschritt: ${plan.title}`} size="sm" />
            <p className="text-sm text-muted-foreground">
              {progress.status === "finished"
                ? "Abgeschlossen – stark durchgehalten."
                : progress.status === "archived"
                  ? `Pausiert bei ${progress.completed} von ${plan.dayCount} Tagen.`
                  : `${progress.completed} von ${plan.dayCount} Tagen (${percent(progress.completed, plan.dayCount)} %)${progress.nextDay ? ` · als Nächstes Tag ${progress.nextDay}` : ""}`}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{truncate(plan.description, 140)}</p>
        )}
        <dl className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Dauer</dt>
            <CalendarDays className="size-4" aria-hidden="true" />
            <dd>{plan.dayCount} Tage</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Lesezeit</dt>
            <Clock className="size-4" aria-hidden="true" />
            <dd>ca. {plan.minutesPerDay} Min/Tag</dd>
          </div>
        </dl>
        <Link
          href={planHref(plan, progress?.status === "active" ? progress.nextDay : null)}
          className={buttonClasses(progress && progress.status === "active" ? "primary" : "outline", "sm", "self-start")}
          aria-describedby={headingId}
        >
          {buttonLabel}
          <ArrowRight aria-hidden="true" />
        </Link>
      </CardContent>
    </Card>
  );
}
