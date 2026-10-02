import "server-only";
import { cache } from "react";
import type { Prisma } from "@/generated/prisma/client";
import type { RsvpStatus, UserStatus, Visibility } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import type { Page } from "@/lib/pagination";
import { canView, visibilityWhere, type Viewer } from "@/lib/visibility";
import type { EventKind, EventWhen } from "@/lib/validation/events";

/**
 * Server-only reads for events ("Treffen"). Visibility is enforced here with
 * the shared `canView` / `visibilityWhere` rules; the event's `hostId` plays
 * the role of `authorId`.
 */

/** Narrow member DTO for hosts and attendees (never the whole user row). */
export const hostSelect = { id: true, name: true, username: true, avatarUrl: true, status: true } as const;
export type EventHost = { id: string; name: string; username: string; avatarUrl: string | null; status: UserStatus };

const groupSelect = { id: true, name: true, slug: true } as const;
export type EventGroup = { id: string; name: string; slug: string };

/** How many attendees the detail page lists before "und n weitere". */
export const ATTENDEE_LIMIT = 24;

// ---------------------------------------------------------------------------
// Groups (fallback for `getUserGroups` from `@/lib/groups/queries`, which
// does not exist yet – queries `groupMember` directly)
// ---------------------------------------------------------------------------

/** Ids of the groups the user is an active member of (memoised per request). */
export const getMemberGroupIds = cache(async (userId: string): Promise<string[]> => {
  const rows = await prisma.groupMember.findMany({ where: { userId, status: "ACTIVE" }, select: { groupId: true } });
  return rows.map((r) => r.groupId);
});

export async function isActiveGroupMember(userId: string, groupId: string): Promise<boolean> {
  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
    select: { status: true },
  });
  return member?.status === "ACTIVE";
}

/** Groups the user may plan events for (active membership, any role). */
export async function getUserGroups(userId: string): Promise<EventGroup[]> {
  const rows = await prisma.groupMember.findMany({
    where: { userId, status: "ACTIVE" },
    select: { group: { select: groupSelect } },
    orderBy: { group: { name: "asc" } },
  });
  return rows.map((r) => r.group);
}

export async function findGroupBySlug(slug: string): Promise<EventGroup | null> {
  if (!slug || slug.length > 120) return null;
  return prisma.group.findUnique({ where: { slug }, select: groupSelect });
}

// ---------------------------------------------------------------------------
// Where fragments
// ---------------------------------------------------------------------------

type VisibilityClause =
  { visibility: Visibility } | { visibility: "GROUP"; groupId: { in: string[] } } | { authorId: string };

/** `visibilityWhere` for the Event model, where the owner column is `hostId`. */
export function eventVisibilityWhere(viewer: Viewer | null, memberGroupIds: string[]): Prisma.EventWhereInput {
  const base = visibilityWhere(viewer, memberGroupIds) as { visibility?: "PUBLIC"; OR?: VisibilityClause[] };
  if (!base.OR) return base.visibility ? { visibility: base.visibility } : {};
  return { OR: base.OR.map((clause) => ("authorId" in clause ? { hostId: clause.authorId } : clause)) };
}

/** Upcoming = not over yet (running events included); past = start and end behind us. */
function timeWhere(when: EventWhen, now: Date): Prisma.EventWhereInput {
  return when === "kommend"
    ? { OR: [{ startsAt: { gte: now } }, { endsAt: { gte: now } }] }
    : { startsAt: { lt: now }, OR: [{ endsAt: null }, { endsAt: { lt: now } }] };
}

/** Whether the viewer may see the event (group membership resolved here). */
export async function canViewEvent(
  event: { visibility: Visibility; hostId: string; groupId: string | null },
  viewer: Viewer | null,
): Promise<boolean> {
  const needsMembership = event.visibility === "GROUP" && !!viewer && !!event.groupId && viewer.id !== event.hostId;
  const member = needsMembership ? await isActiveGroupMember(viewer.id, event.groupId as string) : false;
  return canView({ visibility: event.visibility, authorId: event.hostId, groupId: event.groupId }, viewer, member);
}

// ---------------------------------------------------------------------------
// Lists
// ---------------------------------------------------------------------------

const listSelect = {
  id: true,
  title: true,
  startsAt: true,
  endsAt: true,
  isOnline: true,
  location: true,
  city: true,
  visibility: true,
  capacity: true,
  hostId: true,
  groupId: true,
  host: { select: hostSelect },
  group: { select: groupSelect },
  _count: { select: { rsvps: { where: { status: "GOING" } } } },
} satisfies Prisma.EventSelect;

type ListRow = Prisma.EventGetPayload<{ select: typeof listSelect }>;

export type EventListItem = ListRow & {
  /** Number of GOING rsvps. */
  going: number;
  /** The viewer's own answer, if any. */
  viewerStatus: RsvpStatus | null;
};

async function viewerStatuses(eventIds: string[], viewerId: string | null): Promise<Map<string, RsvpStatus>> {
  const map = new Map<string, RsvpStatus>();
  if (!viewerId || eventIds.length === 0) return map;
  const rows = await prisma.eventRsvp.findMany({
    where: { userId: viewerId, eventId: { in: eventIds } },
    select: { eventId: true, status: true },
  });
  for (const row of rows) map.set(row.eventId, row.status);
  return map;
}

async function decorate(rows: ListRow[], viewerId: string | null): Promise<EventListItem[]> {
  const statuses = await viewerStatuses(
    rows.map((r) => r.id),
    viewerId,
  );
  return rows.map((row) => ({ ...row, going: row._count.rsvps, viewerStatus: statuses.get(row.id) ?? null }));
}

export interface ListEventsArgs {
  viewer: Viewer | null;
  when: EventWhen;
  kind: EventKind;
  city?: string;
  groupId?: string;
  page: Page;
}

export async function listEvents({ viewer, when, kind, city, groupId, page }: ListEventsArgs): Promise<{
  items: EventListItem[];
  total: number;
}> {
  const memberGroupIds = viewer ? await getMemberGroupIds(viewer.id) : [];
  const where: Prisma.EventWhereInput = {
    deletedAt: null,
    AND: [eventVisibilityWhere(viewer, memberGroupIds), timeWhere(when, new Date())],
    ...(kind === "online" ? { isOnline: true } : kind === "vor-ort" ? { isOnline: false } : {}),
    ...(city ? { city: { contains: city } } : {}),
    ...(groupId ? { groupId } : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.event.findMany({
      where,
      select: listSelect,
      orderBy: { startsAt: when === "kommend" ? "asc" : "desc" },
      skip: page.skip,
      take: page.take,
    }),
    prisma.event.count({ where }),
  ]);

  return { items: await decorate(rows, viewer?.id ?? null), total };
}

/** Upcoming events the user hosts or answered GOING/MAYBE to – for the dashboard. */
export async function upcomingForUser(userId: string, limit = 5): Promise<EventListItem[]> {
  const now = new Date();
  const rows = await prisma.event.findMany({
    where: {
      deletedAt: null,
      AND: [
        { OR: [{ startsAt: { gte: now } }, { endsAt: { gte: now } }] },
        { OR: [{ hostId: userId }, { rsvps: { some: { userId, status: { in: ["GOING", "MAYBE"] } } } }] },
      ],
    },
    select: listSelect,
    orderBy: { startsAt: "asc" },
    take: limit,
  });
  return decorate(rows, userId);
}

// ---------------------------------------------------------------------------
// Detail
// ---------------------------------------------------------------------------

const detailSelect = {
  ...listSelect,
  description: true,
  onlineUrl: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.EventSelect;

type DetailRow = Prisma.EventGetPayload<{ select: typeof detailSelect }>;

export interface EventAttendee {
  user: EventHost;
  status: RsvpStatus;
}

export type EventDetail = DetailRow & {
  going: number;
  maybe: number;
  viewerStatus: RsvpStatus | null;
  /** GOING first, then MAYBE; capped at ATTENDEE_LIMIT. */
  attendees: EventAttendee[];
  /** Attendees (GOING + MAYBE) beyond `attendees`. */
  moreAttendees: number;
};

/** Raw row without visibility check; memoised so page and generateMetadata share one read. */
const findEventRow = cache(async (id: string): Promise<DetailRow | null> => {
  if (!id || id.length > 64) return null;
  return prisma.event.findFirst({ where: { id, deletedAt: null }, select: detailSelect });
});

/** The event with counts and attendees, or null when it is missing, deleted or not visible to the viewer. */
export async function getEvent(id: string, viewer: Viewer | null): Promise<EventDetail | null> {
  const row = await findEventRow(id);
  if (!row) return null;
  if (!(await canViewEvent(row, viewer))) return null;

  const [maybe, attendeeRows, viewerRsvp] = await Promise.all([
    prisma.eventRsvp.count({ where: { eventId: row.id, status: "MAYBE" } }),
    prisma.eventRsvp.findMany({
      where: { eventId: row.id, status: { in: ["GOING", "MAYBE"] } },
      // Enum values are stored as strings: "GOING" sorts before "MAYBE".
      orderBy: [{ status: "asc" }, { createdAt: "asc" }],
      take: ATTENDEE_LIMIT,
      select: { status: true, user: { select: hostSelect } },
    }),
    viewer
      ? prisma.eventRsvp.findUnique({
          where: { eventId_userId: { eventId: row.id, userId: viewer.id } },
          select: { status: true },
        })
      : Promise.resolve(null),
  ]);

  const going = row._count.rsvps;
  return {
    ...row,
    going,
    maybe,
    viewerStatus: viewerRsvp?.status ?? null,
    attendees: attendeeRows,
    moreAttendees: Math.max(0, going + maybe - attendeeRows.length),
  };
}

/** GOING and MAYBE counts after an rsvp change. */
export async function rsvpCounts(eventId: string): Promise<{ going: number; maybe: number }> {
  const rows = await prisma.eventRsvp.groupBy({
    by: ["status"],
    where: { eventId, status: { in: ["GOING", "MAYBE"] } },
    _count: { _all: true },
  });
  const counts = { going: 0, maybe: 0 };
  for (const row of rows) {
    if (row.status === "GOING") counts.going = row._count._all;
    if (row.status === "MAYBE") counts.maybe = row._count._all;
  }
  return counts;
}

// ---------------------------------------------------------------------------
// Reminders (cron)
// ---------------------------------------------------------------------------

export interface ReminderCandidate {
  id: string;
  title: string;
  hostId: string;
  startsAt: Date;
  endsAt: Date | null;
  isOnline: boolean;
  location: string | null;
  city: string | null;
  /** Ids of members who answered GOING or MAYBE. */
  attendeeIds: string[];
}

/** Events starting in [from, to) with the people to remind. */
export async function listReminderCandidates(from: Date, to: Date): Promise<ReminderCandidate[]> {
  const rows = await prisma.event.findMany({
    where: { deletedAt: null, startsAt: { gte: from, lt: to } },
    select: {
      id: true,
      title: true,
      hostId: true,
      startsAt: true,
      endsAt: true,
      isOnline: true,
      location: true,
      city: true,
      rsvps: { where: { status: { in: ["GOING", "MAYBE"] } }, select: { userId: true } },
    },
    orderBy: { startsAt: "asc" },
  });
  return rows.map(({ rsvps, ...event }) => ({ ...event, attendeeIds: rsvps.map((r) => r.userId) }));
}
