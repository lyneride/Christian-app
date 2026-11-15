import { Suspense } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SideNav } from "@/components/layout/side-nav";
import { AreaTabs } from "@/components/layout/area-tabs";
import { getCurrentUser } from "@/lib/auth/dal";
import { totalUnreadMessages } from "@/lib/messages/queries";
import { countIncomingRequests } from "@/lib/friends/queries";
import { TourHost } from "@/components/tour/tour-host";

/** Reads the user once per request (memoised) so both navigations know about badges. */
async function navState() {
  const user = await getCurrentUser();
  if (!user) return { signedIn: false, ichBadge: 0 };
  const [messages, requests] = await Promise.all([totalUnreadMessages(user.id), countIncomingRequests(user.id)]);
  return { signedIn: true, ichBadge: messages + requests };
}

async function SideNavForUser() {
  return <SideNav {...await navState()} />;
}

async function BottomNavForUser() {
  return <BottomNav {...await navState()} />;
}

async function TourHostForUser() {
  const user = await getCurrentUser();
  return <TourHost userId={user?.id ?? null} />;
}

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <a
        href="#inhalt"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2 focus:shadow-soft"
      >
        Zum Inhalt springen
      </a>
      <div className="flex flex-1">
        <Suspense fallback={<SideNav signedIn={false} />}>
          <SideNavForUser />
        </Suspense>
        <div className="flex min-w-0 flex-1 flex-col">
          <SiteHeader />
          <AreaTabs />
          <div id="inhalt" className="flex flex-1 flex-col">
            {children}
          </div>
          <SiteFooter />
          {/* room for the bottom bar on phones */}
          <div data-nav-spacer className="h-[calc(84px+env(safe-area-inset-bottom))] md:hidden" aria-hidden="true" />
        </div>
      </div>
      <Suspense fallback={<BottomNav signedIn={false} />}>
        <BottomNavForUser />
      </Suspense>
      <Suspense fallback={null}>
        <TourHostForUser />
      </Suspense>
    </>
  );
}
