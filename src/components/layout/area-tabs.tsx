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
      {/* Phones: equal columns so every tab is visible – nothing hides off-screen. */}
      <ul
        className="grid gap-1.5 py-1 sm:flex sm:gap-2"
        style={{ gridTemplateColumns: `repeat(${area.tabs.length}, minmax(0, 1fr))` }}
      >
        {area.tabs.map((tab) => {
          const on = tab.href === pathname;
          return (
            <li key={tab.href} className="min-w-0 sm:shrink-0">
              <Link
                href={tab.href}
                aria-current={on ? "page" : undefined}
                className={cn(
                  "flex h-11 w-full items-center justify-center rounded-full px-2 font-display text-[13px] font-black whitespace-nowrap transition sm:inline-flex sm:w-auto sm:px-4 sm:text-sm",
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
