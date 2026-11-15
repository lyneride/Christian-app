import type { Metadata } from "next";
import Link from "next/link";
import { PenLine, Users } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { listConversations } from "@/lib/messages/queries";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ConversationList } from "@/components/messages/conversation-list";

export const metadata: Metadata = {
  title: "Nachrichten",
  description: "Deine Unterhaltungen und Gruppenchats.",
};

export default async function MessagesPage() {
  const user = await requireUser("/nachrichten");
  const conversations = await listConversations(user.id);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6 sm:py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[30px] leading-tight sm:text-4xl">Nachrichten</h1>
          <p className="mt-2 text-muted-foreground">Gespräche zu zweit und Gruppenchats – nur wer dabei ist, kann mitlesen.</p>
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
          <Link href="/nachrichten/neu" className={buttonClasses("primary", "md")} data-tour="chat-new">
            <PenLine aria-hidden="true" />
            Nachricht
          </Link>
          <Link href="/nachrichten/neu?art=gruppe" className={buttonClasses("outline", "md")} data-tour="chat-group">
            <Users aria-hidden="true" />
            Gruppenchat
          </Link>
        </div>
      </div>

      <section className="mt-8">
        {conversations.length === 0 ? (
          <EmptyState
            pose="wave"
            title="Noch keine Nachrichten"
            description="Schreib einem Freund, starte einen Gruppenchat – oder öffne den Chat einer deiner Gruppen."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Link href="/freunde" className={buttonClasses("primary", "sm")}>
                  Freunde finden
                </Link>
                <Link href="/gruppen" className={buttonClasses("outline", "sm")}>
                  Gruppen entdecken
                </Link>
              </div>
            }
          />
        ) : (
          <ConversationList conversations={conversations} viewerId={user.id} />
        )}
      </section>
    </main>
  );
}
