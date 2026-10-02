import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  label: string;
  value: number | string;
  hint?: string;
  icon?: ReactNode;
  href?: string;
  /** Highlights a number that asks for attention (e.g. open reports). */
  tone?: "default" | "warning";
  className?: string;
}

export function StatCard({ label, value, hint, icon, href, tone = "default", className }: StatCardProps) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-muted-foreground text-sm font-medium">{label}</p>
        {icon ? (
          <span className="text-muted-foreground [&_svg]:size-5" aria-hidden="true">
            {icon}
          </span>
        ) : null}
      </div>
      <p
        className={cn("mt-2 text-3xl font-semibold tracking-tight tabular-nums", tone === "warning" && "text-warning")}
      >
        {typeof value === "number" ? value.toLocaleString("de-DE") : value}
      </p>
      {hint ? <p className="text-muted-foreground mt-1 text-xs">{hint}</p> : null}
    </>
  );
  const classes = cn("block rounded-card border border-border bg-surface p-5 shadow-soft", className);
  if (href) {
    return (
      <Link href={href} className={cn(classes, "hover:bg-surface-muted transition-colors")}>
        {body}
      </Link>
    );
  }
  return <div className={classes}>{body}</div>;
}
