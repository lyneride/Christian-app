"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BookOpen, CalendarDays, Compass, HandHeart, Menu, MessagesSquare, Users, X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { MAIN_NAV, type NavIcon } from "./nav-items";

const ICONS: Record<NavIcon, LucideIcon> = {
  bible: BookOpen,
  prayer: HandHeart,
  community: MessagesSquare,
  groups: Users,
  plans: Compass,
  events: CalendarDays,
};

export function MobileNav() {
  const items = MAIN_NAV;
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Menü öffnen"
        className="inline-flex size-9 items-center justify-center rounded-full hover:bg-surface-muted"
      >
        <Menu className="size-5" aria-hidden="true" />
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 bg-background" role="dialog" aria-modal="true" aria-label="Navigation">
          <div className="flex h-14 items-center justify-between px-4">
            <span className="text-lg font-semibold">Bleibe</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Menü schließen"
              className="inline-flex size-9 items-center justify-center rounded-full hover:bg-surface-muted"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
          <nav className="flex flex-col gap-1 px-4 py-2" aria-label="Hauptnavigation">
            {items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = ICONS[item.icon];
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-3 text-base font-medium",
                    active ? "bg-primary-soft text-primary" : "hover:bg-surface-muted",
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      ) : null}
    </div>
  );
}
