import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { clientIp, formatRetryAfter, rateLimit } from "@/lib/auth/rate-limit";
import { createTerminalSession, json } from "@/lib/terminal/auth";
import { terminalLoginSchema } from "@/lib/validation/terminal";

/**
 * Terminal login: e-mail + password → long-lived bearer token for the native
 * iPhone app. The session appears in the member's session list as
 * "Bleibe-Terminal (…)" and can be revoked there.
 */

/** bcrypt hash of a random string, compared when the e-mail is unknown (same timing as a wrong password). */
const DUMMY_HASH = "$2b$12$e3VGoq1ztjIktTqJlcV9beWvvVZ0Phc8IFla/0eSC5jPiYVO.D94u";
const LOGIN_FAILED = "E-Mail-Adresse oder Passwort stimmen nicht.";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Ungültige Anfrage." }, 400);
  }
  const parsed = terminalLoginSchema.safeParse(body);
  if (!parsed.success) return json({ error: "Bitte gib deine E-Mail-Adresse und dein Passwort ein." }, 400);
  const { email, password, device } = parsed.data;

  const limit = rateLimit(`terminal-login:${email}:${await clientIp()}`, { limit: 10, windowMs: 15 * 60 * 1000 });
  if (!limit.ok) {
    return json({ error: `Zu viele Anmeldeversuche. Bitte versuche es ${formatRetryAfter(limit.retryAfterMs)} noch einmal.` }, 429);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, passwordHash: true, status: true, name: true, username: true, preferredTranslation: true },
    });
    const valid = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !valid) return json({ error: LOGIN_FAILED }, 401);
    if (user.status !== "ACTIVE") return json({ error: "Dieses Konto ist gesperrt oder gelöscht." }, 403);

    const { token, expiresAt } = await createTerminalSession(user.id, device);
    return json({ token, expiresAt, user: { name: user.name, username: user.username, preferredTranslation: user.preferredTranslation } });
  } catch (err) {
    console.error("[terminal] Anmeldung fehlgeschlagen:", err);
    return json({ error: "Das hat leider nicht geklappt. Bitte versuche es später noch einmal." }, 500);
  }
}
