"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { AREAS, AREA_STYLE, areaForPath, areaHref } from "./areas";
import { AreaIcon } from "./area-icon";

/**
 * Phone navigation: the five areas as a fixed bar at the bottom, always within thumb reach.
 * Hidden from `md` up (the side navigation takes over) and inside a chat, where the
 * message box sits at the bottom instead.
 */
export function BottomNav({ signedIn, ichBadge = 0 }: { signedIn: boolean; ichBadge?: number }) {
  const pathname = usePathname() ?? "/";
  const active = areaForPath(pathname)?.key ?? (pathname === "/" ? "heute" : null);
  if (/^\/nachrichten\/(?!neu)[^/]+$/.test(pathname)) return null;

  return (
    <nav
      data-bottom-nav
      aria-label="Hauptnavigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="mx-auto flex h-[76px] max-w-lg items-stretch px-1.5">
        {AREAS.map((area) => {
          const on = area.key === active;
          const style = AREA_STYLE[area.key];
          const badge = area.key === "ich" && ichBadge > 0;
          return (
            <li key={area.key} className="flex flex-1">
              <Link
                href={areaHref(area, signedIn)}
                aria-current={on ? "page" : undefined}
                data-tour={`tab-${area.key}`}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl font-display text-[12px] transition",
                  on ? "font-black text-foreground" : "font-bold text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "relative flex h-8 w-[52px] items-center justify-center rounded-full transition",
                    on ? cn(style.soft, style.text) : "",
                  )}
                >
                  <AreaIcon name={area.icon} className="size-[22px]" strokeWidth={on ? 2.5 : 2} />
                  {badge ? (
                    <span className="absolute top-0.5 right-2.5 size-2.5 rounded-full bg-area-gebet ring-2 ring-surface" aria-hidden="true" />
                  ) : null}
                </span>
                <span>
                  {area.label}
                  {badge ? <span className="sr-only"> (Neues)</span> : null}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
