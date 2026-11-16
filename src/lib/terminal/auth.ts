import "server-only";
import { prisma } from "@/lib/db";
import { hashToken, randomToken } from "@/lib/auth/tokens";

/**
 * Bearer-token sessions for the Bleibe-Terminal (native iPhone app).
 *
 * They are ordinary rows in `Session` (so they show up in the session list and
 * can be revoked there), marked by their user agent. Only sessions created
 * through the terminal login are accepted as bearer tokens – a web cookie can
 * never be replayed against the terminal API. The terminal is a fixed device,
 * so its session slides forward while it is in use.
 */

export const TERMINAL_UA_PREFIX = "Bleibe-Terminal";
const TERMINAL_SESSION_DAYS = 365;
const TOUCH_INTERVAL_MS = 15 * 60 * 1000;

function terminalExpiry(from = Date.now()): Date {
  return new Date(from + TERMINAL_SESSION_DAYS * 86_400_000);
}

export async function createTerminalSession(userId: string, device?: string) {
  const token = randomToken(32);
  const expiresAt = terminalExpiry();
  const label = device?.replace(/[^\p{L}\p{N} ._-]/gu, "").trim();
  const userAgent = `${TERMINAL_UA_PREFIX}${label ? ` (${label})` : ""}`.slice(0, 255);
  await prisma.session.create({ data: { tokenHash: hashToken(token), userId, expiresAt, userAgent } });
  return { token, expiresAt };
}

export function bearerToken(request: Request): string | null {
  const header = request.headers.get("authorization")?.trim() ?? "";
  const match = /^Bearer\s+([A-Za-z0-9_-]{20,200})$/i.exec(header);
  return match ? match[1] : null;
}

export interface TerminalUser {
  sessionId: string;
  id: string;
  name: string;
  username: string;
  preferredTranslation: string;
}

/** The member behind the bearer token, or null (missing, unknown, expired, not a terminal session, account not active). */
export async function terminalUser(request: Request): Promise<TerminalUser | null> {
  const token = bearerToken(request);
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    select: {
      id: true,
      userAgent: true,
      expiresAt: true,
      lastActiveAt: true,
      user: { select: { id: true, name: true, username: true, preferredTranslation: true, status: true } },
    },
  });
  if (!session || !session.userAgent?.startsWith(TERMINAL_UA_PREFIX)) return null;
  if (session.expiresAt.getTime() < Date.now() || session.user.status !== "ACTIVE") return null;

  if (Date.now() - session.lastActiveAt.getTime() > TOUCH_INTERVAL_MS) {
    const now = new Date();
    try {
      await prisma.$transaction([
        prisma.session.update({ where: { id: session.id }, data: { lastActiveAt: now, expiresAt: terminalExpiry(now.getTime()) } }),
        prisma.user.update({ where: { id: session.user.id }, data: { lastSeenAt: now } }),
      ]);
    } catch (err) {
      console.error("[terminal] Sitzung konnte nicht verlängert werden:", err);
    }
  }

  const { id, name, username, preferredTranslation } = session.user;
  return { sessionId: session.id, id, name, username, preferredTranslation };
}

export async function deleteTerminalSession(request: Request): Promise<void> {
  const token = bearerToken(request);
  if (!token) return;
  await prisma.session.deleteMany({ where: { tokenHash: hashToken(token), userAgent: { startsWith: TERMINAL_UA_PREFIX } } });
}

/** JSON response that is never cached (all terminal responses are personal). */
export function json(data: unknown, status = 200): Response {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export function unauthorized(): Response {
  return json({ error: "Bitte melde dich am Terminal neu an." }, 401);
}
