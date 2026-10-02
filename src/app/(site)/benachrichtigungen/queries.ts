import "server-only";
import { prisma } from "@/lib/db";
import type { Page } from "@/lib/pagination";

/** Paged notification list for the notification centre (newest first) plus totals. */

export const actorSelect = { id: true, name: true, username: true, avatarUrl: true } as const;

export interface NotificationRow {
  id: string;
  type: string;
  title: string;
  body: string | null;
  href: string | null;
  readAt: Date | null;
  createdAt: Date;
  actor: { id: string; name: string; username: string; avatarUrl: string | null } | null;
}

export async function listNotificationsPage(
  userId: string,
  page: Page,
): Promise<{ items: NotificationRow[]; total: number; unread: number }> {
  const [items, total, unread] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip: page.skip,
      take: page.take,
      select: {
        id: true,
        type: true,
        title: true,
        body: true,
        href: true,
        readAt: true,
        createdAt: true,
        actor: { select: actorSelect },
      },
    }),
    prisma.notification.count({ where: { userId } }),
    prisma.notification.count({ where: { userId, readAt: null } }),
  ]);
  return { items, total, unread };
}
