import "server-only";
import { cache } from "react";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";

/**
 * Read access for direct messages. Privacy rule: only participants of a
 * conversation can read it; every query is scoped by the viewer's user id.
 */

export const participantSelect = { id: true, name: true, username: true, avatarUrl: true } as const;
export type Participant = { id: string; name: string; username: string; avatarUrl: string | null };

export interface LastMessage {
  id: string;
  body: string;
  senderId: string;
  createdAt: Date;
}

export interface ConversationSummary {
  id: string;
  updatedAt: Date;
  /** Everyone in the conversation except the viewer (empty if the other account was deleted). */
  others: Participant[];
  lastMessage: LastMessage | null;
  unreadCount: number;
}

export interface ConversationDetail {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  participants: { user: Participant; lastReadAt: Date | null }[];
  others: Participant[];
  /** The viewer's own participant row. */
  me: { lastReadAt: Date | null };
}

export interface MessageItem {
  id: string;
  body: string;
  senderId: string;
  createdAt: Date;
  sender: Participant;
}

export const MESSAGE_PAGE_SIZE = 50;

/** Where-clause for messages the viewer has not read yet (from other senders, newer than lastReadAt). */
function unreadWhere(conversationId: string, userId: string, lastReadAt: Date | null): Prisma.MessageWhereInput {
  return {
    conversationId,
    senderId: { not: userId },
    ...(lastReadAt ? { createdAt: { gt: lastReadAt } } : {}),
  };
}

/** All conversations of the viewer, newest activity first, with preview and unread count. */
export async function listConversations(userId: string): Promise<ConversationSummary[]> {
  const rows = await prisma.conversation.findMany({
    where: { participants: { some: { userId } } },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      updatedAt: true,
      participants: { select: { userId: true, lastReadAt: true, user: { select: participantSelect } } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { id: true, body: true, senderId: true, createdAt: true },
      },
    },
  });

  return Promise.all(
    rows.map(async (row) => {
      const me = row.participants.find((p) => p.userId === userId);
      const lastMessage = row.messages[0] ?? null;
      // Cheap short-cuts: nothing to count when there is no message, the last one is mine or already read.
      const mayHaveUnread =
        lastMessage !== null &&
        lastMessage.senderId !== userId &&
        (!me?.lastReadAt || lastMessage.createdAt > me.lastReadAt);
      const unreadCount = mayHaveUnread
        ? await prisma.message.count({ where: unreadWhere(row.id, userId, me?.lastReadAt ?? null) })
        : 0;
      return {
        id: row.id,
        updatedAt: row.updatedAt,
        others: row.participants.filter((p) => p.userId !== userId).map((p) => p.user),
        lastMessage,
        unreadCount,
      };
    }),
  );
}

/** A single conversation, or null when it does not exist or the viewer is not a participant. */
export const getConversation = cache(async (id: string, userId: string): Promise<ConversationDetail | null> => {
  const row = await prisma.conversation.findFirst({
    where: { id, participants: { some: { userId } } },
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
      participants: { select: { userId: true, lastReadAt: true, user: { select: participantSelect } } },
    },
  });
  if (!row) return null;
  const me = row.participants.find((p) => p.userId === userId);
  if (!me) return null;
  return {
    id: row.id,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    participants: row.participants.map((p) => ({ user: p.user, lastReadAt: p.lastReadAt })),
    others: row.participants.filter((p) => p.userId !== userId).map((p) => p.user),
    me: { lastReadAt: me.lastReadAt },
  };
});

export async function isParticipant(conversationId: string, userId: string): Promise<boolean> {
  const row = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
    select: { userId: true },
  });
  return row !== null;
}

/**
 * Messages of a conversation in ascending order. `before` loads the page that
 * ends just before that timestamp; `hasMore` tells whether older ones exist.
 * Callers must have checked participation (see `getConversation`).
 */
export async function listMessages(
  conversationId: string,
  options: { before?: Date; limit?: number } = {},
): Promise<{ messages: MessageItem[]; hasMore: boolean }> {
  const limit = Math.max(1, Math.min(200, options.limit ?? MESSAGE_PAGE_SIZE));
  const rows = await prisma.message.findMany({
    where: { conversationId, ...(options.before ? { createdAt: { lt: options.before } } : {}) },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    select: { id: true, body: true, senderId: true, createdAt: true, sender: { select: participantSelect } },
  });
  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;
  return { messages: page.reverse(), hasMore };
}

/** Finds the 1:1 conversation of two members (exactly these two participants) or creates it. Returns the id. */
export async function findOrCreateDirectConversation(userAId: string, userBId: string): Promise<string> {
  if (userAId === userBId) throw new Error("Eine Unterhaltung braucht zwei verschiedene Personen.");
  const existing = await prisma.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { userId: userAId } } },
        { participants: { some: { userId: userBId } } },
        { participants: { every: { userId: { in: [userAId, userBId] } } } },
      ],
    },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (existing) return existing.id;
  const created = await prisma.conversation.create({
    data: { participants: { create: [{ userId: userAId }, { userId: userBId }] } },
    select: { id: true },
  });
  return created.id;
}

/** Number of unread messages across all conversations (for the header badge). Memoised per request. */
export const totalUnreadMessages = cache(async (userId: string): Promise<number> => {
  const memberships = await prisma.conversationParticipant.findMany({
    where: { userId },
    select: { conversationId: true, lastReadAt: true },
  });
  if (memberships.length === 0) return 0;
  return prisma.message.count({
    where: { OR: memberships.map((m) => unreadWhere(m.conversationId, userId, m.lastReadAt)) },
  });
});

/** Unread "message" notifications; the bell subtracts them so a new message is not counted twice. */
export const unreadMessageNotifications = cache(async (userId: string): Promise<number> => {
  return prisma.notification.count({ where: { userId, type: "message", readAt: null } });
});

/** Active member by username (for starting a conversation). */
export async function findRecipientByUsername(username: string): Promise<Participant | null> {
  const user = await prisma.user.findUnique({
    where: { username },
    select: { ...participantSelect, status: true },
  });
  if (!user || user.status !== "ACTIVE") return null;
  return { id: user.id, name: user.name, username: user.username, avatarUrl: user.avatarUrl };
}
