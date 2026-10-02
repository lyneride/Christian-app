import "server-only";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { hashToken, randomToken } from "./tokens";

/**
 * Database-backed sessions. The cookie holds a random opaque token; only its
 * SHA-256 hash is stored, so a database leak does not expose live sessions.
 * Sessions can be listed and revoked per device.
 */

export const SESSION_COOKIE = "bleibe_session";
const SESSION_DAYS = 30;
const SESSION_DAYS_SHORT = 1;
/** lastActiveAt is bumped at most every 15 minutes to avoid a write per request */
const TOUCH_INTERVAL_MS = 15 * 60 * 1000;

function cookieOptions(expires: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires,
  };
}

export async function createSession(userId: string, opts: { remember?: boolean; userAgent?: string | null } = {}) {
  const token = randomToken(32);
  const days = opts.remember === false ? SESSION_DAYS_SHORT : SESSION_DAYS;
  const expiresAt = new Date(Date.now() + days * 86_400_000);
  await prisma.session.create({
    data: { tokenHash: hashToken(token), userId, expiresAt, userAgent: opts.userAgent?.slice(0, 255) ?? null },
  });
  (await cookies()).set(SESSION_COOKIE, token, cookieOptions(expiresAt));
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
  store.delete(SESSION_COOKIE);
}

export async function destroyAllSessions(userId: string, exceptCurrent = true) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  await prisma.session.deleteMany({
    where: { userId, ...(exceptCurrent && token ? { NOT: { tokenHash: hashToken(token) } } : {}) },
  });
}

export interface SessionRecord {
  sessionId: string;
  userId: string;
  expiresAt: Date;
}

/** Reads and validates the session cookie. Returns null when absent/expired. */
export async function readSession(): Promise<SessionRecord | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || token.length < 20) return null;
  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    select: { id: true, userId: true, expiresAt: true, lastActiveAt: true, user: { select: { status: true } } },
  });
  if (!session || session.expiresAt.getTime() < Date.now() || session.user.status !== "ACTIVE") return null;
  if (Date.now() - session.lastActiveAt.getTime() > TOUCH_INTERVAL_MS) {
    // fire-and-forget; failures are harmless
    prisma.session.update({ where: { id: session.id }, data: { lastActiveAt: new Date() } }).catch(() => {});
    prisma.user.update({ where: { id: session.userId }, data: { lastSeenAt: new Date() } }).catch(() => {});
  }
  return { sessionId: session.id, userId: session.userId, expiresAt: session.expiresAt };
}

export async function listSessions(userId: string) {
  return prisma.session.findMany({
    where: { userId, expiresAt: { gt: new Date() } },
    orderBy: { lastActiveAt: "desc" },
    select: { id: true, userAgent: true, createdAt: true, lastActiveAt: true },
  });
}

export async function revokeSession(userId: string, sessionId: string) {
  await prisma.session.deleteMany({ where: { id: sessionId, userId } });
}

/** Housekeeping: delete expired sessions (call from a cron/route handler). */
export async function purgeExpiredSessions() {
  const { count } = await prisma.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  return count;
}
