import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  id: string;
  title: string;
  description?: string;
  tone?: "default" | "danger";
  children: ReactNode;
}

/** A titled card for one group of settings; `id` labels the section for assistive tech. */
export function SettingsSection({ id, title, description, tone = "default", children }: Props) {
  return (
    <section aria-labelledby={`${id}-titel`}>
      <Card className={cn(tone === "danger" && "border-danger/40")}>
        <div className="space-y-1 p-5 pb-0 sm:p-6 sm:pb-0">
          <h2 id={`${id}-titel`} className={cn("text-lg font-semibold tracking-tight", tone === "danger" && "text-danger")}>
            {title}
          </h2>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
        <div className="p-5 sm:p-6">{children}</div>
      </Card>
    </section>
  );
}
