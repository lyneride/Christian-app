import Link from "next/link";
import type { ReactNode } from "react";
import { CalendarDays, HandHeart, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { listGroupEvents, listGroupPrayers, listMembers, type Membership } from "@/lib/groups/queries";
import { formatDateTime, formatRelative } from "@/lib/utils";
import type { Viewer } from "@/lib/visibility";
import { MemberRow } from "./member-row";

const PRAYER_STATUS: Record<"OPEN" | "ANSWERED" | "CLOSED", { label: string; variant: "success" | "default" | "outline" }> = {
  OPEN: { label: "Offen", variant: "default" },
  ANSWERED: { label: "Erhört", variant: "success" },
  CLOSED: { label: "Geschlossen", variant: "outline" },
};

function SectionHeading({ icon, title, action }: { icon: ReactNode; title: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
        <span className="text-primary [&_svg]:size-5" aria-hidden="true">
          {icon}
        </span>
        {title}
      </h2>
      {action}
    </div>
  );
}

/** Latest prayer requests of the group (read-only teaser; the prayer wall owns the details). */
export async function GroupPrayers({ groupId, slug, viewer, isMember }: { groupId: string; slug: string; viewer: Viewer | null; isMember: boolean }) {
  const prayers = await listGroupPrayers(groupId, viewer);
  return (
    <section aria-labelledby="gruppe-gebet" className="space-y-3">
      <SectionHeading
        icon={<HandHeart />}
        title="Gebetsanliegen"
        action={
          isMember ? (
            <Link href={`/gebet/neu?gruppe=${encodeURIComponent(slug)}`} className={buttonClasses("outline", "sm")}>
              <Plus aria-hidden="true" /> Anliegen in der Gruppe teilen
            </Link>
          ) : null
        }
      />
      {prayers.length === 0 ? (
        <p className="text-sm text-muted-foreground">Noch keine Anliegen in dieser Gruppe.</p>
      ) : (
        <ul className="divide-y divide-border rounded-card border border-border bg-surface">
          {prayers.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-sm">
              <Link href={`/gebet/${p.id}`} className="min-w-0 flex-1 font-medium hover:underline">
                {p.title}
              </Link>
              <Badge variant={PRAYER_STATUS[p.status].variant}>{PRAYER_STATUS[p.status].label}</Badge>
              <span className="text-xs text-muted-foreground">
                {p.isAnonymous ? "anonym" : p.author.name} · {formatRelative(p.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Upcoming events of the group (teaser; the events area owns the details). */
export async function GroupEvents({ groupId, slug, viewer, isMember }: { groupId: string; slug: string; viewer: Viewer | null; isMember: boolean }) {
  const events = await listGroupEvents(groupId, viewer, isMember);
  return (
    <section aria-labelledby="gruppe-treffen" className="space-y-3">
      <SectionHeading
        icon={<CalendarDays />}
        title="Nächste Treffen"
        action={
          isMember ? (
            <Link href={`/veranstaltungen/neu?gruppe=${encodeURIComponent(slug)}`} className={buttonClasses("outline", "sm")}>
              <Plus aria-hidden="true" /> Treffen planen
            </Link>
          ) : null
        }
      />
      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground">Kein Treffen geplant.</p>
      ) : (
        <ul className="divide-y divide-border rounded-card border border-border bg-surface">
          {events.map((e) => (
            <li key={e.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-sm">
              <Link href={`/veranstaltungen/${e.id}`} className="min-w-0 flex-1 font-medium hover:underline">
                {e.title}
              </Link>
              <span className="text-xs text-muted-foreground">
                <time dateTime={e.startsAt.toISOString()}>{formatDateTime(e.startsAt)}</time>
                {e.isOnline ? " · online" : e.city ? ` · ${e.city}` : e.location ? ` · ${e.location}` : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Member list (leadership first). `manage` enables the controls for owner/admin. */
export async function MemberList({
  groupId,
  viewerId,
  actor,
  status = "ACTIVE",
  manage = false,
  limit,
  emptyText = "Noch keine Mitglieder.",
}: {
  groupId: string;
  viewerId: string | null;
  actor: Membership | null;
  status?: "ACTIVE" | "PENDING" | "BANNED";
  manage?: boolean;
  limit?: number;
  emptyText?: string;
}) {
  const members = await listMembers(groupId, status, limit);
  if (members.length === 0) return <p className="text-sm text-muted-foreground">{emptyText}</p>;
  return (
    <ul className="divide-y divide-border">
      {members.map((m) => (
        <MemberRow key={m.user.id} groupId={groupId} member={m} actor={actor} isSelf={m.user.id === viewerId} manage={manage} />
      ))}
    </ul>
  );
}
