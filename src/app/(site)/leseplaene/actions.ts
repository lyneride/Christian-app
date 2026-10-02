"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getUserOrThrow, UnauthorizedError, type CurrentUser } from "@/lib/auth/dal";
import { failure, success, type ActionState } from "@/lib/action-state";
import { fullChapters, parseReadings } from "@/lib/plans/progress";
import { markDaySchema, planActionSchema } from "@/lib/validation/plans";

/**
 * Server actions for the reading plans. Called directly from client
 * components inside a transition; every expected failure is returned as an
 * `ActionState`, never thrown. Arguments come from the client and are
 * validated here.
 */

const LOGIN_REQUIRED = "Bitte melde dich an.";
const PLAN_NOT_FOUND = "Diesen Plan gibt es nicht.";
const NOT_SUBSCRIBED = "Du hast diesen Plan noch nicht gestartet.";
const GENERIC_ERROR = "Das hat leider nicht geklappt. Bitte versuche es später noch einmal.";

const PLAN_FINISHED_MESSAGE = "Plan abgeschlossen – stark durchgehalten.";

async function actionUser(): Promise<CurrentUser | null> {
  try {
    return await getUserOrThrow();
  } catch (err) {
    if (err instanceof UnauthorizedError) return null;
    throw err;
  }
}

function revalidatePlanPages(slug: string) {
  revalidatePath("/leseplaene");
  revalidatePath(`/leseplaene/${slug}`);
  revalidatePath("/leseplaene/meine");
  revalidatePath("/start");
}

async function findPlan(planId: string) {
  return prisma.readingPlan.findUnique({ where: { id: planId }, select: { id: true, slug: true, dayCount: true } });
}

/** Starts a plan – or picks a paused one up again (progress is kept). */
export async function subscribePlan(planId: unknown): Promise<ActionState> {
  const user = await actionUser();
  if (!user) return failure(LOGIN_REQUIRED);
  const parsed = planActionSchema.safeParse({ planId });
  if (!parsed.success) return failure(PLAN_NOT_FOUND);

  const plan = await findPlan(parsed.data.planId);
  if (!plan) return failure(PLAN_NOT_FOUND);

  let resumed = false;
  try {
    const existing = await prisma.planSubscription.findUnique({
      where: { userId_planId: { userId: user.id, planId: plan.id } },
      select: { id: true, archivedAt: true },
    });
    if (existing) {
      resumed = existing.archivedAt !== null;
      if (resumed) await prisma.planSubscription.update({ where: { id: existing.id }, data: { archivedAt: null } });
    } else {
      await prisma.planSubscription.create({ data: { userId: user.id, planId: plan.id } });
    }
  } catch (err) {
    console.error("[leseplaene] Plan konnte nicht gestartet werden:", err);
    return failure(GENERIC_ERROR);
  }

  revalidatePlanPages(plan.slug);
  return success(resumed ? "Schön, dass du weitermachst." : "Los geht’s – Tag 1 wartet auf dich.");
}

/** Pauses a plan. Nothing is lost; it can be picked up again any time. */
export async function archivePlan(planId: unknown): Promise<ActionState> {
  const user = await actionUser();
  if (!user) return failure(LOGIN_REQUIRED);
  const parsed = planActionSchema.safeParse({ planId });
  if (!parsed.success) return failure(PLAN_NOT_FOUND);

  const plan = await findPlan(parsed.data.planId);
  if (!plan) return failure(PLAN_NOT_FOUND);

  try {
    const result = await prisma.planSubscription.updateMany({
      where: { userId: user.id, planId: plan.id, archivedAt: null },
      data: { archivedAt: new Date() },
    });
    if (result.count === 0) return failure(NOT_SUBSCRIBED);
  } catch (err) {
    console.error("[leseplaene] Plan konnte nicht pausiert werden:", err);
    return failure(GENERIC_ERROR);
  }

  revalidatePlanPages(plan.slug);
  return success("Plan pausiert. Du kannst jederzeit weitermachen.");
}

/** Deletes all progress of a plan and starts it over from day 1. */
export async function resetPlan(planId: unknown): Promise<ActionState> {
  const user = await actionUser();
  if (!user) return failure(LOGIN_REQUIRED);
  const parsed = planActionSchema.safeParse({ planId });
  if (!parsed.success) return failure(PLAN_NOT_FOUND);

  const plan = await findPlan(parsed.data.planId);
  if (!plan) return failure(PLAN_NOT_FOUND);

  const sub = await prisma.planSubscription.findUnique({
    where: { userId_planId: { userId: user.id, planId: plan.id } },
    select: { id: true },
  });
  if (!sub) return failure(NOT_SUBSCRIBED);

  try {
    await prisma.$transaction([
      prisma.planProgress.deleteMany({ where: { subscriptionId: sub.id } }),
      prisma.planSubscription.update({
        where: { id: sub.id },
        data: { startedAt: new Date(), completedAt: null, archivedAt: null },
      }),
    ]);
  } catch (err) {
    console.error("[leseplaene] Plan konnte nicht zurückgesetzt werden:", err);
    return failure(GENERIC_ERROR);
  }

  revalidatePlanPages(plan.slug);
  return success("Plan zurückgesetzt – du beginnst wieder bei Tag 1.");
}

/**
 * Marks a day as read (or open again). Reading a day also logs its whole
 * chapters in the ReadingLog; unmarking removes exactly those log rows again.
 * Returns `data.finished = true` with a celebration message once every day
 * of the plan is done.
 */
export async function markDay(planId: unknown, day: unknown, done: unknown): Promise<ActionState> {
  const user = await actionUser();
  if (!user) return failure(LOGIN_REQUIRED);
  const parsed = markDaySchema.safeParse({ planId, day, done });
  if (!parsed.success) return failure("Ungültige Eingabe.");
  const input = parsed.data;

  const sub = await prisma.planSubscription.findUnique({
    where: { userId_planId: { userId: user.id, planId: input.planId } },
    select: { id: true, archivedAt: true, completedAt: true, plan: { select: { slug: true, dayCount: true } } },
  });
  if (!sub) return failure(NOT_SUBSCRIBED);
  if (sub.archivedAt) return failure("Dieser Plan ist pausiert. Nimm ihn wieder auf, um weiterzulesen.");
  if (input.day > sub.plan.dayCount) return failure("Diesen Tag gibt es in diesem Plan nicht.");

  const planDay = await prisma.planDay.findUnique({
    where: { planId_day: { planId: input.planId, day: input.day } },
    select: { readings: true },
  });
  if (!planDay) return failure("Diesen Tag gibt es in diesem Plan nicht.");
  const chapters = fullChapters(parseReadings(planDay.readings));

  let finished = false;
  try {
    finished = await prisma.$transaction(async (tx) => {
      const where = { subscriptionId_day: { subscriptionId: sub.id, day: input.day } };
      const existing = await tx.planProgress.findUnique({ where, select: { completedAt: true } });

      if (input.done) {
        if (!existing) {
          const now = new Date();
          await tx.planProgress.create({ data: { subscriptionId: sub.id, day: input.day, completedAt: now } });
          if (chapters.length > 0) {
            await tx.readingLog.createMany({
              data: chapters.map((c) => ({
                userId: user.id,
                book: c.book,
                chapter: c.chapter,
                translation: user.preferredTranslation,
                readAt: now,
              })),
            });
          }
        }
        const count = await tx.planProgress.count({ where: { subscriptionId: sub.id } });
        const allDone = count >= sub.plan.dayCount;
        if (allDone && !sub.completedAt) {
          await tx.planSubscription.update({ where: { id: sub.id }, data: { completedAt: new Date() } });
        }
        return allDone;
      }

      if (existing) {
        await tx.planProgress.delete({ where });
        if (chapters.length > 0) {
          await tx.readingLog.deleteMany({
            where: { userId: user.id, readAt: existing.completedAt, OR: chapters.map((c) => ({ book: c.book, chapter: c.chapter })) },
          });
        }
      }
      if (sub.completedAt) await tx.planSubscription.update({ where: { id: sub.id }, data: { completedAt: null } });
      return false;
    });
  } catch (err) {
    console.error("[leseplaene] Fortschritt konnte nicht gespeichert werden:", err);
    return failure(GENERIC_ERROR);
  }

  revalidatePlanPages(sub.plan.slug);
  if (finished) return success(PLAN_FINISHED_MESSAGE, { data: { finished: true } });
  return success(input.done ? `Tag ${input.day} als gelesen markiert.` : `Tag ${input.day} ist wieder offen.`);
}
