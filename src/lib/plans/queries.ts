import "server-only";
import { cache } from "react";
import type { Prisma } from "@/lib/db";
import { prisma } from "@/lib/db";
import { DEFAULT_TRANSLATION, getTranslation } from "@/lib/bible/data";
import type { Locale } from "@/lib/bible/reference";
import { localeFor } from "@/lib/bible/ui";
import type { PlanCategory } from "./generate";
import { CATEGORY_LABELS, CATEGORY_ORDER, categoryLabel, nextOpenDay, parseReadings, type Reading } from "./progress";

export { CATEGORY_LABELS, CATEGORY_ORDER };

/**
 * Server-side reads for the reading plans. Everything returns narrow DTOs
 * (never whole rows) and parses `PlanDay.readings` into `Reading[]`.
 */

export const planSummarySelect = {
  id: true,
  slug: true,
  title: true,
  description: true,
  category: true,
  minutesPerDay: true,
  dayCount: true,
} satisfies Prisma.ReadingPlanSelect;

export type PlanSummary = Prisma.ReadingPlanGetPayload<{ select: typeof planSummarySelect }>;

export interface PlanDayReadings {
  day: number;
  readings: Reading[];
}

export interface PlanWithDays extends PlanSummary {
  days: PlanDayReadings[];
}

export interface PlanGroup {
  category: PlanCategory | string;
  label: string;
  plans: PlanSummary[];
}

/** All plans grouped by category in display order; empty categories are left out. */
export async function listPlans(viewerId?: string | null): Promise<PlanGroup[]> {
  const plans = await prisma.readingPlan.findMany({
    where: viewerId ? { OR: [{ isSystem: true }, { authorId: viewerId }, { subscriptions: { some: { userId: viewerId } } }] } : { isSystem: true },
    select: planSummarySelect,
    orderBy: [{ dayCount: "asc" }, { title: "asc" }],
  });
  const groups = new Map<string, PlanGroup>();
  for (const category of CATEGORY_ORDER) groups.set(category, { category, label: CATEGORY_LABELS[category], plans: [] });
  for (const plan of plans) {
    let group = groups.get(plan.category);
    if (!group) {
      group = { category: plan.category, label: categoryLabel(plan.category), plans: [] };
      groups.set(plan.category, group);
    }
    group.plans.push(plan);
  }
  return [...groups.values()].filter((g) => g.plans.length > 0);
}

/** A plan with all of its days (memoised per request so metadata and page share one query). */
export const getPlanBySlug = cache(async (slug: string): Promise<PlanWithDays | null> => {
  const plan = await prisma.readingPlan.findUnique({
    where: { slug },
    select: { ...planSummarySelect, days: { select: { day: true, readings: true }, orderBy: { day: "asc" } } },
  });
  if (!plan) return null;
  const { days, ...summary } = plan;
  return { ...summary, days: days.map((d) => ({ day: d.day, readings: parseReadings(d.readings) })) };
});

export interface SubscriptionInfo {
  id: string;
  planId: string;
  startedAt: Date;
  completedAt: Date | null;
  archivedAt: Date | null;
  /** completed day numbers, ascending */
  completedDays: number[];
  /** most recent completion, for the finish estimate */
  lastCompletedAt: Date | null;
}

const subscriptionSelect = {
  id: true,
  planId: true,
  startedAt: true,
  completedAt: true,
  archivedAt: true,
  progress: { select: { day: true, completedAt: true }, orderBy: { day: "asc" } },
} satisfies Prisma.PlanSubscriptionSelect;

type SubscriptionRow = Prisma.PlanSubscriptionGetPayload<{ select: typeof subscriptionSelect }>;

function toSubscriptionInfo(row: SubscriptionRow): SubscriptionInfo {
  let last: Date | null = null;
  for (const p of row.progress) if (!last || p.completedAt > last) last = p.completedAt;
  return {
    id: row.id,
    planId: row.planId,
    startedAt: row.startedAt,
    completedAt: row.completedAt,
    archivedAt: row.archivedAt,
    completedDays: row.progress.map((p) => p.day),
    lastCompletedAt: last,
  };
}

/** The viewer's subscription to one plan (archived ones included), or null. */
export const getSubscription = cache(async (userId: string, planId: string): Promise<SubscriptionInfo | null> => {
  const row = await prisma.planSubscription.findUnique({
    where: { userId_planId: { userId, planId } },
    select: subscriptionSelect,
  });
  return row ? toSubscriptionInfo(row) : null;
});

export interface MySubscription extends SubscriptionInfo {
  plan: PlanSummary;
  /** first open day, null when every day is done */
  nextDay: number | null;
}

export type SubscriptionScope = "active" | "archived" | "all";

/** The viewer's plans. "active" = not archived (finished plans included). */
export async function listMySubscriptions(userId: string, scope: SubscriptionScope = "active"): Promise<MySubscription[]> {
  const where: Prisma.PlanSubscriptionWhereInput = { userId };
  if (scope === "active") where.archivedAt = null;
  if (scope === "archived") where.archivedAt = { not: null };
  const rows = await prisma.planSubscription.findMany({
    where,
    select: { ...subscriptionSelect, plan: { select: planSummarySelect } },
    orderBy: { startedAt: "desc" },
  });
  return rows.map((row) => {
    const info = toSubscriptionInfo(row);
    return { ...info, plan: row.plan, nextDay: nextOpenDay(info.completedDays, row.plan.dayCount) };
  });
}

export interface TodayReading {
  subscriptionId: string;
  plan: PlanSummary;
  /** the day to read next */
  day: number;
  readings: Reading[];
  completedCount: number;
}

/**
 * For every active, unfinished plan of the user: the next open day with its
 * readings. Used on the dashboard ("Heute dran") and under /leseplaene/meine.
 */
export const todaysReadings = cache(async (userId: string): Promise<TodayReading[]> => {
  const subs = await listMySubscriptions(userId, "active");
  const open = subs.filter((s) => s.nextDay !== null && !s.completedAt);
  if (open.length === 0) return [];
  const days = await prisma.planDay.findMany({
    where: { OR: open.map((s) => ({ planId: s.planId, day: s.nextDay! })) },
    select: { planId: true, day: true, readings: true },
  });
  const byKey = new Map(days.map((d) => [`${d.planId}:${d.day}`, d.readings]));
  const out: TodayReading[] = [];
  for (const sub of open) {
    const json = byKey.get(`${sub.planId}:${sub.nextDay}`);
    if (json === undefined) continue;
    out.push({
      subscriptionId: sub.id,
      plan: sub.plan,
      day: sub.nextDay!,
      readings: parseReadings(json),
      completedCount: sub.completedDays.length,
    });
  }
  return out;
});

/** The user's preferred translation id (default when the user is unknown). */
export const getPreferredTranslation = cache(async (userId: string): Promise<string> => {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { preferredTranslation: true } });
  return user?.preferredTranslation ?? DEFAULT_TRANSLATION;
});

export interface ReaderContext {
  /** value for the reader's `?t=` parameter; undefined for the default translation */
  translation: string | undefined;
  /** locale for book names and reference notation */
  locale: Locale;
}

/** How to link into the reader for a given preferred translation. */
export async function readerContext(preferred: string | null | undefined): Promise<ReaderContext> {
  const info = preferred ? await getTranslation(preferred.toUpperCase()) : undefined;
  if (!info) return { translation: undefined, locale: "de" };
  return { translation: info.id === DEFAULT_TRANSLATION ? undefined : info.id, locale: localeFor(info.language) };
}
