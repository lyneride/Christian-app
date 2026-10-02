"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { RsvpStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import { getUserOrThrow, isModerator, UnauthorizedError, type CurrentUser } from "@/lib/auth/dal";
import { failure, fieldErrors, stringValues, success, type ActionState } from "@/lib/action-state";
import { notify, type NotificationType } from "@/lib/notifications";
import { canViewEvent, isActiveGroupMember, rsvpCounts } from "@/lib/events/queries";
import { isPastEvent } from "@/lib/events/time";
import { createEventSchema, rsvpStatusSchema, updateEventSchema, type EventInput } from "@/lib/validation/events";

/**
 * Server actions for events ("Treffen"). Signature `(prevState, formData)`
 * for `useActionState`; expected failures are returned, never thrown.
 */

const LOGIN_REQUIRED = "Bitte melde dich an.";
const NOT_FOUND = "Dieses Treffen gibt es nicht mehr.";
const GENERIC_ERROR = "Das hat leider nicht geklappt. Bitte versuche es später noch einmal.";

async function actionUser(): Promise<CurrentUser | null> {
  try {
    return await getUserOrThrow();
  } catch (err) {
    if (err instanceof UnauthorizedError) return null;
    throw err;
  }
}

function detailPath(id: string) {
  return `/veranstaltungen/${id}`;
}

function revalidateEvent(id: string) {
  revalidatePath("/veranstaltungen");
  revalidatePath(detailPath(id));
  revalidatePath(`${detailPath(id)}/bearbeiten`);
  revalidatePath("/start");
}

function eventFormValues(formData: FormData): Record<string, string> {
  const values = stringValues(formData);
  values.isOnline = formData.get("isOnline") === "on" ? "on" : "";
  return values;
}

type ParseResult = { ok: false; error: ActionState } | { ok: true; data: EventInput; values: Record<string, string> };

/** Validates the form and checks group membership. Returns the state to send back on failure. */
async function parseEventForm(
  user: CurrentUser,
  formData: FormData,
  schema: typeof createEventSchema,
  /** A group that may stay selected without a membership check (moderators editing a group's event). */
  keepGroupId: string | null = null,
): Promise<ParseResult> {
  const values = eventFormValues(formData);
  const parsed = schema.safeParse({
    title: values.title ?? "",
    description: values.description ?? "",
    startsAt: values.startsAt ?? "",
    endsAt: values.endsAt ?? "",
    isOnline: values.isOnline,
    onlineUrl: values.onlineUrl ?? "",
    location: values.location ?? "",
    city: values.city ?? "",
    visibility: values.visibility ?? "",
    groupId: values.groupId ?? "",
    capacity: values.capacity ?? "",
  });
  if (!parsed.success) {
    return { ok: false, error: failure("Bitte prüfe deine Eingaben.", { errors: fieldErrors(parsed.error), values }) };
  }

  const data = parsed.data;
  if (data.groupId && data.groupId !== keepGroupId && !(await isActiveGroupMember(user.id, data.groupId))) {
    return {
      ok: false,
      error: failure("Bitte prüfe deine Eingaben.", {
        errors: { groupId: ["Du bist in dieser Gruppe kein aktives Mitglied."] },
        values,
      }),
    };
  }
  return { ok: true, data, values };
}

// ---------------------------------------------------------------------------
// Planen / Bearbeiten / Löschen
// ---------------------------------------------------------------------------

export async function createEvent(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await actionUser();
  if (!user) return failure(LOGIN_REQUIRED, { values: eventFormValues(formData) });

  const result = await parseEventForm(user, formData, createEventSchema);
  if (!result.ok) return result.error;

  let id: string;
  try {
    const created = await prisma.event.create({
      // The host is in by definition.
      data: { ...result.data, hostId: user.id, rsvps: { create: { userId: user.id, status: "GOING" } } },
      select: { id: true },
    });
    id = created.id;
  } catch (err) {
    console.error("[veranstaltungen] Treffen konnte nicht gespeichert werden:", err);
    return failure(GENERIC_ERROR, { values: result.values });
  }

  revalidateEvent(id);
  redirect(detailPath(id));
}

export async function updateEvent(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await actionUser();
  if (!user) return failure(LOGIN_REQUIRED, { values: eventFormValues(formData) });

  const existing = await prisma.event.findFirst({ where: { id, deletedAt: null }, select: { hostId: true, groupId: true } });
  if (!existing) return failure(NOT_FOUND);
  if (existing.hostId !== user.id && !isModerator(user)) return failure("Nur wer eingeladen hat, kann das Treffen bearbeiten.");

  const result = await parseEventForm(user, formData, updateEventSchema, existing.groupId);
  if (!result.ok) return result.error;

  try {
    await prisma.event.update({ where: { id }, data: result.data });
  } catch (err) {
    console.error("[veranstaltungen] Treffen konnte nicht aktualisiert werden:", err);
    return failure(GENERIC_ERROR, { values: result.values });
  }

  revalidateEvent(id);
  redirect(detailPath(id));
}

/** Soft delete by the host or a moderator. Bound with `.bind(null, id)`. */
export async function deleteEvent(id: string): Promise<ActionState> {
  const user = await actionUser();
  if (!user) return failure(LOGIN_REQUIRED);

  const event = await prisma.event.findFirst({ where: { id, deletedAt: null }, select: { hostId: true } });
  if (!event) return failure(NOT_FOUND);
  if (event.hostId !== user.id && !isModerator(user)) return failure("Du darfst dieses Treffen nicht löschen.");

  try {
    await prisma.event.update({ where: { id }, data: { deletedAt: new Date() } });
  } catch (err) {
    console.error("[veranstaltungen] Treffen konnte nicht gelöscht werden:", err);
    return failure(GENERIC_ERROR);
  }

  revalidateEvent(id);
  redirect("/veranstaltungen");
}

// ---------------------------------------------------------------------------
// Zusagen
// ---------------------------------------------------------------------------

export class CapacityReachedError extends Error {}

/**
 * Sets the viewer's answer (upsert). Respects the capacity for new GOING
 * answers and tells the host once per member. Returns `data.status`,
 * `data.going` and `data.maybe` so the RSVP bar can settle its optimistic state.
 */
export async function setRsvp(eventId: string, status: RsvpStatus): Promise<ActionState> {
  const user = await actionUser();
  if (!user) return failure(LOGIN_REQUIRED);

  const parsedStatus = rsvpStatusSchema.safeParse(status);
  if (!parsedStatus.success) return failure("Unbekannte Antwort.");
  if (typeof eventId !== "string" || !eventId || eventId.length > 64) return failure(NOT_FOUND);

  const event = await prisma.event.findFirst({
    where: { id: eventId, deletedAt: null },
    select: { id: true, hostId: true, title: true, visibility: true, groupId: true, startsAt: true, endsAt: true, capacity: true },
  });
  if (!event || !(await canViewEvent(event, user))) return failure(NOT_FOUND);
  if (isPastEvent(event)) return failure("Dieses Treffen ist schon vorbei.");

  const next = parsedStatus.data;
  const key = { eventId_userId: { eventId, userId: user.id } };
  let previous: RsvpStatus | null = null;

  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.eventRsvp.findUnique({ where: key, select: { status: true } });
      previous = existing?.status ?? null;
      if (previous === next) return;
      if (next === "GOING" && event.capacity !== null) {
        const going = await tx.eventRsvp.count({ where: { eventId, status: "GOING" } });
        if (going >= event.capacity) throw new CapacityReachedError();
      }
      await tx.eventRsvp.upsert({ where: key, create: { eventId, userId: user.id, status: next }, update: { status: next } });
    });
  } catch (err) {
    if (err instanceof CapacityReachedError) {
      return failure("Leider schon voll.", { data: { status: previous, ...(await rsvpCounts(eventId)) } });
    }
    console.error("[veranstaltungen] Zusage konnte nicht gespeichert werden:", err);
    return failure(GENERIC_ERROR);
  }

  if (next === "GOING" && previous !== "GOING" && event.hostId !== user.id) {
    try {
      // At most one "ist dabei" per member and event, however often the answer changes.
      // "event_rsvp" is not part of NotificationType yet (see report); the column is a plain string.
      const type = "event_rsvp" as NotificationType;
      const already = await prisma.notification.findFirst({
        where: { userId: event.hostId, actorId: user.id, type, href: detailPath(eventId) },
        select: { id: true },
      });
      if (!already) {
        await notify({
          userId: event.hostId,
          actorId: user.id,
          type,
          title: `${user.name} ist dabei`,
          body: event.title,
          href: detailPath(eventId),
        });
      }
    } catch (err) {
      console.error("[veranstaltungen] Benachrichtigung konnte nicht gespeichert werden:", err);
    }
  }

  revalidateEvent(eventId);
  return success(undefined, { data: { status: next, ...(await rsvpCounts(eventId)) } });
}
