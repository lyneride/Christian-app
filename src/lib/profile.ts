import type { Visibility } from "@/generated/prisma/enums";
import type { Viewer } from "@/lib/visibility";

/**
 * Pure rules for member profiles: who may see the details of a profile and
 * which of a member's content shows up on it. Kept free of Prisma so they can
 * be unit-tested.
 */

export interface ProfileLike {
  id: string;
  profileVisibility: Visibility;
}

/** Whether the viewer may see bio, counts and posts of a profile (name and username are always visible). */
export function canViewProfile(profile: ProfileLike, viewer: Viewer | null): boolean {
  if (viewer && (viewer.id === profile.id || viewer.role === "ADMIN" || viewer.role === "MODERATOR")) return true;
  switch (profile.profileVisibility) {
    case "PUBLIC":
      return true;
    case "MEMBERS":
    case "GROUP":
      return viewer !== null;
    default:
      return false;
  }
}

/** Visibilities of a member's content that a profile page lists for this viewer. */
export function profileContentVisibilities(viewer: Viewer | null): Visibility[] {
  return viewer ? ["PUBLIC", "MEMBERS"] : ["PUBLIC"];
}

/** Username part of a profile path: `/@maria` → "maria". */
export function profilePath(username: string): string {
  return `/@${username}`;
}
