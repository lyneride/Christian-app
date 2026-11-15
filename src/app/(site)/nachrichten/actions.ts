"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getUserOrThrow, UnauthorizedError, type CurrentUser } from "@/lib/auth/dal";
import { failure, fieldErrors, stringValues, success, type ActionState } from "@/lib/action-state";
import { deliverMessage } from "@/lib/messages/deliver";
import { ensureGroupChat } from "@/lib/messages/group-chat";
import { findOrCreateDirectConversation, findRecipientByUsername, isParticipant } from "@/lib/messages/queries";
import { friendIds } from "@/lib/friends/queries";
import { isActiveGroupMember } from "@/lib/prayer/queries";
import { conversationIdSchema, sendMessageSchema, startConversationSchema, startGroupChatSchema } from "@/lib/validation/messages";

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

/**
 * Starts a chat with several friends: title, the chosen friends (only accepted
 * friends of the creator can be added) and a first message.
 */
export async function startGroupChat(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const values = stringValues(formData);
  const user = await actionUser();
  if (!user) return failure(LOGIN_REQUIRED, { values });

  const parsed = startGroupChatSchema.safeParse({
    title: values.title ?? "",
    memberIds: formData.getAll("memberIds").filter((v): v is string => typeof v === "string"),
    body: values.body ?? "",
  });
  if (!parsed.success) return failure("Bitte prüfe deine Eingaben.", { errors: fieldErrors(parsed.error), values });

  const friends = new Set(await friendIds(user.id));
  const memberIds = parsed.data.memberIds.filter((id) => id !== user.id && friends.has(id));
  if (memberIds.length === 0) {
    return failure("Bitte prüfe deine Eingaben.", { errors: { memberIds: ["Wähle mindestens einen Freund aus."] }, values });
  }

  let conversationId: string;
  try {
    const created = await prisma.conversation.create({
      data: {
        isGroup: true,
        title: parsed.data.title,
        createdById: user.id,
        participants: { create: [user.id, ...memberIds].map((userId) => ({ userId })) },
      },
      select: { id: true },
    });
    conversationId = created.id;
    await deliverMessage(conversationId, user, parsed.data.body);
  } catch (err) {
    console.error("[nachrichten] Gruppenchat konnte nicht gestartet werden:", err);
    return failure(GENERIC_ERROR, { values });
  }

  revalidateConversation(conversationId);
  redirect(conversationPath(conversationId));
}

/** Opens the chat of a Bleibe group (creating it on first use). Only for active members. */
export async function openGroupChat(groupId: string): Promise<ActionState> {
  const user = await actionUser();
  if (!user) return failure(LOGIN_REQUIRED);
  if (!conversationIdSchema.safeParse(groupId).success) return failure("Diese Gruppe gibt es nicht.");
  if (!(await isActiveGroupMember(user.id, groupId))) return failure("Den Gruppenchat sehen nur Mitglieder der Gruppe.");

  let conversationId: string;
  try {
    conversationId = await ensureGroupChat(groupId, user.id);
  } catch (err) {
    console.error("[nachrichten] Gruppenchat konnte nicht geöffnet werden:", err);
    return failure(GENERIC_ERROR);
  }
  redirect(conversationPath(conversationId));
}

/**
 * Leaves a chat among friends. Chats of a Bleibe group are left by leaving the
 * group. When the last person leaves, the chat is deleted.
 */
export async function leaveConversation(conversationId: string): Promise<ActionState> {
  const user = await actionUser();
  if (!user) return failure(LOGIN_REQUIRED);
  if (!conversationIdSchema.safeParse(conversationId).success) return failure(NOT_PARTICIPANT);

  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, participants: { some: { userId: user.id } } },
    select: { isGroup: true, groupId: true },
  });
  if (!conversation) return failure(NOT_PARTICIPANT);
  if (!conversation.isGroup) return failure("Aus einem Gespräch zu zweit kannst du nicht austreten.");
  if (conversation.groupId) return failure("Diesen Chat verlässt du, indem du die Gruppe verlässt.");

  try {
    await prisma.conversationParticipant.delete({ where: { conversationId_userId: { conversationId, userId: user.id } } });
    const left = await prisma.conversationParticipant.count({ where: { conversationId } });
    if (left === 0) await prisma.conversation.delete({ where: { id: conversationId } });
    await prisma.notification.updateMany({
      where: { userId: user.id, type: "message", href: conversationPath(conversationId), readAt: null },
      data: { readAt: new Date() },
    });
  } catch (err) {
    console.error("[nachrichten] Chat konnte nicht verlassen werden:", err);
    return failure(GENERIC_ERROR);
  }

  revalidatePath("/nachrichten");
  redirect("/nachrichten");
}
