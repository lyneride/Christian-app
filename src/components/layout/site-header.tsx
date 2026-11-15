import Link from "next/link";
import { Suspense } from "react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { NotificationBell, NotificationBellSkeleton } from "@/components/notifications/bell";
import { HelpButton } from "@/components/tour/help-button";
import { getCurrentUser } from "@/lib/auth/dal";
import { UserMenu, UserMenuSkeleton } from "./user-menu";
import { Logo } from "./logo";

async function Help() {
  const user = await getCurrentUser();
  return <HelpButton signedIn={Boolean(user)} />;
}

/**
 * Top bar. Phone: logo, „?“ and the bell – the areas live in the bottom bar.
 * Computer: the side navigation carries the logo; here sit help, theme, bell and the user menu.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-1.5 md:hidden" aria-label="Bleibe – Startseite">
          <Logo className="size-9" />
          <span className="font-display text-[22px] font-black tracking-tight">Bleibe</span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <Suspense fallback={<div className="size-11" aria-hidden="true" />}>
            <Help />
          </Suspense>
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
          <Suspense fallback={<NotificationBellSkeleton />}>
            <NotificationBell />
          </Suspense>
          <Suspense fallback={<UserMenuSkeleton />}>
            <UserMenu />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
