import Link from "next/link";
import { ArrowRight, MapPin, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { placeLabel } from "@/lib/events/format";
import { upcomingForUser } from "@/lib/events/queries";
import { formatEventDate } from "@/lib/events/time";
import { cn } from "@/lib/utils";
import { DateBlock } from "./date-block";

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
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="upcoming-events-heading" className="text-lg font-semibold tracking-tight">
          Deine nächsten Treffen
        </h2>
        <Link href="/veranstaltungen" className="inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline">
          Alle Treffen <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nichts geplant. In der{" "}
          <Link href="/veranstaltungen" className="text-primary underline-offset-4 hover:underline">
            Übersicht
          </Link>{" "}
          findest du Bibelabende, Gebetstreffen und mehr.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-card border border-border bg-surface">
          {events.map((event) => (
            <li key={event.id} className="flex items-center gap-3 p-3">
              <DateBlock date={event.startsAt} size="sm" />
              <div className="min-w-0 flex-1">
                <Link href={`/veranstaltungen/${event.id}`} className="block truncate font-medium hover:underline">
                  {event.title}
                </Link>
                <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                  <span>{formatEventDate(event.startsAt, event.endsAt)}</span>
                  <span className="inline-flex items-center gap-1">
                    {event.isOnline ? <Video aria-hidden="true" className="size-3" /> : <MapPin aria-hidden="true" className="size-3" />}
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
