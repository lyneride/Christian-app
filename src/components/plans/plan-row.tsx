import Link from "next/link";
import { BookOpenText, ChevronRight } from "lucide-react";
import type { PlanSummary } from "@/lib/plans/queries";
import { parseResources, percent } from "@/lib/plans/progress";
import { planHref } from "./plan-card";

/** Compact list row for phones: title, length, pace – the whole row is the tap target. */
export function PlanRow({ plan, completed }: { plan: PlanSummary; completed?: number }) {
  const withCommentary = parseResources(plan.resources).length > 0;
  return (
    <Link href={planHref(plan)} className="active:bg-surface-muted flex min-h-16 items-center gap-3 px-4 py-3">
      <span className="min-w-0 flex-1">
        <span className="font-display block leading-snug font-extrabold">{plan.title}</span>
        <span className="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-2 text-xs">
          <span>{plan.dayCount} Tage</span>
          <span aria-hidden="true">·</span>
          <span>ca. {plan.minutesPerDay} Min/Tag</span>
          {withCommentary ? (
            <span className="text-area-bibel inline-flex items-center gap-1 font-bold">
              <BookOpenText aria-hidden="true" className="size-3" />
              mit Kommentar
            </span>
          ) : null}
          {completed !== undefined ? <span className="text-primary font-bold">{percent(completed, plan.dayCount)} % gelesen</span> : null}
        </span>
      </span>
      <ChevronRight aria-hidden="true" className="text-muted-foreground size-5 shrink-0" />
    </Link>
  );
}
