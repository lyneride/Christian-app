import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "default" | "primary" | "accent" | "success" | "warning" | "danger" | "outline";

const variants: Record<BadgeVariant, string> = {
  default: "bg-surface-muted text-foreground",
  primary: "bg-primary-soft text-primary",
  accent: "bg-accent-soft text-accent-foreground dark:text-accent",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  outline: "border border-border text-muted-foreground",
};

export function Badge({ variant = "default", className, ...props }: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap", variants[variant], className)}
      {...props}
    />
  );
}
