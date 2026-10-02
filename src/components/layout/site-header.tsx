import Link from "next/link";
import { Suspense } from "react";
import { BookOpen, HandHeart, Users, CalendarDays, Compass } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { UserMenu, UserMenuSkeleton } from "./user-menu";
import { MobileNav } from "./mobile-nav";
import { Logo } from "./logo";

export const MAIN_NAV = [
  { href: "/bibel", label: "Bibel", icon: BookOpen },
  { href: "/gebet", label: "Gebet", icon: HandHeart },
  { href: "/gemeinschaft", label: "Gemeinschaft", icon: Users },
  { href: "/leseplaene", label: "Lesepläne", icon: Compass },
  { href: "/veranstaltungen", label: "Treffen", icon: CalendarDays },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <MobileNav items={MAIN_NAV} />
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight" aria-label="Bleibe – Startseite">
          <Logo className="size-7 text-primary" />
          <span className="text-lg">Bleibe</span>
        </Link>
        <nav aria-label="Hauptnavigation" className="ml-4 hidden items-center gap-1 md:flex">
          {MAIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-surface-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          <Suspense fallback={<UserMenuSkeleton />}>
            <UserMenu />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
