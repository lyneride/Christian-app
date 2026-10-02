import type { Visibility } from "@/generated/prisma/enums";

/**
 * Shared visibility rules for user content (posts, prayer requests, events,
 * groups). Pure functions so they can be unit-tested and reused in queries.
 */

export interface Viewer {
  id: string;
  role: "USER" | "MODERATOR" | "ADMIN";
}

export interface VisibleContent {
  visibility: Visibility;
  authorId?: string | null;
  groupId?: string | null;
}

/**
 * @param viewer      the signed-in user or null for guests
 * @param isGroupMember whether the viewer is an active member of content.groupId
 */
export function canView(content: VisibleContent, viewer: Viewer | null, isGroupMember = false): boolean {
  if (viewer && (viewer.role === "ADMIN" || viewer.role === "MODERATOR")) return true;
  if (viewer && content.authorId && content.authorId === viewer.id) return true;
  switch (content.visibility) {
    case "PUBLIC":
      return true;
    case "MEMBERS":
      return viewer !== null;
    case "GROUP":
      return viewer !== null && isGroupMember;
    case "PRIVATE":
      return false;
    default:
      return false;
  }
}

/** Prisma `where` fragment selecting content the viewer may see (group membership passed as ids). */
export function visibilityWhere(viewer: Viewer | null, memberGroupIds: string[] = []) {
  if (!viewer) return { visibility: "PUBLIC" as const };
  if (viewer.role === "ADMIN" || viewer.role === "MODERATOR") return {};
  return {
    OR: [
      { visibility: "PUBLIC" as const },
      { visibility: "MEMBERS" as const },
      { visibility: "GROUP" as const, groupId: { in: memberGroupIds } },
      { authorId: viewer.id },
    ],
  };
}

export const VISIBILITY_LABELS: Record<Visibility, { label: string; hint: string }> = {
  PUBLIC: { label: "Öffentlich", hint: "Für alle sichtbar, auch ohne Konto." },
  MEMBERS: { label: "Nur Mitglieder", hint: "Nur für angemeldete Mitglieder sichtbar." },
  GROUP: { label: "Nur Gruppe", hint: "Nur für Mitglieder der ausgewählten Gruppe sichtbar." },
  PRIVATE: { label: "Privat", hint: "Nur für dich sichtbar." },
};
