import "server-only";
import { prisma } from "@/lib/db";

/**
 * Group chats. A Bleibe group has at most one chat (`Conversation.groupId`),
 * created on first use. Its participants mirror the group's ACTIVE members:
 * call `syncGroupChatMembers` after every membership change.
 */

/** Adds missing active members to the group's chat and removes everyone else. No-op without a chat. */
export async function syncGroupChatMembers(groupId: string): Promise<void> {
  const conversation = await prisma.conversation.findUnique({ where: { groupId }, select: { id: true } });
  if (!conversation) return;
  const [members, participants] = await Promise.all([
    prisma.groupMember.findMany({ where: { groupId, status: "ACTIVE" }, select: { userId: true } }),
    prisma.conversationParticipant.findMany({ where: { conversationId: conversation.id }, select: { userId: true } }),
  ]);
  const wanted = new Set(members.map((m) => m.userId));
  const present = new Set(participants.map((p) => p.userId));
  const add = [...wanted].filter((id) => !present.has(id));
  const remove = [...present].filter((id) => !wanted.has(id));
  if (add.length === 0 && remove.length === 0) return;

  // New members start "read" so they are not greeted by the whole history as unread.
  const now = new Date();
  await prisma.$transaction([
    prisma.conversationParticipant.createMany({
      data: add.map((userId) => ({ conversationId: conversation.id, userId, lastReadAt: now })),
      skipDuplicates: true,
    }),
    prisma.conversationParticipant.deleteMany({ where: { conversationId: conversation.id, userId: { in: remove } } }),
  ]);
}

/** Sync without failing the caller: a membership change must not break because of the chat. */
export async function syncGroupChatMembersSafe(groupId: string): Promise<void> {
  try {
    await syncGroupChatMembers(groupId);
  } catch (err) {
    console.error("[gruppenchat] Mitglieder konnten nicht abgeglichen werden:", err);
  }
}

/** The id of the group's chat, created when missing, with participants in sync. */
export async function ensureGroupChat(groupId: string, createdById: string): Promise<string> {
  const group = await prisma.group.findUnique({ where: { id: groupId }, select: { name: true } });
  if (!group) throw new Error("Diese Gruppe gibt es nicht.");
  const conversation = await prisma.conversation.upsert({
    where: { groupId },
    create: { groupId, isGroup: true, title: group.name, createdById },
    update: {},
    select: { id: true },
  });
  await syncGroupChatMembers(groupId);
  return conversation.id;
}

/** Id of the group's chat if it exists (no creation). */
export async function findGroupChatId(groupId: string): Promise<string | null> {
  const row = await prisma.conversation.findUnique({ where: { groupId }, select: { id: true } });
  return row?.id ?? null;
}

/** Unread messages in the group's chat for this member (0 when there is no chat yet). */
export async function groupChatUnread(groupId: string, userId: string): Promise<number> {
  const conversation = await prisma.conversation.findUnique({
    where: { groupId },
    select: { id: true, participants: { where: { userId }, select: { lastReadAt: true } } },
  });
  const me = conversation?.participants[0];
  if (!conversation || !me) return 0;
  return prisma.message.count({
    where: {
      conversationId: conversation.id,
      senderId: { not: userId },
      ...(me.lastReadAt ? { createdAt: { gt: me.lastReadAt } } : {}),
    },
  });
}
