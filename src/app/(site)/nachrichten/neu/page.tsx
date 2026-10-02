import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { buttonClasses } from "@/components/ui/button";
import { NewMessageForm } from "@/components/messages/new-message-form";

export const metadata: Metadata = {
  title: "Neue Nachricht",
  description: "Schreib einem Mitglied eine persönliche Nachricht.",
};

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function NewMessagePage(props: PageProps<"/nachrichten/neu">) {
  const sp = await props.searchParams;
  const an = (first(sp.an) ?? "").trim().replace(/^@/, "").slice(0, 30);
  await requireUser(an ? `/nachrichten/neu?an=${encodeURIComponent(an)}` : "/nachrichten/neu");

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 md:py-14">
      <Link href="/nachrichten" className={buttonClasses("ghost", "sm", "-ml-3")}>
        <ArrowLeft aria-hidden="true" />
        Alle Nachrichten
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Neue Nachricht</h1>
      <p className="mt-2 text-muted-foreground">
        Gibt es schon eine Unterhaltung mit dieser Person, landet deine Nachricht dort.
      </p>
      <div className="mt-8 rounded-card border border-border bg-surface p-5 shadow-soft sm:p-6">
        <NewMessageForm initialUsername={an || undefined} />
      </div>
    </main>
  );
}
