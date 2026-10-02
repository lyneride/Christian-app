import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Select } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  id: string;
  label: string;
  /** Visually hide the label (still announced by screen readers). */
  hideLabel?: boolean;
  selectClassName?: string;
}

/** Native <select> with label and chevron. Hook-free, so usable from server and client components. */
export function SelectField({ id, label, hideLabel, className, selectClassName, children, ...props }: SelectFieldProps) {
  return (
    <div className={cn("min-w-0", className)}>
      <label htmlFor={id} className={hideLabel ? "sr-only" : "mb-1 block text-xs font-medium text-muted-foreground"}>
        {label}
      </label>
      <div className="relative">
        <Select id={id} className={cn("h-9 py-1 text-sm", selectClassName)} {...props}>
          {children}
        </Select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground"
        />
      </div>
    </div>
  );
}
