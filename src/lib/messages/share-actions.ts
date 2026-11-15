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
import { deliverMessage } from "./deliver";
import { findOrCreateDirectConversation, isParticipant } from "./queries";

const schema = z.object({
  /** Either a friend (1:1 chat) … */
  toUserId: z.string().min(5).max(64).optional(),
  /** … or an existing chat the sender is part of (e.g. a group chat). */
  conversationId: z.string().min(5).max(64).optional(),
  book: z.number().int().min(1).max(66),
  chapter: z.number().int().min(1).max(150),
  verseStart: z.number().int().min(1).max(200),
  verseEnd: z.number().int().min(1).max(200).optional(),
  translation: z.string().min(2).max(16),
  note: z.string().trim().max(500).optional(),
});

export type SendVerseInput = z.infer<typeof schema>;

/** Sends a Bible passage (with text and link) to a friend or into one of the sender's chats. */
export async function sendVerseToFriend(input: SendVerseInput): Promise<ActionState> {
  try {
    const user = await getUserOrThrow();
    const parsed = schema.safeParse(input);
    if (!parsed.success) return failure("Ungültige Angaben.");
    const { toUserId, conversationId: chatId, book: bookNumber, chapter, verseStart, translation, note } = parsed.data;
    const verseEnd = parsed.data.verseEnd && parsed.data.verseEnd > verseStart ? parsed.data.verseEnd : undefined;
    if (!toUserId === !chatId) return failure("Ungültige Angaben.");
    if (toUserId) {
      if (toUserId === user.id) return failure("Du kannst dir selbst keinen Vers schicken.");
      if (!(await areFriends(user.id, toUserId))) return failure("Verse kannst du nur an Freunde schicken.");
      const recipient = await prisma.user.findUnique({ where: { id: toUserId }, select: { id: true, status: true } });
      if (!recipient || recipient.status !== "ACTIVE") return failure("Dieses Mitglied gibt es nicht mehr.");
    } else if (!(await isParticipant(chatId as string, user.id))) {
      return failure("Diesen Chat gibt es nicht oder du bist nicht dabei.");
    }

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

    const conversationId = toUserId ? await findOrCreateDirectConversation(user.id, toUserId) : (chatId as string);
    await deliverMessage(conversationId, user, body, {
      notifyTitle: `${user.name} hat dir einen Vers geschickt`,
      notifyBody: reference,
    });
    const href = `/nachrichten/${conversationId}`;
    revalidatePath("/nachrichten");
    revalidatePath(href);
    return success(`Gesendet: ${reference}`, { data: { href } });
  } catch (e) {
    if (e instanceof UnauthorizedError) return failure("Bitte melde dich an.");
    console.error(e);
    return failure("Der Vers konnte nicht gesendet werden.");
  }
}
