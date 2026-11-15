import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronDown, History, Users } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { parseBefore } from "@/lib/messages/format";
import { getConversation, listMessages, MESSAGE_PAGE_SIZE } from "@/lib/messages/queries";
import { buttonClasses } from "@/components/ui/button";
import { AutoRefresh } from "@/components/messages/auto-refresh";
import { MarkConversationRead } from "@/components/messages/mark-conversation-read";
import { MessageForm } from "@/components/messages/message-form";
import { MessageList } from "@/components/messages/message-list";
import { ScrollToBottom } from "@/components/messages/scroll-to-bottom";
import { UserLink } from "@/components/messages/user-link";
import { ChatAvatar, chatTitle } from "@/components/messages/chat-avatar";
import { LeaveChatButton } from "@/components/messages/leave-chat-button";
import { groupPath } from "@/lib/validation/community";

type Props = PageProps<"/nachrichten/[id]">;

const DELETED_NAME = "Ehemaliges Mitglied";

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { id } = await props.params;
  const user = await requireUser(`/nachrichten/${id}`);
  const conversation = await getConversation(id, user.id);
  if (!conversation) return { title: "Unterhaltung", robots: { index: false } };
  const title = conversation.isGroup ? chatTitle(conversation) : `Unterhaltung mit ${chatTitle(conversation)}`;
  return { title, robots: { index: false } };
}

export default async function ConversationPage(props: Props) {
  const [{ id }, sp] = await Promise.all([props.params, props.searchParams]);
  const user = await requireUser(`/nachrichten/${id}`);
  const conversation = await getConversation(id, user.id);
  if (!conversation) notFound();

  const before = parseBefore(sp.vor);
  const { messages, hasMore } = await listMessages(id, { before, limit: MESSAGE_PAGE_SIZE });
  const partner = conversation.others[0];
  const latestMessageId = messages[messages.length - 1]?.id ?? null;
  const oldest = messages[0];

  return (
    <main data-chat-view className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 sm:px-6">
      <header className="sticky top-16 z-20 -mx-4 border-b border-border bg-background px-4 py-2.5 sm:-mx-6 sm:px-6">
        <div className="flex items-center gap-2">
          <Link href="/nachrichten" className={buttonClasses("ghost", "icon", "shrink-0")} aria-label="Zurück zu allen Nachrichten">
            <ArrowLeft aria-hidden="true" />
          </Link>
          {conversation.isGroup ? (
            <details className="group/members static min-w-0 flex-1">
              <summary className="flex cursor-pointer list-none items-center gap-2.5 rounded-2xl py-1 pr-2 hover:bg-surface-muted [&::-webkit-details-marker]:hidden">
                <ChatAvatar isGroup others={conversation.others} size="sm" />
                <span className="min-w-0 flex-1">
                  <h1 className="truncate font-display text-base font-extrabold">{chatTitle(conversation)}</h1>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users aria-hidden="true" className="size-3" />
                    {conversation.participants.length} Personen
                    {conversation.group ? " · Gruppenchat" : ""}
                  </span>
                </span>
                <ChevronDown aria-hidden="true" className="size-4 shrink-0 text-muted-foreground transition group-open/members:rotate-180" />
              </summary>
              <div className="absolute inset-x-4 top-full mt-1 max-h-[60dvh] space-y-4 overflow-y-auto rounded-card border border-border bg-surface p-4 shadow-pop sm:inset-x-6">
                <ul className="flex flex-wrap gap-x-4 gap-y-2" aria-label="Wer ist dabei">
                  {conversation.participants.map((p) => (
                    <li key={p.user.id} className="min-w-0">
                      {p.user.id === user.id ? (
                        <span className="text-sm font-semibold">Du</span>
                      ) : (
                        <UserLink user={p.user} size="sm" />
                      )}
                    </li>
                  ))}
                </ul>
                {conversation.group ? (
                  <p className="text-sm text-muted-foreground">
                    Alle Mitglieder von{" "}
                    <Link href={groupPath(conversation.group.slug)} className="font-semibold text-primary hover:underline">
                      {conversation.group.name}
                    </Link>{" "}
                    sind automatisch dabei.
                  </p>
                ) : (
                  <LeaveChatButton conversationId={conversation.id} />
                )}
              </div>
            </details>
          ) : (
            <h1 className="flex min-w-0 items-center gap-2 text-base font-semibold">
              {partner ? (
                <UserLink user={partner} size="sm" showUsername className="text-base" />
              ) : (
                <span className="text-muted-foreground">{DELETED_NAME}</span>
              )}
            </h1>
          )}
        </div>
      </header>

      <section className="flex-1 py-6">
        {hasMore && oldest ? (
          <div className="mb-6 flex justify-center">
            <Link
              href={`/nachrichten/${id}?vor=${encodeURIComponent(oldest.createdAt.toISOString())}`}
              className={buttonClasses("outline", "sm")}
              prefetch={false}
            >
              <History aria-hidden="true" />
              Ältere Nachrichten anzeigen
            </Link>
          </div>
        ) : null}
        {before ? (
          <div className="mb-6 flex justify-center">
            <Link href={`/nachrichten/${id}`} className={buttonClasses("ghost", "sm")}>
              Zu den neuesten Nachrichten
            </Link>
          </div>
        ) : null}
        <MessageList messages={messages} viewerId={user.id} showSender={conversation.isGroup || conversation.others.length > 1} />
      </section>

      <div className="sticky bottom-0 z-20 -mx-4 border-t border-border bg-background px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:-mx-6 sm:px-6">
        <MessageForm conversationId={id} />
      </div>

      {before ? null : <ScrollToBottom trigger={latestMessageId} />}
      <MarkConversationRead conversationId={id} latestMessageId={latestMessageId} />
      <AutoRefresh />
    </main>
  );
}
