import Link from "next/link";
import { CalendarCheck, MapPin, Users, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { UserLink } from "@/components/profile/user-link";
import { attendeeSummary, placeLabel } from "@/lib/events/format";
import type { EventListItem } from "@/lib/events/queries";
import { formatEventDate, isPastEvent } from "@/lib/events/time";
import { DateBlock } from "./date-block";

export function ViewerStatusBadge({ status }: { status: EventListItem["viewerStatus"] }) {
  if (status === "GOING") {
    return (
      <Badge variant="success">
        <CalendarCheck aria-hidden="true" className="size-3" /> Du bist dabei
      </Badge>
    );
  }
  if (status === "MAYBE") return <Badge variant="warning">Vielleicht dabei</Badge>;
  return null;
}

export function EventCard({ event }: { event: EventListItem }) {
  const href = `/veranstaltungen/${event.id}`;
  const past = isPastEvent(event);

  return (
    <Card className="hover:border-primary/40 transition">
      <article className="flex gap-4 p-4 sm:p-5">
        <DateBlock date={event.startsAt} past={past} />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold tracking-tight">
              <Link href={href} className="hover:underline">
                {event.title}
              </Link>
            </h3>
            {past ? <Badge variant="outline">Vorbei</Badge> : null}
            <ViewerStatusBadge status={event.viewerStatus} />
          </div>

          <p className="text-muted-foreground text-sm">
            <time dateTime={event.startsAt.toISOString()}>{formatEventDate(event.startsAt, event.endsAt)}</time>
          </p>

          <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
            {event.isOnline ? (
              <Badge variant="primary">
                <Video aria-hidden="true" className="size-3" /> Online
              </Badge>
            ) : (
              <span className="inline-flex min-w-0 items-center gap-1">
                <MapPin aria-hidden="true" className="size-4 shrink-0" />
                <span className="truncate">{placeLabel(event)}</span>
              </span>
            )}
            {event.group ? (
              <Badge variant="outline">
                <Users aria-hidden="true" className="size-3" /> {event.group.name}
              </Badge>
            ) : null}
          </div>

          <div className="border-border flex flex-wrap items-center justify-between gap-3 border-t pt-3">
            <UserLink user={event.host} showUsername={false} />
            <span className="text-muted-foreground text-sm">{attendeeSummary(event.going, event.capacity)}</span>
          </div>
        </div>
      </article>
    </Card>
  );
}
