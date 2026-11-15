import Link from "next/link";
import { Bell } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/dal";
import { unreadCount } from "@/lib/notifications";
import { totalUnreadMessages, unreadMessageNotifications } from "@/lib/messages/queries";

/** Placeholder for the header's Suspense boundary. */
export function NotificationBellSkeleton() {
  return <div className="size-11 animate-pulse rounded-full bg-surface-muted" aria-hidden="true" />;
}

/**
 * Header bell: renders nothing for guests, otherwise a link to the notification
 * centre with one combined badge (unread notifications + unread messages; the
 * "new message" notifications are subtracted so a message is not counted twice).
 */
export async function NotificationBell() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [notifications, messages, messageNotifications] = await Promise.all([
    unreadCount(user.id),
    totalUnreadMessages(user.id),
    unreadMessageNotifications(user.id),
  ]);
  const total = Math.max(0, notifications - messageNotifications) + messages;
  const label = total === 0 ? "Benachrichtigungen, keine ungelesenen" : `Benachrichtigungen, ${total} ungelesen`;

  return (
    <Link
      href="/benachrichtigungen"
      data-tour="bell"
      aria-label={label}
      title={label}
      className="relative inline-flex size-11 items-center justify-center rounded-full bg-surface text-foreground shadow-soft transition hover:bg-surface-muted"
    >
      <Bell className="size-[21px]" aria-hidden="true" />
      {total > 0 ? (
        <span
          aria-hidden="true"
          className="absolute -top-1 -right-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-area-gebet px-1 font-display text-[11px] leading-none font-black text-[#2b2340] ring-2 ring-background"
        >
          {total > 9 ? "9+" : total}
        </span>
      ) : null}
    </Link>
  );
}
