"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getUserOrThrow, UnauthorizedError } from "@/lib/auth/dal";
import { failure, success, type ActionState } from "@/lib/action-state";
import { getBookByNumber } from "@/lib/bible/books";
import { getTranslation, getVerses } from "@/lib/bible/data";
import { formatReference, referencePath } from "@/lib/bible/reference";
import { areFriends } from "@/lib/friends/queries";
import { notify } from "@/lib/notifications";
import { findOrCreateDirectConversation } from "./queries";

const schema = z.object({
  toUserId: z.string().min(5).max(64),
  book: z.number().int().min(1).max(66),
  chapter: z.number().int().min(1).max(150),
  verseStart: z.number().int().min(1).max(200),
  verseEnd: z.number().int().min(1).max(200).optional(),
  translation: z.string().min(2).max(16),
  note: z.string().trim().max(500).optional(),
});

export type SendVerseInput = z.infer<typeof schema>;

/** Sends a Bible passage (with text and link) as a direct message to a friend. */
export async function sendVerseToFriend(input: SendVerseInput): Promise<ActionState> {
  try {
    const user = await getUserOrThrow();
    const parsed = schema.safeParse(input);
    if (!parsed.success) return failure("Ungültige Angaben.");
    const { toUserId, book: bookNumber, chapter, verseStart, translation, note } = parsed.data;
    const verseEnd = parsed.data.verseEnd && parsed.data.verseEnd > verseStart ? parsed.data.verseEnd : undefined;
    if (toUserId === user.id) return failure("Du kannst dir selbst keinen Vers schicken.");
    if (!(await areFriends(user.id, toUserId))) return failure("Verse kannst du nur an Freunde schicken.");
    const recipient = await prisma.user.findUnique({ where: { id: toUserId }, select: { id: true, status: true } });
    if (!recipient || recipient.status !== "ACTIVE") return failure("Dieses Mitglied gibt es nicht mehr.");

    const book = getBookByNumber(bookNumber);
    const tr = await getTranslation(translation);
    if (!book || !tr) return failure("Bibelstelle nicht gefunden.");
    const verses = await getVerses(tr.id, bookNumber, chapter, verseStart, verseEnd ?? verseStart);
    if (verses.length === 0) return failure("Bibelstelle nicht gefunden.");
    const ref = { book, chapter, verseStart, verseEnd };
    const reference = formatReference(ref, tr.language === "en" ? "en" : "de");
    const text = verses.map((v) => (verses.length > 1 ? `${v.verse} ${v.text}` : v.text)).join(" ");
    const body = [note ? note : null, `„${text}“`, `— ${reference} (${tr.shortName})`, `${process.env.APP_URL ?? ""}${referencePath(ref, tr.id)}`]
      .filter(Boolean)
      .join("\n\n");

    const conversationId = await findOrCreateDirectConversation(user.id, toUserId);
    const now = new Date();
    await prisma.$transaction([
      prisma.message.create({ data: { conversationId, senderId: user.id, body } }),
      prisma.conversation.update({ where: { id: conversationId }, data: { updatedAt: now } }),
      prisma.conversationParticipant.updateMany({ where: { conversationId, userId: user.id }, data: { lastReadAt: now } }),
    ]);
    const href = `/nachrichten/${conversationId}`;
    const unread = await prisma.notification.count({ where: { userId: toUserId, type: "message", href, readAt: null } });
    if (unread === 0) {
      await notify({ userId: toUserId, actorId: user.id, type: "message", title: `${user.name} hat dir einen Vers geschickt`, body: reference, href });
    }
    revalidatePath("/nachrichten");
    revalidatePath(href);
    return success(`Gesendet: ${reference}`, { data: { href } });
  } catch (e) {
    if (e instanceof UnauthorizedError) return failure("Bitte melde dich an.");
    console.error(e);
    return failure("Der Vers konnte nicht gesendet werden.");
  }
}
