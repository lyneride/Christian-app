import Link from "next/link";
import { FEED_TABS, FEED_TAB_LABELS, MEMBER_ONLY_TABS, type FeedTab } from "@/lib/validation/community";
import { cn } from "@/lib/utils";

/** Tab row for the feed (`?tab=`). Member-only tabs are hidden for guests. */
export function FeedTabs({ active, signedIn, basePath = "/gemeinschaft" }: { active: FeedTab; signedIn: boolean; basePath?: string }) {
  const tabs = FEED_TABS.filter((t) => signedIn || !MEMBER_ONLY_TABS.includes(t));
  return (
    <nav aria-label="Beiträge filtern" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex gap-1 border-b border-border">
        {tabs.map((tab) => {
          const current = tab === active;
          return (
            <li key={tab}>
              <Link
                href={tab === "alle" ? basePath : `${basePath}?tab=${tab}`}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "-mb-px inline-block border-b-2 px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                  current ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
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
