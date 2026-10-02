import { UserLink } from "@/components/messages/user-link";
import { cn, formatDateTime, formatRelative } from "@/lib/utils";
import { notificationTypeInfo } from "./type-icon";

export interface NotificationItemData {
  id: string;
  type: string;
  title: string;
  body: string | null;
  href: string | null;
  readAt: Date | null;
  createdAt: Date;
  actor: { name: string; username: string; avatarUrl: string | null } | null;
}

/** One row of the notification centre. The title links through the "open" route, which marks it read. */
export function NotificationItem({ notification }: { notification: NotificationItemData }) {
  const { icon: Icon, label } = notificationTypeInfo(notification.type);
  const unread = notification.readAt === null;
  const openHref = `/api/benachrichtigungen/${notification.id}/oeffnen`;
  return (
    <li
      className={cn(
        "relative flex gap-3 rounded-card border px-4 py-3 transition",
        unread ? "border-primary/30 bg-primary-soft/40" : "border-border bg-surface",
      )}
    >
      <span
        className={cn(
          "mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full",
          unread ? "bg-primary text-primary-foreground" : "bg-surface-muted text-muted-foreground",
        )}
        role="img"
        aria-label={label}
      >
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm", unread ? "font-semibold" : "font-medium")}>
          {/* Plain anchor on purpose: the target is a route handler that marks the notification read, so it must never be prefetched. */}
          <a href={openHref} className="after:absolute after:inset-0 after:rounded-card hover:underline">
            {notification.title}
          </a>
          {unread ? <span className="sr-only"> (ungelesen)</span> : null}
        </p>
        {notification.body ? <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{notification.body}</p> : null}
        <div className="relative z-10 mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          {notification.actor ? <UserLink user={notification.actor} size="xs" className="text-xs" /> : null}
          {notification.actor ? <span aria-hidden="true">·</span> : null}
          <time dateTime={notification.createdAt.toISOString()} title={formatDateTime(notification.createdAt)}>
            {formatRelative(notification.createdAt)}
          </time>
        </div>
      </div>
      {unread ? <span className="mt-2 size-2 shrink-0 rounded-full bg-primary" aria-hidden="true" /> : null}
    </li>
  );
}
