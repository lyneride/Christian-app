import * as React from "react";
import { cn } from "@/lib/utils";
import { Rebi, type RebiPose } from "@/components/rebi/rebi";

/**
 * Empty pages show Rebi (sleeping by default) plus one clear next step.
 * Pass `mascot={false}` in tight spots; then the optional `icon` is shown instead.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  pose = "sleep",
  mascot = true,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  pose?: RebiPose;
  mascot?: boolean;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-card bg-surface px-6 py-10 text-center shadow-soft", className)}>
      {mascot ? (
        <Rebi pose={pose} size={112} className="mb-2" />
      ) : icon ? (
        <div className="mb-3 text-muted-foreground [&_svg]:size-8">{icon}</div>
      ) : null}
      <h3 className="font-display text-lg font-extrabold">{title}</h3>
      {description ? <p className="mt-1 max-w-sm text-[15px] text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
