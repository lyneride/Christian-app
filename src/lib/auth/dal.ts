import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { readSession } from "./session";

/**
 * Data Access Layer for authentication. Every page, server action and route
 * handler that needs the user goes through these helpers (never layouts alone).
 */

export const currentUserSelect = {
  id: true,
  email: true,
  emailVerifiedAt: true,
  username: true,
  name: true,
  bio: true,
  avatarUrl: true,
  location: true,
  church: true,
  role: true,
  status: true,
  preferredTranslation: true,
  createdAt: true,
} as const;

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

/** The signed-in user or null. Memoised per request. */
export const getCurrentUser = cache(async () => {
  const session = await readSession();
  if (!session) return null;
  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: currentUserSelect });
  if (!user || user.status !== "ACTIVE") return null;
  return user;
});

/** Redirects to the login page (with a return URL) when not signed in. */
export async function requireUser(returnTo?: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    const params = returnTo ? `?next=${encodeURIComponent(returnTo)}` : "";
    redirect(`/anmelden${params}`);
  }
  return user;
}

export async function requireRole(role: "MODERATOR" | "ADMIN", returnTo?: string): Promise<CurrentUser> {
  const user = await requireUser(returnTo);
  const ok = role === "MODERATOR" ? user.role === "MODERATOR" || user.role === "ADMIN" : user.role === "ADMIN";
  if (!ok) redirect("/?fehler=keine-berechtigung");
  return user;
}

/** Non-redirecting variant for server actions: throws a typed error instead. */
export class UnauthorizedError extends Error {
  constructor(message = "Nicht angemeldet.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export async function getUserOrThrow(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();
  return user;
}

export function isModerator(user: Pick<CurrentUser, "role"> | null | undefined): boolean {
  return user?.role === "MODERATOR" || user?.role === "ADMIN";
}

export function isAdmin(user: Pick<CurrentUser, "role"> | null | undefined): boolean {
  return user?.role === "ADMIN";
}
