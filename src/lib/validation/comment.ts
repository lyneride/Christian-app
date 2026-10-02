import { z } from "zod";

/** Validation for comments on posts and prayer requests (shared module). */

export const commentBodySchema = z
  .string()
  .trim()
  .min(1, "Bitte schreib etwas.")
  .max(2000, "Ein Kommentar darf höchstens 2000 Zeichen lang sein.");

const optionalId = z
  .string()
  .trim()
  .max(64)
  .optional()
  .transform((v) => (v ? v : undefined));

export const addCommentSchema = z
  .object({
    postId: optionalId,
    prayerRequestId: optionalId,
    parentId: optionalId,
    body: commentBodySchema,
  })
  .superRefine((data, ctx) => {
    const targets = [data.postId, data.prayerRequestId].filter(Boolean).length;
    if (targets !== 1) {
      ctx.addIssue({ code: "custom", path: ["body"], message: "Der Kommentar hat kein gültiges Ziel." });
    }
  });

export type AddCommentInput = z.infer<typeof addCommentSchema>;

export const editCommentSchema = z.object({
  commentId: z.string().trim().min(1).max(64),
  body: commentBodySchema,
});

export const commentIdSchema = z.object({ commentId: z.string().trim().min(1).max(64) });
