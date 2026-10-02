import "server-only";
import { prisma } from "@/lib/db";
import { canView, type Viewer } from "@/lib/visibility";
import { authorSelect, canViewPrayerRequest, isActiveGroupMember, type Author } from "@/lib/prayer/queries";
import { targetPath, type CommentTarget } from "./target";

export type { CommentTarget } from "./target";

export interface CommentNode {
  id: string;
  body: string;
  authorId: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  author: Author;
  replies: CommentNode[];
}

/**
 * Comments for a post or prayer request, threaded one level deep (top-level +
 * replies). Deleted replies are dropped; a deleted top-level comment is kept
 * as a placeholder only while it still has visible replies.
 */
export async function listComments(target: CommentTarget): Promise<CommentNode[]> {
  const rows = await prisma.comment.findMany({
    where: target.postId ? { postId: target.postId } : { prayerRequestId: target.prayerRequestId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      body: true,
      authorId: true,
      parentId: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
      author: { select: authorSelect },
    },
  });

  const nodes = new Map<string, CommentNode>();
  for (const row of rows) nodes.set(row.id, { ...row, replies: [] });

  const topLevel: CommentNode[] = [];
  for (const node of nodes.values()) {
    if (!node.parentId) {
      topLevel.push(node);
      continue;
    }
    if (node.deletedAt) continue;
    // Replies are flattened to one level: a reply to a reply hangs under the same top-level comment.
    let parent = nodes.get(node.parentId);
    while (parent?.parentId) parent = nodes.get(parent.parentId);
    if (parent) parent.replies.push(node);
  }

  return topLevel.filter((node) => !node.deletedAt || node.replies.length > 0);
}

export interface ResolvedTarget {
  kind: "post" | "prayer";
  id: string;
  authorId: string;
  title: string;
  path: string;
}

/** Loads the target, checks it exists and that the viewer may see it. Returns null otherwise. */
export async function resolveCommentTarget(target: CommentTarget, viewer: Viewer): Promise<ResolvedTarget | null> {
  if (target.prayerRequestId) {
    const request = await prisma.prayerRequest.findFirst({
      where: { id: target.prayerRequestId, deletedAt: null },
      select: { id: true, authorId: true, title: true, visibility: true, groupId: true },
    });
    if (!request || !(await canViewPrayerRequest(request, viewer))) return null;
    return {
      kind: "prayer",
      id: request.id,
      authorId: request.authorId,
      title: request.title,
      path: targetPath(target),
    };
  }

  const post = await prisma.post.findFirst({
    where: { id: target.postId, deletedAt: null },
    select: { id: true, authorId: true, title: true, body: true, visibility: true, groupId: true },
  });
  if (!post) return null;
  const member =
    post.visibility === "GROUP" && post.groupId && post.authorId !== viewer.id
      ? await isActiveGroupMember(viewer.id, post.groupId)
      : false;
  if (!canView(post, viewer, member)) return null;
  return {
    kind: "post",
    id: post.id,
    authorId: post.authorId,
    title: post.title ?? "Beitrag",
    path: targetPath(target),
  };
}

/** Finds a live comment and the target it belongs to. */
export async function findComment(commentId: string) {
  if (!commentId || commentId.length > 64) return null;
  return prisma.comment.findFirst({
    where: { id: commentId, deletedAt: null },
    select: { id: true, authorId: true, parentId: true, postId: true, prayerRequestId: true, body: true },
  });
}

export function targetOf(comment: { postId: string | null; prayerRequestId: string | null }): CommentTarget | null {
  if (comment.postId) return { postId: comment.postId };
  if (comment.prayerRequestId) return { prayerRequestId: comment.prayerRequestId };
  return null;
}
