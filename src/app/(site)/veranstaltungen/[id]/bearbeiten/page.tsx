import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { EventForm, type EventFormInitial } from "@/components/events/event-form";
import { isModerator, requireUser } from "@/lib/auth/dal";
import { getEvent, getUserGroups } from "@/lib/events/queries";
import { utcToZonedLocal } from "@/lib/events/time";

export const metadata: Metadata = { title: "Treffen bearbeiten" };

export default async function EditEventPage(props: PageProps<"/veranstaltungen/[id]/bearbeiten">) {
  const { id } = await props.params;
  const user = await requireUser(`/veranstaltungen/${id}/bearbeiten`);
  const event = await getEvent(id, { id: user.id, role: user.role });
  if (!event) notFound();
  if (event.hostId !== user.id && !isModerator(user)) redirect(`/veranstaltungen/${id}`);

  const groups = await getUserGroups(user.id);
  // Moderators may edit a group's event without being a member: keep the group selectable.
  if (event.group && !groups.some((g) => g.id === event.group?.id)) groups.push(event.group);

  const initial: EventFormInitial = {
    title: event.title,
    description: event.description,
    startsAt: utcToZonedLocal(event.startsAt),
    endsAt: event.endsAt ? utcToZonedLocal(event.endsAt) : "",
    isOnline: event.isOnline,
    onlineUrl: event.onlineUrl ?? "",
    location: event.location ?? "",
    city: event.city ?? "",
    visibility: event.visibility === "PRIVATE" ? "MEMBERS" : event.visibility,
    groupId: event.groupId,
    capacity: event.capacity ? String(event.capacity) : "",
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 md:py-14">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Treffen bearbeiten</h1>
      <p className="text-muted-foreground mt-3 max-w-prose">
        Wer schon zugesagt hat, sieht die Änderungen beim nächsten Besuch.
      </p>
      <div className="mt-8">
        <EventForm groups={groups} eventId={event.id} initial={initial} />
      </div>
    </main>
  );
}
