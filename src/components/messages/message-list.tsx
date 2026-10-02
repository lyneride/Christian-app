import { MessageCircle } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { groupByDay, timeLabel } from "@/lib/messages/format";
import type { MessageItem } from "@/lib/messages/queries";
import { cn, formatDateTime } from "@/lib/utils";
import { LinkifyReferences } from "./linkify-references";

function MessageBubble({ message, own, showSender }: { message: MessageItem; own: boolean; showSender: boolean }) {
  const stamp = formatDateTime(message.createdAt);
  return (
    <li className={cn("flex", own ? "justify-end" : "justify-start")}>
      <article
        aria-label={`${own ? "Du" : message.sender.name}, ${stamp}`}
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-xs sm:max-w-[75%]",
          own ? "rounded-br-md bg-primary-soft text-foreground" : "rounded-bl-md bg-surface-muted text-foreground",
        )}
      >
        {showSender && !own ? <p className="mb-0.5 text-xs font-semibold text-muted-foreground">{message.sender.name}</p> : null}
        <p className="break-words whitespace-pre-wrap [overflow-wrap:anywhere]">
          <LinkifyReferences text={message.body} />
        </p>
        <time dateTime={message.createdAt.toISOString()} title={stamp} className="mt-1 block text-right text-[11px] text-muted-foreground">
          {timeLabel(message.createdAt)}
        </time>
      </article>
    </li>
  );
}

/** Chronological message list with a separator per day. */
export function MessageList({ messages, viewerId, showSender = false }: { messages: MessageItem[]; viewerId: string; showSender?: boolean }) {
  if (messages.length === 0) {
    return (
      <EmptyState
        icon={<MessageCircle aria-hidden="true" />}
        title="Noch keine Nachrichten"
        description="Schreib die erste Nachricht – sie landet direkt hier."
      />
    );
  }

  const groups = groupByDay(messages);
  return (
    <ol className="space-y-6" aria-label="Nachrichtenverlauf">
      {groups.map((group) => (
        <li key={group.key}>
          <div className="sticky top-[7.25rem] z-10 flex justify-center">
            <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground shadow-xs">
              {group.label}
            </span>
          </div>
          <ol className="mt-4 space-y-2">
            {group.items.map((message) => (
              <MessageBubble key={message.id} message={message} own={message.senderId === viewerId} showSender={showSender} />
            ))}
          </ol>
        </li>
      ))}
    </ol>
  );
}
