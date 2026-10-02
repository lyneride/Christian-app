import { UserLink } from "@/components/profile/user-link";
import { Badge } from "@/components/ui/badge";
import { moreAttendeesLabel } from "@/lib/events/format";
import type { EventAttendee } from "@/lib/events/queries";

export function AttendeeList({ attendees, more, hostId }: { attendees: EventAttendee[]; more: number; hostId: string }) {
  if (attendees.length === 0) {
    return <p className="text-sm text-muted-foreground">Noch hat niemand zugesagt. Vielleicht du?</p>;
  }
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-3">
      {attendees.map(({ user, status }) => (
        <li key={user.id} className="flex items-center gap-2">
          <UserLink user={user} size="sm" showUsername={false} />
          {user.id === hostId ? <Badge variant="accent">lädt ein</Badge> : null}
          {status === "MAYBE" ? <Badge variant="outline">vielleicht</Badge> : null}
        </li>
      ))}
      {more > 0 ? <li className="self-center text-sm text-muted-foreground">{moreAttendeesLabel(more)}</li> : null}
    </ul>
  );
}
