import type { Metadata } from "next";
import Link from "next/link";
import { BellOff, MessageCircle } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { parsePage } from "@/lib/pagination";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { NotificationItem } from "@/components/notifications/notification-item";
import { MarkAllReadButton } from "@/components/notifications/mark-all-read-button";
import { listNotificationsPage } from "./queries";

export const metadata: Metadata = {
  title: "Benachrichtigungen",
  description: "Was sich bei deinen Anliegen, Gruppen und Nachrichten getan hat.",
};

const PER_PAGE = 30;

export default async function NotificationsPage(props: PageProps<"/benachrichtigungen">) {
  const sp = await props.searchParams;
  const user = await requireUser("/benachrichtigungen");
  const page = parsePage(sp.seite, PER_PAGE);
  const { items, total, unread } = await listNotificationsPage(user.id, page);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 md:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Benachrichtigungen</h1>
          <p className="mt-2 text-muted-foreground">
            {unread === 0 ? "Du bist auf dem neuesten Stand." : unread === 1 ? "Eine ungelesene Benachrichtigung." : `${unread} ungelesene Benachrichtigungen.`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/nachrichten" className={buttonClasses("ghost", "sm")}>
            <MessageCircle aria-hidden="true" />
            Nachrichten
          </Link>
          {total > 0 ? <MarkAllReadButton disabled={unread === 0} /> : null}
        </div>
      </div>

      <section className="mt-8">
        {items.length === 0 ? (
          <EmptyState
            icon={<BellOff aria-hidden="true" />}
            title="Noch nichts Neues"
            description="Hier erfährst du, wenn jemand mitbetet, kommentiert, dich in eine Gruppe aufnimmt oder dir schreibt."
          />
        ) : (
          <ol className="space-y-2" aria-label="Benachrichtigungen">
            {items.map((n) => (
              <NotificationItem key={n.id} notification={n} />
            ))}
          </ol>
        )}
        <Pagination basePath="/benachrichtigungen" page={page.page} perPage={page.perPage} total={total} />
      </section>
    </main>
  );
}
