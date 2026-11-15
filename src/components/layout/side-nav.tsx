"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { AREAS, AREA_STYLE, areaForPath, areaHref } from "./areas";
import { AreaIcon } from "./area-icon";
import { Logo } from "./logo";

/** Computer navigation: the same five areas as a column on the left. */
export function SideNav({ signedIn, ichBadge = 0 }: { signedIn: boolean; ichBadge?: number }) {
  const pathname = usePathname() ?? "/";
  const active = areaForPath(pathname)?.key ?? (pathname === "/" ? "heute" : null);

  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border bg-surface/60 px-4 py-5 md:flex">
      <Link href={signedIn ? "/start" : "/"} className="mb-6 flex items-center gap-2 px-2" aria-label="Bleibe – Startseite">
        <Logo className="size-10" />
        <span className="font-display text-2xl font-black tracking-tight">Bleibe</span>
      </Link>
      <nav aria-label="Hauptnavigation">
        <ul className="space-y-1.5">
          {AREAS.map((area) => {
            const on = area.key === active;
            const style = AREA_STYLE[area.key];
            return (
              <li key={area.key}>
                <Link
                  href={areaHref(area, signedIn)}
                  aria-current={on ? "page" : undefined}
                  data-tour={`side-${area.key}`}
                  className={cn(
                    "group flex items-center gap-3 rounded-2xl px-2.5 py-2 transition",
                    on ? style.soft : "hover:bg-surface-muted",
                  )}
                >
                  <span className={cn("flex size-10 items-center justify-center rounded-xl", on ? "bg-surface" : style.soft, style.text)}>
                    <AreaIcon name={area.icon} className="size-[22px]" strokeWidth={2.4} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display text-[16px] font-extrabold">{area.label}</span>
                    <span className="block truncate text-xs text-muted-foreground">{area.purpose}</span>
                  </span>
                  {area.key === "ich" && ichBadge > 0 ? (
                    <span className="ml-auto size-2.5 rounded-full bg-area-gebet" aria-label="Neues" />
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
