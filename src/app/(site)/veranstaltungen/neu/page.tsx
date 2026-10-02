import type { Metadata } from "next";
import { EventForm } from "@/components/events/event-form";
import { requireUser } from "@/lib/auth/dal";
import { getUserGroups } from "@/lib/events/queries";

export const metadata: Metadata = { title: "Treffen planen" };

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function NewEventPage(props: PageProps<"/veranstaltungen/neu">) {
  const sp = await props.searchParams;
  const slug = first(sp.gruppe)?.trim();
  const returnTo = slug ? `/veranstaltungen/neu?gruppe=${encodeURIComponent(slug)}` : "/veranstaltungen/neu";
  const user = await requireUser(returnTo);
  const groups = await getUserGroups(user.id);
  const preselected = slug ? groups.find((g) => g.slug === slug) : undefined;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 md:py-14">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Treffen planen</h1>
      <p className="text-muted-foreground mt-3 max-w-prose">
        Ein Bibelabend, ein Gebetstreffen, ein Spaziergang – lade andere ein. Du kannst alles später noch ändern.
      </p>
      {preselected ? (
        <p className="text-muted-foreground mt-2 text-sm">
          Für die Gruppe <strong className="text-foreground font-medium">{preselected.name}</strong>.
        </p>
      ) : null}
      <div className="mt-8">
        <EventForm
          groups={groups}
          initial={preselected ? { groupId: preselected.id, visibility: "GROUP" } : undefined}
        />
      </div>
    </main>
  );
}
