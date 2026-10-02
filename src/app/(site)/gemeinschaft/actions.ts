"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ReactionKind } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import { getUserOrThrow, isModerator, UnauthorizedError, type CurrentUser } from "@/lib/auth/dal";
import { failure, fieldErrors, safeNext, stringValues, success, type ActionState } from "@/lib/action-state";
import { notify } from "@/lib/notifications";
import { markdownToText } from "@/lib/markdown";
import { canViewPost, emptyReactionCounts, reactionStats } from "@/lib/community/queries";
import { getMembership, isActiveMember } from "@/lib/groups/queries";
import { canManageGroup } from "@/lib/groups/roles";
import { postIdSchema, postPath, postSchema, reactionSchema, type PostInput } from "@/lib/validation/community";

/**
 * Server actions for the community feed. Signature `(prevState, formData)`
 * for `useActionState`; expected failures are returned, never thrown.
 */

const LOGIN_REQUIRED = "Bitte melde dich an.";
const NOT_FOUND = "Diesen Beitrag gibt es nicht mehr.";
const GENERIC_ERROR = "Das hat leider nicht geklappt. Bitte versuche es später noch einmal.";

async function actionUser(): Promise<CurrentUser | null> {
  try {
    return await getUserOrThrow();
  } catch (err) {
    if (err instanceof UnauthorizedError) return null;
    throw err;
  }
}

function revalidatePost(id: string, groupSlug?: string | null) {
  revalidatePath("/gemeinschaft");
  revalidatePath("/zeugnisse");
  revalidatePath(postPath(id));
  if (groupSlug) revalidatePath(`/gruppen/${groupSlug}`);
}

type ParsedPostForm =
  | { ok: false; error: ActionState }
  | { ok: true; data: PostInput; values: Record<string, string>; groupSlug: string | null };

/** Validates the form and checks group membership for GROUP visibility. */
async function parsePostForm(user: CurrentUser, formData: FormData): Promise<ParsedPostForm> {
  const values = stringValues(formData);
  const parsed = postSchema.safeParse({
    kind: values.kind ?? "",
    title: values.title ?? "",
    body: values.body ?? "",
    verseRef: values.verseRef ?? "",
    visibility: values.visibility ?? "",
    groupId: values.groupId ?? "",
  });
  if (!parsed.success) {
    return { ok: false, error: failure("Bitte prüfe deine Eingaben.", { errors: fieldErrors(parsed.error), values }) };
  }

  const data = parsed.data;
  let groupSlug: string | null = null;
  if (data.groupId) {
    const group = await prisma.group.findUnique({ where: { id: data.groupId }, select: { slug: true, visibility: true } });
    if (!group || !(await isActiveMember(data.groupId, user.id))) {
      return {
        ok: false,
        error: failure("Bitte prüfe deine Eingaben.", {
          errors: { groupId: ["Du bist in dieser Gruppe kein aktives Mitglied."] },
          values,
        }),
      };
    }
    groupSlug = group.slug;
    // Content of a closed group never leaves the group, whatever the form said.
    if (group.visibility === "PRIVATE") data.visibility = "GROUP";
  }
  return { ok: true, data, values, groupSlug };
}

// ---------------------------------------------------------------------------
// Erstellen / Bearbeiten / Löschen
// ---------------------------------------------------------------------------

/**
 * Creates a post. With `mode=inline` (feed compose box) the action returns a
 * success state so the box can reset in place; otherwise it redirects to the
 * new post (or to a safe `returnTo` path).
 */
export async function createPost(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await actionUser();
  if (!user) return failure(LOGIN_REQUIRED, { values: stringValues(formData) });

  const result = await parsePostForm(user, formData);
  if (!result.ok) return result.error;

  let id: string;
  try {
    const created = await prisma.post.create({ data: { ...result.data, authorId: user.id }, select: { id: true } });
    id = created.id;
  } catch (err) {
    console.error("[gemeinschaft] Beitrag konnte nicht gespeichert werden:", err);
    return failure(GENERIC_ERROR, { values: result.values });
  }

  revalidatePost(id, result.groupSlug);
  if (formData.get("mode") === "inline") {
    return success("Dein Beitrag ist online.", { data: { id, href: postPath(id), nonce: Date.now() } });
  }
  const returnTo = formData.get("returnTo");
  redirect(typeof returnTo === "string" && returnTo ? safeNext(returnTo, postPath(id)) : postPath(id));
}

export async function updatePost(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await actionUser();
  if (!user) return failure(LOGIN_REQUIRED, { values: stringValues(formData) });

  const existing = await prisma.post.findFirst({
    where: { id, deletedAt: null },
    select: { authorId: true, group: { select: { slug: true } } },
  });
  if (!existing) return failure(NOT_FOUND);
  if (existing.authorId !== user.id) return failure("Nur wer den Beitrag geschrieben hat, kann ihn bearbeiten.");

  const result = await parsePostForm(user, formData);
  if (!result.ok) return result.error;

  try {
    await prisma.post.update({ where: { id }, data: result.data });
  } catch (err) {
    console.error("[gemeinschaft] Beitrag konnte nicht aktualisiert werden:", err);
    return failure(GENERIC_ERROR, { values: result.values });
  }

  revalidatePost(id, existing.group?.slug);
  revalidatePost(id, result.groupSlug);
  redirect(postPath(id));
}

/** Soft delete by the author or a moderator. Bound with `.bind(null, id)`. */
export async function deletePost(id: string): Promise<ActionState> {
  const user = await actionUser();
  if (!user) return failure(LOGIN_REQUIRED);

  const post = await prisma.post.findFirst({
    where: { id, deletedAt: null },
    select: { authorId: true, group: { select: { slug: true } } },
  });
  if (!post) return failure(NOT_FOUND);
  if (post.authorId !== user.id && !isModerator(user)) return failure("Du darfst diesen Beitrag nicht löschen.");

  try {
    await prisma.post.update({ where: { id }, data: { deletedAt: new Date() } });
  } catch (err) {
    console.error("[gemeinschaft] Beitrag konnte nicht gelöscht werden:", err);
    return failure(GENERIC_ERROR);
  }

  revalidatePost(id, post.group?.slug);
  return success("Der Beitrag wurde gelöscht.");
}

// ---------------------------------------------------------------------------
// Reaktionen / Anpinnen
// ---------------------------------------------------------------------------

/**
 * One reaction per person and post: same kind again removes it, another kind
 * replaces it. Returns `data.viewerReaction` and `data.reactions` so the bar
 * can settle its optimistic state. The author is told at most once per
 * post and reactor.
 */
export async function toggleReaction(postId: string, kind: ReactionKind): Promise<ActionState> {
  const user = await actionUser();
  if (!user) return failure(LOGIN_REQUIRED);
  const parsed = reactionSchema.safeParse({ postId, kind });
  if (!parsed.success) return failure(NOT_FOUND);

  const post = await prisma.post.findFirst({
    where: { id: postId, deletedAt: null },
    select: { id: true, authorId: true, title: true, body: true, visibility: true, groupId: true, group: { select: { slug: true } } },
  });
  if (!post) return failure(NOT_FOUND);
  if (!(await canViewPost(post, user))) return failure(NOT_FOUND);

  const key = { postId_userId: { postId, userId: user.id } };
  let viewerReaction: ReactionKind | null;
  try {
    const existing = await prisma.reaction.findUnique({ where: key, select: { kind: true } });
    if (existing?.kind === kind) {
      await prisma.reaction.delete({ where: key });
      viewerReaction = null;
    } else {
      await prisma.reaction.upsert({ where: key, create: { postId, userId: user.id, kind }, update: { kind } });
      viewerReaction = kind;
      if (!existing && post.authorId !== user.id) {
        const href = postPath(postId);
        const already = await prisma.notification.findFirst({
          where: { userId: post.authorId, actorId: user.id, type: "reaction", href },
          select: { id: true },
        });
        if (!already) {
          await notify({
            userId: post.authorId,
            actorId: user.id,
            type: "reaction",
            title: `${user.name} hat auf deinen Beitrag reagiert`,
            body: markdownToText(post.title ?? post.body, 120),
            href,
          });
        }
      }
    }
  } catch (err) {
    console.error("[gemeinschaft] Reaktion konnte nicht gespeichert werden:", err);
    return failure(GENERIC_ERROR);
  }

  revalidatePost(postId, post.group?.slug);
  const stats = (await reactionStats([postId], user.id)).get(postId);
  return success(undefined, { data: { viewerReaction, reactions: stats?.reactions ?? emptyReactionCounts() } });
}

/** Pins or unpins a group post. Group owner/admin or a moderator. */
export async function togglePin(postId: string): Promise<ActionState> {
  const user = await actionUser();
  if (!user) return failure(LOGIN_REQUIRED);
  if (!postIdSchema.safeParse(postId).success) return failure(NOT_FOUND);

  const post = await prisma.post.findFirst({
    where: { id: postId, deletedAt: null },
    select: { pinned: true, groupId: true, group: { select: { slug: true } } },
  });
  if (!post) return failure(NOT_FOUND);
  if (!post.groupId) return failure("Nur Beiträge in einer Gruppe lassen sich anpinnen.");

  const membership = await getMembership(post.groupId, user.id);
  if (!canManageGroup(membership) && !isModerator(user)) return failure("Nur die Gruppenleitung kann Beiträge anpinnen.");

  try {
    await prisma.post.update({ where: { id: postId }, data: { pinned: !post.pinned } });
  } catch (err) {
    console.error("[gemeinschaft] Anpinnen fehlgeschlagen:", err);
    return failure(GENERIC_ERROR);
  }

  revalidatePost(postId, post.group?.slug);
  return success(post.pinned ? "Der Beitrag ist nicht mehr angepinnt." : "Der Beitrag ist jetzt oben angepinnt.", {
    data: { pinned: !post.pinned },
  });
}
