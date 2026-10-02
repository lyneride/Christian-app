import type { GroupRole, MembershipStatus } from "@/generated/prisma/enums";

/**
 * Pure permission rules for groups. No database access so they can be
 * unit-tested and shared between queries, actions and UI.
 */

export interface MembershipLike {
  role: GroupRole;
  status: MembershipStatus;
}

export function isActive(m: MembershipLike | null | undefined): boolean {
  return m?.status === "ACTIVE";
}

/** Owner or admin with an active membership. */
export function canManageGroup(m: MembershipLike | null | undefined): boolean {
  return isActive(m) && (m!.role === "OWNER" || m!.role === "ADMIN");
}

export function isOwner(m: MembershipLike | null | undefined): boolean {
  return isActive(m) && m!.role === "OWNER";
}

/**
 * Whether `actor` may remove, ban or reject `target`. Admins only act on
 * plain members; the owner can act on everyone except themselves.
 */
export function canActOn(actor: MembershipLike | null | undefined, target: MembershipLike): boolean {
  if (!canManageGroup(actor)) return false;
  if (target.role === "OWNER") return false;
  if (actor!.role === "ADMIN") return target.role === "MEMBER";
  return true;
}

/** Role changes (incl. transferring ownership) are reserved for the owner. */
export function canChangeRole(actor: MembershipLike | null | undefined, target: MembershipLike): boolean {
  return isOwner(actor) && isActive(target) && target.role !== "OWNER";
}

/** Sort order for member lists: leadership first, then by join date. */
const ROLE_ORDER: Record<GroupRole, number> = { OWNER: 0, ADMIN: 1, MEMBER: 2 };

export function compareMembers<T extends { role: GroupRole; joinedAt: Date }>(a: T, b: T): number {
  return ROLE_ORDER[a.role] - ROLE_ORDER[b.role] || a.joinedAt.getTime() - b.joinedAt.getTime();
}

/** Short status text for the join button. */
export function membershipLabel(m: MembershipLike | null | undefined): string | null {
  if (!m) return null;
  if (m.status === "PENDING") return "Anfrage gesendet";
  if (m.status === "BANNED") return "Kein Zugang";
  return m.role === "OWNER" ? "Du leitest die Gruppe" : m.role === "ADMIN" ? "Du bist in der Leitung" : "Du bist dabei";
}
