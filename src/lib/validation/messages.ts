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

export type StartConversationInput = z.infer<typeof startConversationSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
