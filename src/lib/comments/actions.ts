"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getUserOrThrow, isModerator, UnauthorizedError, type CurrentUser } from "@/lib/auth/dal";
import { failure, fieldErrors, success, type ActionState } from "@/lib/action-state";
import { markdownToText } from "@/lib/markdown";
import { notify } from "@/lib/notifications";
import { addCommentSchema, commentIdSchema, editCommentSchema } from "@/lib/validation/comment";
import { findComment, resolveCommentTarget, targetOf } from "./queries";
import { commentAnchor, targetPath, type CommentTarget } from "./target";

/**
 * Shared comment actions for posts and prayer requests. All use the
 * `(prevState, formData)` signature for `useActionState`.
 */

const LOGIN_REQUIRED = "Bitte melde dich an.";
const GENERIC_ERROR = "Das hat leider nicht geklappt. Bitte versuche es später noch einmal.";

async function actionUser(): Promise<CurrentUser | null> {
  try {
    return await getUserOrThrow();
  } catch (err) {
    if (err instanceof UnauthorizedError) return null;
    throw err;
  }
}

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}

export async function addComment(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const values = { body: str(formData, "body") };
  const user = await actionUser();
  if (!user) return failure(LOGIN_REQUIRED, { values });

  const parsed = addCommentSchema.safeParse({
    postId: str(formData, "postId"),
    prayerRequestId: str(formData, "prayerRequestId"),
    parentId: str(formData, "parentId"),
    body: values.body,
  });
  if (!parsed.success) return failure("Bitte prüfe deine Eingabe.", { errors: fieldErrors(parsed.error), values });

  const input = parsed.data;
  const target: CommentTarget = input.postId
    ? { postId: input.postId }
    : { prayerRequestId: input.prayerRequestId as string };
  const resolved = await resolveCommentTarget(target, user);
  if (!resolved) return failure("Dieser Inhalt ist nicht mehr verfügbar.", { values });

  // Replies stay one level deep: a reply to a reply hangs under the top-level comment.
  let parentId: string | null = null;
  let replyToAuthorId: string | null = null;
  if (input.parentId) {
    const parent = await prisma.comment.findFirst({
      where: {
        id: input.parentId,
        deletedAt: null,
        ...(target.postId ? { postId: target.postId } : { prayerRequestId: target.prayerRequestId }),
      },
      select: { id: true, parentId: true, authorId: true },
    });
    if (!parent) return failure("Der Kommentar, auf den du antworten willst, gibt es nicht mehr.", { values });
    parentId = parent.parentId ?? parent.id;
    replyToAuthorId = parent.authorId;
  }

  let commentId: string;
  try {
    const comment = await prisma.comment.create({
      data: {
        authorId: user.id,
        body: input.body,
        parentId,
        postId: target.postId ?? null,
        prayerRequestId: target.prayerRequestId ?? null,
      },
      select: { id: true },
    });
    commentId = comment.id;

    const href = `${resolved.path}#${commentAnchor(commentId)}`;
    const excerpt = markdownToText(input.body, 140);
    const notified = new Set<string>([user.id]);

    if (replyToAuthorId && !notified.has(replyToAuthorId)) {
      notified.add(replyToAuthorId);
      await notify({
        userId: replyToAuthorId,
        actorId: user.id,
        type: "reply",
        title: "Antwort auf deinen Kommentar",
        body: excerpt,
        href,
      });
    }
    if (!notified.has(resolved.authorId)) {
      notified.add(resolved.authorId);
      await notify({
        userId: resolved.authorId,
        actorId: user.id,
        type: "comment",
        title: resolved.kind === "prayer" ? "Neue Ermutigung zu deinem Anliegen" : "Neuer Kommentar zu deinem Beitrag",
        body: excerpt,
        href,
      });
    }
  } catch (err) {
    console.error("[kommentare] Kommentar konnte nicht gespeichert werden:", err);
    return failure(GENERIC_ERROR, { values });
  }

  revalidatePath(resolved.path);
  return success(undefined, { data: { commentId } });
}

export async function editComment(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const values = { body: str(formData, "body") };
  const user = await actionUser();
  if (!user) return failure(LOGIN_REQUIRED, { values });

  const parsed = editCommentSchema.safeParse({ commentId: str(formData, "commentId"), body: values.body });
  if (!parsed.success) return failure("Bitte prüfe deine Eingabe.", { errors: fieldErrors(parsed.error), values });

  const comment = await findComment(parsed.data.commentId);
  if (!comment) return failure("Diesen Kommentar gibt es nicht mehr.", { values });
  if (comment.authorId !== user.id) return failure("Du kannst nur deine eigenen Kommentare bearbeiten.", { values });

  try {
    await prisma.comment.update({ where: { id: comment.id }, data: { body: parsed.data.body } });
  } catch (err) {
    console.error("[kommentare] Kommentar konnte nicht bearbeitet werden:", err);
    return failure(GENERIC_ERROR, { values });
  }

  const target = targetOf(comment);
  if (target) revalidatePath(targetPath(target));
  return success("Gespeichert.");
}

export async function deleteComment(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await actionUser();
  if (!user) return failure(LOGIN_REQUIRED);

  const parsed = commentIdSchema.safeParse({ commentId: str(formData, "commentId") });
  if (!parsed.success) return failure("Diesen Kommentar gibt es nicht mehr.");

  const comment = await findComment(parsed.data.commentId);
  if (!comment) return failure("Diesen Kommentar gibt es nicht mehr.");
  if (comment.authorId !== user.id && !isModerator(user)) return failure("Du darfst diesen Kommentar nicht löschen.");

  try {
    await prisma.comment.update({ where: { id: comment.id }, data: { deletedAt: new Date() } });
  } catch (err) {
    console.error("[kommentare] Kommentar konnte nicht gelöscht werden:", err);
    return failure(GENERIC_ERROR);
  }

  const target = targetOf(comment);
  if (target) revalidatePath(targetPath(target));
  return success("Kommentar gelöscht.");
}
