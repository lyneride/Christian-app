import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { messagePreview, unreadLabel } from "@/lib/messages/format";
import type { ConversationSummary } from "@/lib/messages/queries";
import { cn, formatRelative } from "@/lib/utils";

const DELETED_NAME = "Ehemaliges Mitglied";

function conversationTitle(c: ConversationSummary): string {
  if (c.others.length === 0) return DELETED_NAME;
  return c.others.map((u) => u.name).join(", ");
}

export function ConversationList({ conversations, viewerId }: { conversations: ConversationSummary[]; viewerId: string }) {
  return (
    <ol className="space-y-2" aria-label="Unterhaltungen">
      {conversations.map((c) => {
        const title = conversationTitle(c);
        const first = c.others[0];
        const unread = c.unreadCount > 0;
        const preview = c.lastMessage
          ? `${c.lastMessage.senderId === viewerId ? "Du: " : ""}${messagePreview(c.lastMessage.body)}`
          : "Noch keine Nachricht";
        const when = c.lastMessage?.createdAt ?? c.updatedAt;
        return (
          <li key={c.id}>
            <Link
              href={`/nachrichten/${c.id}`}
              className={cn(
                "flex items-center gap-3 rounded-card border border-border bg-surface px-4 py-3 shadow-soft transition hover:bg-surface-muted",
                unread && "border-primary/30",
              )}
              aria-label={`${title}${unread ? `, ${unreadLabel(c.unreadCount)}` : ""}`}
            >
              <Avatar name={first?.name ?? "?"} src={first?.avatarUrl} size="md" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className={cn("truncate text-sm", unread ? "font-semibold" : "font-medium")}>{title}</p>
                  <time dateTime={when.toISOString()} className="shrink-0 text-xs text-muted-foreground">
                    {formatRelative(when)}
                  </time>
                </div>
                <p className={cn("truncate text-sm", unread ? "text-foreground" : "text-muted-foreground")}>{preview}</p>
              </div>
              {unread ? (
                <Badge variant="primary" aria-hidden="true">
                  {c.unreadCount > 99 ? "99+" : c.unreadCount}
                </Badge>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
