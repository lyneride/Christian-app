import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, History } from "lucide-react";
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

type Props = PageProps<"/nachrichten/[id]">;

const DELETED_NAME = "Ehemaliges Mitglied";

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { id } = await props.params;
  const user = await requireUser(`/nachrichten/${id}`);
  const conversation = await getConversation(id, user.id);
  const names = conversation?.others.map((u) => u.name).join(", ");
  return { title: names ? `Unterhaltung mit ${names}` : "Unterhaltung", robots: { index: false } };
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
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 sm:px-6">
      <header className="sticky top-14 z-20 -mx-4 flex items-center gap-2 border-b border-border bg-background/90 px-4 py-2.5 backdrop-blur sm:-mx-6 sm:px-6">
        <Link href="/nachrichten" className={buttonClasses("ghost", "icon", "size-9 shrink-0")} aria-label="Zurück zu allen Nachrichten">
          <ArrowLeft aria-hidden="true" />
        </Link>
        <h1 className="flex min-w-0 items-center gap-2 text-base font-semibold">
          {partner ? (
            <UserLink user={partner} size="sm" showUsername className="text-base" />
          ) : (
            <span className="text-muted-foreground">{DELETED_NAME}</span>
          )}
          {conversation.others.length > 1 ? (
            <span className="truncate text-sm font-normal text-muted-foreground">
              und {conversation.others.length - 1} weitere
            </span>
          ) : null}
        </h1>
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
        <MessageList messages={messages} viewerId={user.id} showSender={conversation.others.length > 1} />
      </section>

      <div className="sticky bottom-0 z-20 -mx-4 border-t border-border bg-background px-4 py-3 sm:-mx-6 sm:px-6">
        <MessageForm conversationId={id} />
      </div>

      {before ? null : <ScrollToBottom trigger={latestMessageId} />}
      <MarkConversationRead conversationId={id} latestMessageId={latestMessageId} />
      <AutoRefresh />
    </main>
  );
}
