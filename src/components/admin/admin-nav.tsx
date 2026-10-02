"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin", label: "Übersicht", exact: true },
  { href: "/admin/meldungen", label: "Meldungen" },
  { href: "/admin/mitglieder", label: "Mitglieder" },
  { href: "/admin/protokoll", label: "Protokoll" },
] as const;

/** Sub-navigation of the moderation area; `openCount` shows the open-report badge (null hides it). */
export function AdminNav({ openCount }: { openCount: number | null }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Moderation">
      <ul className="flex flex-wrap gap-1">
        {ITEMS.map((item) => {
          const active =
            "exact" in item ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const badge = item.href === "/admin/meldungen" && openCount !== null && openCount > 0 ? openCount : null;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-sm font-medium transition-colors",
                  active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-surface-muted",
                )}
              >
                {item.label}
                {badge !== null ? (
                  <span
                    className={cn(
                      "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold tabular-nums",
                      active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-warning-soft text-warning",
                    )}
                    aria-label={`${badge} offene Meldungen`}
                  >
                    {badge > 99 ? "99+" : badge}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
