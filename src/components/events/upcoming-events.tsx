import Link from "next/link";
import { ArrowRight, MapPin, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { placeLabel } from "@/lib/events/format";
import { upcomingForUser } from "@/lib/events/queries";
import { formatEventDate } from "@/lib/events/time";
import { cn } from "@/lib/utils";
import { DateBlock } from "./date-block";
import { AreaTile } from "@/components/layout/area-card";

export interface UpcomingEventsProps {
  userId: string;
  limit?: number;
  className?: string;
}

/**
 * Dashboard widget: the member's next events (hosted or answered with
 * GOING/MAYBE). Server component – render it inside `<Suspense>`.
 */
export async function UpcomingEvents({ userId, limit = 5, className }: UpcomingEventsProps) {
  const events = await upcomingForUser(userId, limit);

  return (
    <section aria-labelledby="upcoming-events-heading" className={cn("space-y-3", className)}>
      <div className="flex items-center gap-3">
        <AreaTile area="gemeinschaft" size="sm" />
        <h2 id="upcoming-events-heading" className="min-w-0 flex-1 text-[17px]">
          Deine nächsten Treffen
        </h2>
        <Link href="/veranstaltungen" className="inline-flex items-center gap-1 font-display text-sm font-extrabold text-primary hover:underline">
          Alle <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>

      {events.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Nichts geplant. In der{" "}
          <Link href="/veranstaltungen" className="text-primary underline-offset-4 hover:underline">
            Übersicht
          </Link>{" "}
          findest du Bibelabende, Gebetstreffen und mehr.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {events.map((event) => (
            <li key={event.id} className="flex items-center gap-3 py-3 first:pt-1 last:pb-0">
              <DateBlock date={event.startsAt} size="sm" />
              <div className="min-w-0 flex-1">
                <Link href={`/veranstaltungen/${event.id}`} className="block truncate font-display font-extrabold hover:underline">
                  {event.title}
                </Link>
                <p className="text-muted-foreground flex flex-wrap items-center gap-x-2 text-xs">
                  <span>{formatEventDate(event.startsAt, event.endsAt)}</span>
                  <span className="inline-flex items-center gap-1">
                    {event.isOnline ? (
                      <Video aria-hidden="true" className="size-3" />
                    ) : (
                      <MapPin aria-hidden="true" className="size-3" />
                    )}
                    {placeLabel(event)}
                  </span>
                </p>
              </div>
              {event.hostId === userId ? (
                <Badge variant="accent">Du lädst ein</Badge>
              ) : event.viewerStatus === "MAYBE" ? (
                <Badge variant="warning">Vielleicht</Badge>
              ) : (
                <Badge variant="success">Dabei</Badge>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
