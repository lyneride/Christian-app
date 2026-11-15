import { z } from "zod";

/**
 * Validation for direct messages ("Nachrichten"). Pure module: used by the
 * server actions, the client forms and unit tests.
 */

export const MESSAGE_MAX = 4000;

/** Normalises line endings and collapses runs of blank lines; the text itself stays plain. */
function normaliseBody(value: unknown): unknown {
  if (typeof value !== "string") return value;
  return value.replace(/\r\n?/g, "\n").replace(/\n{3,}/g, "\n\n");
}

/** Plain text with line breaks, 1–4000 characters after trimming. */
export const messageBodySchema = z.preprocess(
  normaliseBody,
  z
    .string()
    .trim()
    .min(1, "Bitte schreib eine Nachricht.")
    .max(MESSAGE_MAX, `Eine Nachricht darf höchstens ${MESSAGE_MAX} Zeichen lang sein.`),
);

/** Username of the recipient; a leading "@" is tolerated, the result is lower-case. */
export const recipientUsernameSchema = z.preprocess(
  (value) => (typeof value === "string" ? value.trim().replace(/^@/, "") : value),
  z
    .string()
    .min(3, { error: "Bitte gib einen Benutzernamen mit mindestens 3 Zeichen an.", abort: true })
    .max(30, { error: "Ein Benutzername hat höchstens 30 Zeichen.", abort: true })
    .regex(/^[a-z0-9_.-]+$/i, "Nur Buchstaben, Zahlen, Punkt, Unterstrich und Bindestrich.")
    .transform((s) => s.toLowerCase()),
);

export const conversationIdSchema = z.string().trim().min(1).max(64);

export const startConversationSchema = z.object({
  username: recipientUsernameSchema,
  body: messageBodySchema,
});

export const sendMessageSchema = z.object({
  body: messageBodySchema,
});

export const CHAT_TITLE_MAX = 60;
export const GROUP_CHAT_MAX_MEMBERS = 30;

export const chatTitleSchema = z
  .string()
  .trim()
  .min(2, "Gib dem Chat einen Namen mit mindestens 2 Zeichen.")
  .max(CHAT_TITLE_MAX, `Der Name darf höchstens ${CHAT_TITLE_MAX} Zeichen lang sein.`);

export const startGroupChatSchema = z.object({
  title: chatTitleSchema,
  memberIds: z
    .array(z.string().trim().min(1).max(64))
    .min(1, "Wähle mindestens einen Freund aus.")
    .max(GROUP_CHAT_MAX_MEMBERS, `Höchstens ${GROUP_CHAT_MAX_MEMBERS} Personen pro Chat.`)
    .transform((ids) => [...new Set(ids)]),
  body: messageBodySchema,
});

export type StartGroupChatInput = z.infer<typeof startGroupChatSchema>;
export type StartConversationInput = z.infer<typeof startConversationSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
