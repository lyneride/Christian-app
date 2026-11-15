import "server-only";
import { prisma } from "@/lib/db";
import { notifyMany } from "@/lib/notifications";
import { messagePreview } from "./format";

/**
 * Stores a message, marks it as read for the sender, bumps the conversation and
 * notifies the other participants – unless they already have an unread
 * notification for this conversation (no notification spam per message).
 */
export async function deliverMessage(
  conversationId: string,
  sender: { id: string; name: string },
  body: string,
  options: { notifyTitle?: string; notifyBody?: string } = {},
): Promise<void> {
  const now = new Date();
  const conversation = await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      updatedAt: now,
      messages: { create: { senderId: sender.id, body, createdAt: now } },
      participants: {
        update: {
          where: { conversationId_userId: { conversationId, userId: sender.id } },
          data: { lastReadAt: now },
        },
      },
    },
    select: { isGroup: true, title: true, group: { select: { name: true } }, participants: { select: { userId: true } } },
  });

  const href = `/nachrichten/${conversationId}`;
  const recipients = conversation.participants.map((p) => p.userId).filter((id) => id !== sender.id);
  if (recipients.length === 0) return;
  const pending = await prisma.notification.findMany({
    where: { userId: { in: recipients }, type: "message", href, readAt: null },
    select: { userId: true },
  });
  const alreadyNotified = new Set(pending.map((n) => n.userId));
  const chatTitle = conversation.group?.name ?? conversation.title;
  const preview = options.notifyBody ?? messagePreview(body);
  await notifyMany(recipients.filter((id) => !alreadyNotified.has(id)), {
    type: "message",
    title: conversation.isGroup
      ? `Neue Nachricht in „${chatTitle ?? "Gruppenchat"}“`
      : (options.notifyTitle ?? `Neue Nachricht von ${sender.name}`),
    body: conversation.isGroup ? `${sender.name}: ${preview}` : preview,
    href,
    actorId: sender.id,
  });
}
