import Link from "next/link";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ChatAvatar, chatTitle, firstName } from "./chat-avatar";
import { messagePreview, unreadLabel } from "@/lib/messages/format";
import type { ConversationSummary } from "@/lib/messages/queries";
import { cn, formatRelative } from "@/lib/utils";

function senderPrefix(c: ConversationSummary, viewerId: string): string {
  if (!c.lastMessage) return "";
  if (c.lastMessage.senderId === viewerId) return "Du: ";
  if (!c.isGroup) return "";
  const sender = c.others.find((u) => u.id === c.lastMessage?.senderId);
  return sender ? `${firstName(sender.name)}: ` : "";
}

export function ConversationList({ conversations, viewerId }: { conversations: ConversationSummary[]; viewerId: string }) {
  return (
    <ol className="space-y-2" aria-label="Unterhaltungen">
      {conversations.map((c) => {
        const title = chatTitle(c);
        const unread = c.unreadCount > 0;
        const preview = c.lastMessage
          ? `${senderPrefix(c, viewerId)}${messagePreview(c.lastMessage.body)}`
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
              <ChatAvatar isGroup={c.isGroup} others={c.others} image={c.group?.imageUrl} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className={cn("flex min-w-0 items-center gap-1.5 text-sm", unread ? "font-bold" : "font-semibold")}>
                    <span className="truncate">{title}</span>
                    {c.isGroup ? (
                      <span className="inline-flex shrink-0 items-center gap-0.5 text-xs font-semibold text-muted-foreground">
                        <Users aria-hidden="true" className="size-3" />
                        {c.others.length + 1}
                        <span className="sr-only"> Personen</span>
                      </span>
                    ) : null}
                  </p>
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
