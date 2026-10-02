"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getUserOrThrow, isModerator, UnauthorizedError, type CurrentUser } from "@/lib/auth/dal";
import { failure, fieldErrors, stringValues, success, type ActionState } from "@/lib/action-state";
import { notify, notifyMany } from "@/lib/notifications";
import { markdownToText } from "@/lib/markdown";
import { canViewPrayerRequest, isActiveGroupMember, listSupporterIds } from "@/lib/prayer/queries";
import { dayStart, todayKey } from "@/lib/prayer/format";
import { markAnsweredSchema, prayerRequestSchema, type PrayerRequestInput } from "@/lib/validation/prayer";

/**
 * Server actions for the prayer wall. Signature `(prevState, formData)` for
 * `useActionState`; expected failures are returned, never thrown.
 */

const LOGIN_REQUIRED = "Bitte melde dich an.";
const NOT_FOUND = "Dieses Anliegen gibt es nicht mehr.";
const GENERIC_ERROR = "Das hat leider nicht geklappt. Bitte versuche es später noch einmal.";

async function actionUser(): Promise<CurrentUser | null> {
  try {
    return await getUserOrThrow();
  } catch (err) {
    if (err instanceof UnauthorizedError) return null;
    throw err;
  }
}

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}

function detailPath(id: string) {
  return `/gebet/${id}`;
}

function revalidateRequest(id: string) {
  revalidatePath("/gebet");
  revalidatePath(detailPath(id));
}

function prayerFormValues(formData: FormData): Record<string, string> {
  const values = stringValues(formData);
  values.isAnonymous = formData.get("isAnonymous") === "on" ? "on" : "";
  return values;
}

type ParsedPrayerForm =
  { ok: false; state: ActionState } | { ok: true; data: PrayerRequestInput; values: Record<string, string> };

/** Validates the form and checks group membership for GROUP visibility. Returns the state to send back on failure. */
async function parsePrayerForm(user: CurrentUser, formData: FormData): Promise<ParsedPrayerForm> {
  const values = prayerFormValues(formData);
  const parsed = prayerRequestSchema.safeParse({
    title: values.title ?? "",
    body: values.body ?? "",
    category: values.category ?? "",
    isAnonymous: values.isAnonymous,
    visibility: values.visibility ?? "",
    groupId: values.groupId ?? "",
  });
  if (!parsed.success) {
    return { ok: false, state: failure("Bitte prüfe deine Eingaben.", { errors: fieldErrors(parsed.error), values }) };
  }

  const data = parsed.data;
  if (data.visibility === "GROUP" && data.groupId && !(await isActiveGroupMember(user.id, data.groupId))) {
    return {
      ok: false,
      state: failure("Bitte prüfe deine Eingaben.", {
        errors: { groupId: ["Du bist in dieser Gruppe kein aktives Mitglied."] },
        values,
      }),
    };
  }
  return { ok: true, data, values };
}

// ---------------------------------------------------------------------------
// Erstellen / Bearbeiten
// ---------------------------------------------------------------------------

export async function createPrayerRequest(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await actionUser();
  if (!user) return failure(LOGIN_REQUIRED, { values: prayerFormValues(formData) });

  const result = await parsePrayerForm(user, formData);
  if (!result.ok) return result.state;

  let id: string;
  try {
    const created = await prisma.prayerRequest.create({
      data: { ...result.data, authorId: user.id },
      select: { id: true },
    });
    id = created.id;
  } catch (err) {
    console.error("[gebet] Anliegen konnte nicht gespeichert werden:", err);
    return failure(GENERIC_ERROR, { values: result.values });
  }

  revalidateRequest(id);
  redirect(detailPath(id));
}

export async function updatePrayerRequest(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await actionUser();
  if (!user) return failure(LOGIN_REQUIRED, { values: prayerFormValues(formData) });

  const existing = await prisma.prayerRequest.findFirst({
    where: { id, deletedAt: null },
    select: { authorId: true },
  });
  if (!existing) return failure(NOT_FOUND);
  if (existing.authorId !== user.id) return failure("Nur wer das Anliegen geteilt hat, kann es bearbeiten.");

  const result = await parsePrayerForm(user, formData);
  if (!result.ok) return result.state;

  try {
    await prisma.prayerRequest.update({ where: { id }, data: result.data });
  } catch (err) {
    console.error("[gebet] Anliegen konnte nicht aktualisiert werden:", err);
    return failure(GENERIC_ERROR, { values: result.values });
  }

  revalidateRequest(id);
  redirect(detailPath(id));
}

// ---------------------------------------------------------------------------
// Status: erhört / geschlossen / gelöscht
// ---------------------------------------------------------------------------

export async function markAnswered(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await actionUser();
  if (!user) return failure(LOGIN_REQUIRED);

  const parsed = markAnsweredSchema.safeParse({ answerNote: str(formData, "answerNote") });
  if (!parsed.success) return failure("Bitte prüfe deine Eingabe.", { errors: fieldErrors(parsed.error) });

  const request = await prisma.prayerRequest.findFirst({
    where: { id, deletedAt: null },
    select: { authorId: true, title: true, status: true },
  });
  if (!request) return failure(NOT_FOUND);
  if (request.authorId !== user.id) return failure("Nur wer das Anliegen geteilt hat, kann es als erhört markieren.");

  try {
    await prisma.prayerRequest.update({
      where: { id },
      data: {
        status: "ANSWERED",
        answeredAt: new Date(),
        answerNote: parsed.data.answerNote || null,
      },
    });
    if (request.status !== "ANSWERED") {
      const supporterIds = await listSupporterIds(id);
      await notifyMany(supporterIds, {
        type: "prayer_answered",
        title: "Ein Anliegen wurde erhört",
        body: request.title,
        href: detailPath(id),
        actorId: user.id,
      });
    }
  } catch (err) {
    console.error("[gebet] Anliegen konnte nicht als erhört markiert werden:", err);
    return failure(GENERIC_ERROR);
  }

  revalidateRequest(id);
  return success("Schön, dass Gott geantwortet hat. Alle, die mitgebetet haben, erfahren davon.");
}

/** Bound with `.bind(null, id)`; works with `useActionState` and plain transitions alike. */
export async function closePrayerRequest(id: string): Promise<ActionState> {
  const user = await actionUser();
  if (!user) return failure(LOGIN_REQUIRED);

  const request = await prisma.prayerRequest.findFirst({ where: { id, deletedAt: null }, select: { authorId: true } });
  if (!request) return failure(NOT_FOUND);
  if (request.authorId !== user.id) return failure("Nur wer das Anliegen geteilt hat, kann es schließen.");

  try {
    await prisma.prayerRequest.update({ where: { id }, data: { status: "CLOSED" } });
  } catch (err) {
    console.error("[gebet] Anliegen konnte nicht geschlossen werden:", err);
    return failure(GENERIC_ERROR);
  }

  revalidateRequest(id);
  return success("Das Anliegen ist jetzt geschlossen.");
}

/** Soft delete by the author or a moderator. Bound with `.bind(null, id)`. */
export async function deletePrayerRequest(id: string): Promise<ActionState> {
  const user = await actionUser();
  if (!user) return failure(LOGIN_REQUIRED);

  const request = await prisma.prayerRequest.findFirst({ where: { id, deletedAt: null }, select: { authorId: true } });
  if (!request) return failure(NOT_FOUND);
  if (request.authorId !== user.id && !isModerator(user)) return failure("Du darfst dieses Anliegen nicht löschen.");

  try {
    await prisma.prayerRequest.update({ where: { id }, data: { deletedAt: new Date() } });
  } catch (err) {
    console.error("[gebet] Anliegen konnte nicht gelöscht werden:", err);
    return failure(GENERIC_ERROR);
  }

  revalidateRequest(id);
  redirect("/gebet");
}

// ---------------------------------------------------------------------------
// Ich bete mit
// ---------------------------------------------------------------------------

/**
 * Toggles today's "Ich bete mit" for the current user. Returns `data.prayed`
 * with the new state so the button can settle its optimistic value.
 */
export async function togglePrayed(requestId: string): Promise<ActionState> {
  const user = await actionUser();
  if (!user) return failure(LOGIN_REQUIRED);
  if (typeof requestId !== "string" || !requestId || requestId.length > 64) return failure(NOT_FOUND);

  const request = await prisma.prayerRequest.findFirst({
    where: { id: requestId, deletedAt: null },
    select: { id: true, authorId: true, title: true, visibility: true, groupId: true },
  });
  if (!request) return failure(NOT_FOUND);
  if (!(await canViewPrayerRequest(request, user))) return failure(NOT_FOUND);

  const day = todayKey();
  const key = { requestId_userId_day: { requestId, userId: user.id, day } };
  let prayed: boolean;

  try {
    const existing = await prisma.prayerSupport.findUnique({ where: key, select: { id: true } });
    if (existing) {
      await prisma.prayerSupport.delete({ where: { id: existing.id } });
      prayed = false;
    } else {
      try {
        await prisma.prayerSupport.create({ data: { requestId, userId: user.id, day } });
      } catch (err) {
        // Double click: the row was just created by a parallel request.
        if ((err as { code?: string })?.code !== "P2002") throw err;
      }
      prayed = true;

      if (request.authorId !== user.id) {
        // At most one notification per supporter and day, however often the button is toggled.
        const already = await prisma.notification.findFirst({
          where: {
            userId: request.authorId,
            actorId: user.id,
            type: "prayer_support",
            href: detailPath(requestId),
            createdAt: { gte: dayStart(day) },
          },
          select: { id: true },
        });
        if (!already) {
          await notify({
            userId: request.authorId,
            actorId: user.id,
            type: "prayer_support",
            title: "Jemand hat für dich gebetet",
            body: markdownToText(request.title, 120),
            href: detailPath(requestId),
          });
        }
      }
    }
  } catch (err) {
    console.error("[gebet] Mitbeten konnte nicht gespeichert werden:", err);
    return failure(GENERIC_ERROR);
  }

  revalidateRequest(requestId);
  return success(undefined, { data: { prayed } });
}
