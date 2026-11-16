import "server-only";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { resolveTranslationId } from "@/lib/bible/data";
import { fullChapters, parseReadings, type Reading } from "@/lib/plans/progress";
import { terminalChangeSchema, type TerminalChange } from "@/lib/validation/terminal";
import { changeIdOf, clampChangeTime, sortChanges, utcDayRange } from "./sync";
import type { TerminalUser } from "./auth";

/** How far back the terminal gets the reading log (for its statistics). */
const LOG_WINDOW_DAYS = 400;
const LOG_LIMIT = 5000;

/**
 * Everything the terminal keeps locally: the member's active and finished
 * plans (with all days of the active ones, so it can keep going offline) and
 * the recent reading log.
 */
export async function terminalState(user: TerminalUser) {
  const since = new Date(Date.now() - LOG_WINDOW_DAYS * 86_400_000);
  const [subs, logs] = await Promise.all([
    prisma.planSubscription.findMany({
      where: { userId: user.id, archivedAt: null },
      orderBy: { startedAt: "desc" },
      select: {
        startedAt: true,
        completedAt: true,
        plan: { select: { id: true, slug: true, title: true, description: true, category: true, dayCount: true, minutesPerDay: true } },
        progress: { select: { day: true, completedAt: true }, orderBy: { day: "asc" } },
      },
    }),
    prisma.readingLog.findMany({
      where: { userId: user.id, readAt: { gte: since } },
      orderBy: { readAt: "desc" },
      take: LOG_LIMIT,
      select: { book: true, chapter: true, translation: true, readAt: true },
    }),
  ]);

  const activePlanIds = subs.filter((s) => !s.completedAt).map((s) => s.plan.id);
  const dayRows = activePlanIds.length
    ? await prisma.planDay.findMany({
        where: { planId: { in: activePlanIds } },
        orderBy: [{ planId: "asc" }, { day: "asc" }],
        select: { planId: true, day: true, readings: true },
      })
    : [];
  const daysByPlan = new Map<string, { day: number; readings: Reading[] }[]>();
  for (const row of dayRows) {
    const list = daysByPlan.get(row.planId) ?? [];
    list.push({ day: row.day, readings: parseReadings(row.readings) });
    daysByPlan.set(row.planId, list);
  }

  return {
    serverTime: new Date().toISOString(),
    user: { name: user.name, username: user.username, preferredTranslation: user.preferredTranslation },
    plans: subs.map((s) => ({
      ...s.plan,
      startedAt: s.startedAt,
      completedAt: s.completedAt,
      progress: s.progress,
      days: daysByPlan.get(s.plan.id) ?? [],
    })),
    readingLog: logs,
  };
}

export interface RejectedChange {
  id: string | null;
  reason: string;
  /** true: temporary problem, the terminal keeps the change and tries again later */
  retry: boolean;
}

class PermanentRejection extends Error {}

/** Same rules as the website's `markDay` action, but with the time the member actually read. */
async function applyPlanDay(user: TerminalUser, change: Extract<TerminalChange, { type: "planDay" }>, at: Date) {
  const sub = await prisma.planSubscription.findUnique({
    where: { userId_planId: { userId: user.id, planId: change.planId } },
    select: { id: true, archivedAt: true, completedAt: true, plan: { select: { dayCount: true } } },
  });
  if (!sub) throw new PermanentRejection("Diesen Plan hast du auf Bleibe nicht (mehr) gestartet.");
  if (sub.archivedAt) throw new PermanentRejection("Dieser Plan ist pausiert.");
  if (change.day > sub.plan.dayCount) throw new PermanentRejection("Diesen Tag gibt es in diesem Plan nicht.");

  const planDay = await prisma.planDay.findUnique({
    where: { planId_day: { planId: change.planId, day: change.day } },
    select: { readings: true },
  });
  if (!planDay) throw new PermanentRejection("Diesen Tag gibt es in diesem Plan nicht.");
  const chapters = fullChapters(parseReadings(planDay.readings));

  await prisma.$transaction(async (tx) => {
    const where = { subscriptionId_day: { subscriptionId: sub.id, day: change.day } };
    const existing = await tx.planProgress.findUnique({ where, select: { completedAt: true } });

    if (change.done) {
      if (!existing) {
        await tx.planProgress.create({ data: { subscriptionId: sub.id, day: change.day, completedAt: at } });
        if (chapters.length > 0) {
          await tx.readingLog.createMany({
            data: chapters.map((c) => ({ userId: user.id, book: c.book, chapter: c.chapter, translation: user.preferredTranslation, readAt: at })),
          });
        }
      }
      const count = await tx.planProgress.count({ where: { subscriptionId: sub.id } });
      if (count >= sub.plan.dayCount && !sub.completedAt) {
        await tx.planSubscription.update({ where: { id: sub.id }, data: { completedAt: at } });
      }
      return;
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
  });
}

/** Same rule as the reader's "Kapitel gelesen": once per chapter and (UTC) day. */
async function applyChapter(user: TerminalUser, change: Extract<TerminalChange, { type: "chapter" }>, at: Date) {
  const translation = await resolveTranslationId(change.translation);
  const { start, end } = utcDayRange(at);
  const existing = await prisma.readingLog.findFirst({
    where: { userId: user.id, book: change.book, chapter: change.chapter, readAt: { gte: start, lt: end } },
    select: { id: true },
  });
  if (!existing) {
    await prisma.readingLog.create({ data: { userId: user.id, book: change.book, chapter: change.chapter, translation, readAt: at } });
  }
}

/** Applies a batch of queued terminal changes in the order they happened. */
export async function applyTerminalChanges(user: TerminalUser, raw: readonly unknown[]) {
  const applied: string[] = [];
  const rejected: RejectedChange[] = [];

  const valid: TerminalChange[] = [];
  for (const item of raw) {
    const parsed = terminalChangeSchema.safeParse(item);
    if (parsed.success) valid.push(parsed.data);
    else rejected.push({ id: changeIdOf(item), reason: "Ungültige Änderung.", retry: false });
  }

  const now = new Date();
  for (const change of sortChanges(valid)) {
    const at = clampChangeTime(change.at, now);
    try {
      if (change.type === "planDay") await applyPlanDay(user, change, at);
      else await applyChapter(user, change, at);
      applied.push(change.id);
    } catch (err) {
      if (err instanceof PermanentRejection) {
        rejected.push({ id: change.id, reason: err.message, retry: false });
      } else {
        console.error("[terminal] Änderung konnte nicht gespeichert werden:", err);
        rejected.push({ id: change.id, reason: "Konnte gerade nicht gespeichert werden.", retry: true });
      }
    }
  }

  if (applied.length > 0) {
    revalidatePath("/leseplaene", "layout");
    revalidatePath("/meine-bibel", "layout");
    revalidatePath("/start");
  }
  return { applied, rejected };
}
