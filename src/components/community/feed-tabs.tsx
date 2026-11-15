import Link from "next/link";
import { FEED_TABS, FEED_TAB_LABELS, MEMBER_ONLY_TABS, type FeedTab } from "@/lib/validation/community";
import { cn } from "@/lib/utils";

/** Tab row for the feed (`?tab=`). Member-only tabs are hidden for guests. */
export function FeedTabs({ active, signedIn, basePath = "/gemeinschaft" }: { active: FeedTab; signedIn: boolean; basePath?: string }) {
  const tabs = FEED_TABS.filter((t) => signedIn || !MEMBER_ONLY_TABS.includes(t));
  return (
    <nav aria-label="Beiträge filtern" className={cn("scrollbar-none -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0", tabs.length > 4 && "scroll-fade-x")}>
      <ul className="flex w-max gap-1 rounded-full bg-surface-muted p-1">
        {tabs.map((tab) => {
          const current = tab === active;
          return (
            <li key={tab}>
              <Link
                href={tab === "alle" ? basePath : `${basePath}?tab=${tab}`}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "inline-flex h-10 items-center rounded-full px-4 font-display text-sm font-black whitespace-nowrap transition-colors",
                  current ? "bg-surface text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {FEED_TAB_LABELS[tab]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
