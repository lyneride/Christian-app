import "server-only";
import { prisma } from "@/lib/db";

export type NotificationType =
  | "comment"
  | "reply"
  | "reaction"
  | "prayer_support"
  | "prayer_answered"
  | "group_request"
  | "group_accepted"
  | "partner_request"
  | "partner_accepted"
  | "event_reminder"
  | "event_rsvp"
  | "follow"
  | "friend_request"
  | "friend_accepted"
  | "plan_invite"
  | "message"
  | "mention"
  | "moderation";

export interface NotifyInput {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  href?: string;
  actorId?: string | null;
}

/** Creates a notification unless the actor is the recipient. */
export async function notify(input: NotifyInput) {
  if (input.actorId && input.actorId === input.userId) return null;
  return prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      href: input.href,
      actorId: input.actorId ?? null,
    },
  });
}

export async function notifyMany(userIds: string[], input: Omit<NotifyInput, "userId">) {
  const unique = [...new Set(userIds)].filter((id) => id !== input.actorId);
  if (unique.length === 0) return 0;
  const { count } = await prisma.notification.createMany({
    data: unique.map((userId) => ({
      userId,
      type: input.type,
      title: input.title,
      body: input.body,
      href: input.href,
      actorId: input.actorId ?? null,
    })),
  });
  return count;
}

export async function unreadCount(userId: string) {
  return prisma.notification.count({ where: { userId, readAt: null } });
}

export async function listNotifications(userId: string, limit = 30) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { actor: { select: { id: true, name: true, username: true, avatarUrl: true } } },
  });
}

export async function markAllRead(userId: string) {
  await prisma.notification.updateMany({ where: { userId, readAt: null }, data: { readAt: new Date() } });
}

export async function markRead(userId: string, id: string) {
  await prisma.notification.updateMany({ where: { id, userId, readAt: null }, data: { readAt: new Date() } });
}
