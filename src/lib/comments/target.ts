/**
 * A comment belongs to exactly one post or one prayer request. Pure helpers
 * shared by server queries, actions and client forms.
 */
export type CommentTarget =
  { postId: string; prayerRequestId?: undefined } | { prayerRequestId: string; postId?: undefined };

export function targetPath(target: CommentTarget): string {
  return target.postId ? `/gemeinschaft/beitrag/${target.postId}` : `/gebet/${target.prayerRequestId}`;
}

export function commentAnchor(commentId: string): string {
  return `kommentar-${commentId}`;
}
