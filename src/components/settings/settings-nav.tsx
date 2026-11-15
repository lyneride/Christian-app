"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Download, Highlighter, KeyRound, MonitorSmartphone, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/einstellungen/profil", label: "Profil", icon: UserRound },
  { href: "/einstellungen/markierungen", label: "Markerfarben", icon: Highlighter },
  { href: "/einstellungen/konto", label: "Konto", icon: KeyRound },
  { href: "/einstellungen/sitzungen", label: "Sitzungen", icon: MonitorSmartphone },
  { href: "/einstellungen/daten", label: "Deine Daten", icon: Download },
] as const;

/** Left sub-navigation of the settings area (horizontal scroller on small screens). */
export function SettingsNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Einstellungen">
      <ul className="grid grid-cols-2 gap-1.5 md:flex md:flex-col md:gap-1 [&>li:last-child:nth-child(odd)]:col-span-2">
        {ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href} className="min-w-0">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-2.5 rounded-full px-3.5 py-2 text-sm font-bold transition-colors md:rounded-xl",
                  active ? "bg-primary-soft text-primary" : "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
                )}
              >
                <item.icon className="size-4" aria-hidden="true" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
