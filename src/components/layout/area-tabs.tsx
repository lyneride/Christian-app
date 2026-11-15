"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { AREA_STYLE, areaForPath } from "./areas";

/**
 * Tabs inside an area (e.g. Bibel: Lesen · Pläne · Merkverse · Notizen).
 * Shown only on the area's main pages, not on detail pages like a Bible chapter.
 */
export function AreaTabs() {
  const pathname = usePathname() ?? "/";
  const area = areaForPath(pathname);
  if (!area?.tabs || !area.tabs.some((t) => t.href === pathname)) return null;
  const style = AREA_STYLE[area.key];

  return (
    <nav aria-label={`${area.label}: Bereiche`} className="mx-auto w-full max-w-6xl px-4 pt-3 sm:px-6" data-tour={`tabs-${area.key}`}>
      <ul className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 py-1">
        {area.tabs.map((tab) => {
          const on = tab.href === pathname;
          return (
            <li key={tab.href} className="shrink-0">
              <Link
                href={tab.href}
                aria-current={on ? "page" : undefined}
                className={cn(
                  "inline-flex h-10 items-center rounded-full px-4 font-display text-sm font-black transition",
                  on ? cn(style.bg, "text-foreground dark:text-background") : "bg-surface text-foreground shadow-soft hover:bg-surface-muted",
                )}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
