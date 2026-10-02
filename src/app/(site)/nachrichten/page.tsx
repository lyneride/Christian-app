import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle, PenLine } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { listConversations } from "@/lib/messages/queries";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ConversationList } from "@/components/messages/conversation-list";

export const metadata: Metadata = {
  title: "Nachrichten",
  description: "Deine persönlichen Unterhaltungen mit anderen Mitgliedern.",
};

export default async function MessagesPage() {
  const user = await requireUser("/nachrichten");
  const conversations = await listConversations(user.id);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 md:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Nachrichten</h1>
          <p className="mt-2 text-muted-foreground">Persönliche Gespräche – nur du und dein Gegenüber können sie lesen.</p>
        </div>
        <Link href="/nachrichten/neu" className={buttonClasses("primary", "md")}>
          <PenLine aria-hidden="true" />
          Neue Nachricht
        </Link>
      </div>

      <section className="mt-8">
        {conversations.length === 0 ? (
          <EmptyState
            icon={<MessageCircle aria-hidden="true" />}
            title="Noch keine Nachrichten"
            description="Menschen zum Schreiben findest du in Gruppen und in der Gemeinschaft – auf jedem Profil kannst du eine Nachricht beginnen."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Link href="/nachrichten/neu" className={buttonClasses("primary", "sm")}>
                  Nachricht schreiben
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
