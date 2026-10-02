"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getUserOrThrow, UnauthorizedError, type CurrentUser } from "@/lib/auth/dal";
import { failure, fieldErrors, stringValues, success, type ActionState } from "@/lib/action-state";
import { notify } from "@/lib/notifications";
import { messagePreview } from "@/lib/messages/format";
import { findOrCreateDirectConversation, findRecipientByUsername, isParticipant } from "@/lib/messages/queries";
import { conversationIdSchema, sendMessageSchema, startConversationSchema } from "@/lib/validation/messages";

/**
 * Server actions for direct messages. Signature `(prevState, formData)` for
 * `useActionState`; expected failures are returned, never thrown.
 */

const LOGIN_REQUIRED = "Bitte melde dich an.";
const NOT_PARTICIPANT = "Diese Unterhaltung gibt es nicht oder du gehörst nicht dazu.";
const GENERIC_ERROR = "Das hat leider nicht geklappt. Bitte versuche es später noch einmal.";

async function actionUser(): Promise<CurrentUser | null> {
  try {
    return await getUserOrThrow();
  } catch (err) {
    if (err instanceof UnauthorizedError) return null;
    throw err;
  }
}

function conversationPath(id: string) {
  return `/nachrichten/${id}`;
}

function revalidateConversation(id: string) {
  revalidatePath("/nachrichten");
  revalidatePath(conversationPath(id));
}

/**
 * Stores a message, marks it as read for the sender, bumps the conversation and
 * notifies the other participants – unless they already have an unread
 * notification for this conversation (no notification spam per message).
 */
async function deliverMessage(conversationId: string, sender: CurrentUser, body: string) {
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
    select: { participants: { select: { userId: true } } },
  });

  const href = conversationPath(conversationId);
  for (const participant of conversation.participants) {
    if (participant.userId === sender.id) continue;
    const pending = await prisma.notification.findFirst({
      where: { userId: participant.userId, type: "message", href, readAt: null },
      select: { id: true },
    });
    if (pending) continue;
    await notify({
      userId: participant.userId,
      type: "message",
      title: `Neue Nachricht von ${sender.name}`,
      body: messagePreview(body),
      href,
      actorId: sender.id,
    });
  }
}

/** Starts (or continues) a 1:1 conversation with the member behind `username` and sends the first message. */
export async function startConversation(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const values = stringValues(formData);
  const user = await actionUser();
  if (!user) return failure(LOGIN_REQUIRED, { values });

  const parsed = startConversationSchema.safeParse({ username: values.username ?? "", body: values.body ?? "" });
  if (!parsed.success) return failure("Bitte prüfe deine Eingaben.", { errors: fieldErrors(parsed.error), values });

  const recipient = await findRecipientByUsername(parsed.data.username);
  if (!recipient) {
    return failure("Bitte prüfe deine Eingaben.", {
      errors: { username: ["Unter diesem Benutzernamen haben wir niemanden gefunden."] },
      values,
    });
  }
  if (recipient.id === user.id) {
    return failure("Bitte prüfe deine Eingaben.", {
      errors: { username: ["Dir selbst kannst du keine Nachricht schreiben."] },
      values,
    });
  }

  let conversationId: string;
  try {
    conversationId = await findOrCreateDirectConversation(user.id, recipient.id);
    await deliverMessage(conversationId, user, parsed.data.body);
  } catch (err) {
    console.error("[nachrichten] Unterhaltung konnte nicht gestartet werden:", err);
    return failure(GENERIC_ERROR, { values });
  }

  revalidateConversation(conversationId);
  redirect(conversationPath(conversationId));
}

/** Sends a message into an existing conversation the user takes part in. Bind the conversation id first. */
export async function sendMessage(conversationId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const values = stringValues(formData);
  const user = await actionUser();
  if (!user) return failure(LOGIN_REQUIRED, { values });

  if (!conversationIdSchema.safeParse(conversationId).success) return failure(NOT_PARTICIPANT, { values });
  if (!(await isParticipant(conversationId, user.id))) return failure(NOT_PARTICIPANT, { values });

  const parsed = sendMessageSchema.safeParse({ body: values.body ?? "" });
  if (!parsed.success) return failure("Bitte prüfe deine Nachricht.", { errors: fieldErrors(parsed.error), values });

  try {
    await deliverMessage(conversationId, user, parsed.data.body);
  } catch (err) {
    console.error("[nachrichten] Nachricht konnte nicht gesendet werden:", err);
    return failure(GENERIC_ERROR, { values });
  }

  revalidateConversation(conversationId);
  return success();
}

/**
 * Marks a conversation as read for the current user (called on mount of the
 * conversation page) and clears the matching "new message" notifications.
 */
export async function markConversationRead(conversationId: string): Promise<void> {
  const user = await actionUser();
  if (!user) return;
  if (!conversationIdSchema.safeParse(conversationId).success) return;

  const now = new Date();
  const { count } = await prisma.conversationParticipant.updateMany({
    where: { conversationId, userId: user.id },
    data: { lastReadAt: now },
  });
  if (count === 0) return;

  await prisma.notification.updateMany({
    where: { userId: user.id, type: "message", href: conversationPath(conversationId), readAt: null },
    data: { readAt: now },
  });

  revalidateConversation(conversationId);
}
