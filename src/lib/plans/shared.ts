import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { getBookByNumber } from "@/lib/bible/books";
import { formatReference, parseVerseKey } from "@/lib/bible/reference";
import { fullChapters, nextOpenDay, parseReadings, percent, type Reading } from "./progress";

/** "Gemeinsam lesen" – shared reading plans between friends or a group. */

export const memberSelect = { id: true, name: true, username: true, avatarUrl: true } as const;

export interface SharedMember {
  user: { id: string; name: string; username: string; avatarUrl: string | null };
  status: "ACTIVE" | "PENDING" | "BANNED";
  shareHighlights: boolean;
  completed: number;
  currentDay: number | null;
  percent: number;
  lastActivity: Date | null;
}

export const getPlanGroup = cache(async (id: string) => {
  return prisma.planGroup.findUnique({
    where: { id },
    include: {
      plan: { select: { id: true, slug: true, title: true, description: true, dayCount: true, minutesPerDay: true } },
      createdBy: { select: memberSelect },
      group: { select: { id: true, slug: true, name: true } },
      members: { include: { user: { select: memberSelect } }, orderBy: { joinedAt: "asc" } },
    },
  });
});

export type PlanGroupDetail = NonNullable<Awaited<ReturnType<typeof getPlanGroup>>>;

export async function memberProgress(group: PlanGroupDetail): Promise<SharedMember[]> {
  const userIds = group.members.map((m) => m.userId);
  const subs = await prisma.planSubscription.findMany({
    where: { planId: group.planId, userId: { in: userIds } },
    select: { userId: true, progress: { select: { day: true, completedAt: true } } },
  });
  const byUser = new Map(subs.map((s) => [s.userId, s]));
  return group.members.map((m) => {
    const sub = byUser.get(m.userId);
    const days = sub ? sub.progress.map((p) => p.day) : [];
    const last = sub ? sub.progress.reduce<Date | null>((acc, p) => (!acc || p.completedAt > acc ? p.completedAt : acc), null) : null;
    return {
      user: m.user,
      status: m.status,
      shareHighlights: m.shareHighlights,
      completed: days.length,
      currentDay: nextOpenDay(days, group.plan.dayCount),
      percent: percent(days.length, group.plan.dayCount),
      lastActivity: last,
    };
  });
}

/** Can the viewer see this shared plan? Members (active or invited), the linked group's members, and moderators. */
export async function canViewPlanGroup(group: PlanGroupDetail, viewer: { id: string; role: string } | null): Promise<boolean> {
  if (!viewer) return false;
  if (viewer.role === "ADMIN" || viewer.role === "MODERATOR") return true;
  if (group.members.some((m) => m.userId === viewer.id && m.status !== "BANNED")) return true;
  if (group.groupId) {
    const member = await prisma.groupMember.findUnique({ where: { groupId_userId: { groupId: group.groupId, userId: viewer.id } }, select: { status: true } });
    if (member?.status === "ACTIVE") return true;
  }
  return false;
}

export async function listMyPlanGroups(userId: string) {
  const rows = await prisma.planGroupMember.findMany({
    where: { userId, status: { in: ["ACTIVE", "PENDING"] } },
    include: {
      planGroup: {
        include: {
          plan: { select: { slug: true, title: true, dayCount: true } },
          createdBy: { select: memberSelect },
          _count: { select: { members: { where: { status: "ACTIVE" } } } },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });
  return rows.map((r) => ({ status: r.status, ...r.planGroup, memberCount: r.planGroup._count.members }));
}

export async function getDayReadings(planId: string, day: number): Promise<Reading[]> {
  const row = await prisma.planDay.findUnique({ where: { planId_day: { planId, day } }, select: { readings: true } });
  return row ? parseReadings(row.readings) : [];
}

export interface SharedMark {
  user: { id: string; name: string; username: string; avatarUrl: string | null };
  reference: string;
  path: string;
  color?: string;
  note?: { id: string; title: string | null; excerpt: string };
}

/** Highlights and shared notes of the other members for the chapters of a plan day. */
export async function sharedMarksForDay(group: PlanGroupDetail, day: number, translation: string): Promise<SharedMark[]> {
  const readings = await getDayReadings(group.planId, day);
  const chapters = fullChapters(readings.length ? readings : []);
  // partial-chapter readings still count as their chapter
  for (const r of readings) if (!chapters.some((c) => c.book === r.book && c.chapter === r.chapter)) chapters.push({ book: r.book, chapter: r.chapter });
  if (chapters.length === 0) return [];
  const sharers = group.members.filter((m) => m.status === "ACTIVE" && m.shareHighlights).map((m) => m.userId);
  if (sharers.length === 0) return [];
  const prefixes = chapters.map((c) => `${c.book}:${c.chapter}:`);
  const [highlights, notes] = await Promise.all([
    prisma.highlight.findMany({
      where: { userId: { in: sharers }, OR: prefixes.map((p) => ({ verseKey: { startsWith: p } })) },
      select: { verseKey: true, color: true, user: { select: memberSelect } },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.note.findMany({
      where: { userId: { in: sharers }, visibility: "MEMBERS", OR: prefixes.map((p) => ({ verseKey: { startsWith: p } })) },
      select: { id: true, verseKey: true, verseEnd: true, title: true, body: true, user: { select: memberSelect } },
      orderBy: { updatedAt: "desc" },
      take: 100,
    }),
  ]);
  const marks: SharedMark[] = [];
  for (const h of highlights) {
    const v = parseVerseKey(h.verseKey);
    if (!v) continue;
    const ref = { book: v.book, chapter: v.chapter, verseStart: v.verse };
    marks.push({ user: h.user, color: h.color, reference: formatReference(ref, "de"), path: `/bibel/${v.book.id.toLowerCase()}/${v.chapter}?v=${v.verse}&t=${translation}` });
  }
  for (const n of notes) {
    const v = parseVerseKey(n.verseKey);
    if (!v) continue;
    const ref = { book: v.book, chapter: v.chapter, verseStart: v.verse, verseEnd: n.verseEnd ?? undefined };
    marks.push({
      user: n.user,
      reference: formatReference(ref, "de"),
      path: `/bibel/${v.book.id.toLowerCase()}/${v.chapter}?v=${n.verseEnd ? `${v.verse}-${n.verseEnd}` : v.verse}&t=${translation}`,
      note: { id: n.id, title: n.title, excerpt: n.body.replace(/[#*_>`]/g, "").slice(0, 160) },
    });
  }
  // sort by book/chapter/verse order via reference path
  marks.sort((a, b) => a.path.localeCompare(b.path, "de", { numeric: true }));
  return marks;
}

export function bookName(book: number): string {
  return getBookByNumber(book)?.name.de ?? `Buch ${book}`;
}
