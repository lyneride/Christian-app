import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarPlus, Clock, ExternalLink, Lock, MapPin, Pencil, Users, Video } from "lucide-react";
import { MarkdownBody } from "@/components/content/markdown-body";
import { AttendeeList } from "@/components/events/attendee-list";
import { DateBlock } from "@/components/events/date-block";
import { DeleteEventButton } from "@/components/events/delete-event-button";
import { ViewerStatusBadge } from "@/components/events/event-card";
import { RsvpBar } from "@/components/events/rsvp-bar";
import { ReportButton } from "@/components/moderation/report-button";
import { UserLink } from "@/components/profile/user-link";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { getCurrentUser, isModerator } from "@/lib/auth/dal";
import { mapsHref, placeLabel } from "@/lib/events/format";
import { getEvent } from "@/lib/events/queries";
import { formatEventDate, isPastEvent } from "@/lib/events/time";
import { markdownToText, renderMarkdown } from "@/lib/markdown";
import { VISIBILITY_LABELS } from "@/lib/visibility";

async function viewerContext() {
  const user = await getCurrentUser();
  return { user, viewer: user ? { id: user.id, role: user.role } : null };
}

export async function generateMetadata(props: PageProps<"/veranstaltungen/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const { viewer } = await viewerContext();
  const event = await getEvent(id, viewer);
  if (!event) return { title: "Treffen" };
  return {
    title: event.title,
    description: `${formatEventDate(event.startsAt, event.endsAt)} · ${placeLabel(event)} – ${markdownToText(event.description, 140)}`,
  };
}

export default async function EventPage(props: PageProps<"/veranstaltungen/[id]">) {
  const { id } = await props.params;
  const { user, viewer } = await viewerContext();
  const event = await getEvent(id, viewer);
  if (!event) notFound();

  const path = `/veranstaltungen/${event.id}`;
  const past = isPastEvent(event);
  const isHost = !!user && user.id === event.hostId;
  const canEdit = isHost || isModerator(user);
  const html = renderMarkdown(event.description);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 md:py-14">
      <nav aria-label="Zurück" className="mb-6 text-sm">
        <Link href="/veranstaltungen" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
          <ArrowLeft aria-hidden="true" className="size-4" /> Alle Treffen
        </Link>
      </nav>

      <article className="space-y-8">
        <header className="flex gap-5">
          <DateBlock date={event.startsAt} past={past} className="mt-1" />
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {past ? <Badge variant="outline">Vorbei</Badge> : null}
              {event.isOnline ? (
                <Badge variant="primary">
                  <Video aria-hidden="true" className="size-3" /> Online
                </Badge>
              ) : (
                <Badge>
                  <MapPin aria-hidden="true" className="size-3" /> Vor Ort
                </Badge>
              )}
              {event.visibility !== "PUBLIC" ? (
                <Badge variant="outline">
                  <Lock aria-hidden="true" className="size-3" /> {VISIBILITY_LABELS[event.visibility].label}
                </Badge>
              ) : null}
              <ViewerStatusBadge status={event.viewerStatus} />
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{event.title}</h1>
            <p className="flex items-center gap-2 text-muted-foreground">
              <Clock aria-hidden="true" className="size-4 shrink-0" />
              <time dateTime={event.startsAt.toISOString()}>{formatEventDate(event.startsAt, event.endsAt)}</time>
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                Eingeladen von <UserLink user={event.host} />
              </span>
              {event.group ? (
                <Link href={`/gruppen/${event.group.slug}`} className="inline-flex items-center gap-1 hover:text-foreground">
                  <Users aria-hidden="true" className="size-4" /> {event.group.name}
                </Link>
              ) : null}
            </div>
          </div>
        </header>

        <section aria-label="Deine Antwort" className="rounded-card border border-border bg-surface p-5 shadow-soft">
          <RsvpBar
            eventId={event.id}
            status={event.viewerStatus}
            going={event.going}
            maybe={event.maybe}
            capacity={event.capacity}
            isPast={past}
            signedIn={!!user}
            nextPath={path}
          />
        </section>

        <section aria-labelledby="ort-heading" className="space-y-2">
          <h2 id="ort-heading" className="text-lg font-semibold">
            {event.isOnline ? "Online dabei sein" : "Wo"}
          </h2>
          {event.isOnline ? (
            user ? (
              event.onlineUrl ? (
                <a href={event.onlineUrl} target="_blank" rel="noopener noreferrer" className={buttonClasses("outline", "md")}>
                  <ExternalLink aria-hidden="true" /> Zum Online-Treffen
                </a>
              ) : (
                <p className="text-sm text-muted-foreground">Der Link folgt noch.</p>
              )
            ) : (
              <p className="text-sm text-muted-foreground">
                Den Link sehen nur angemeldete Mitglieder.{" "}
                <Link href={`/anmelden?next=${encodeURIComponent(path)}`} className="text-primary underline-offset-4 hover:underline">
                  Anmelden
                </Link>
              </p>
            )
          ) : (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <p className="inline-flex items-center gap-2">
                <MapPin aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                {placeLabel(event)}
              </p>
              <a
                href={mapsHref(event.location, event.city)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
              >
                In Karten öffnen <ExternalLink aria-hidden="true" className="size-3.5" />
              </a>
            </div>
          )}
        </section>

        <section aria-labelledby="beschreibung-heading">
          <h2 id="beschreibung-heading" className="text-lg font-semibold">
            Worum es geht
          </h2>
          <MarkdownBody html={html} className="mt-3" />
        </section>

        <section aria-labelledby="dabei-heading" className="space-y-3">
          <h2 id="dabei-heading" className="text-lg font-semibold">
            Wer dabei ist
          </h2>
          <AttendeeList attendees={event.attendees} more={event.moreAttendees} hostId={event.hostId} />
        </section>

        <footer className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
          <a href={`/api/veranstaltungen/${event.id}/ics`} download className={buttonClasses("outline", "sm")}>
            <CalendarPlus aria-hidden="true" /> Zum Kalender hinzufügen (.ics)
          </a>
          {canEdit ? (
            <>
              <Link href={`${path}/bearbeiten`} className={buttonClasses("ghost", "sm")}>
                <Pencil aria-hidden="true" /> Bearbeiten
              </Link>
              <DeleteEventButton eventId={event.id} />
            </>
          ) : null}
          {!isHost ? <ReportButton targetType="event" targetId={event.id} signedIn={!!user} variant="link" className="ml-auto" /> : null}
        </footer>
      </article>
    </main>
  );
}
