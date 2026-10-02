import "server-only";
import { hashToken } from "@/lib/auth/tokens";
import { prisma } from "@/lib/db";

export type EmailChangeResult =
  | { ok: true; email: string }
  | { ok: false; reason: "invalid" | "expired" | "foreign" | "taken" };

/**
 * Applies a pending e-mail change when the token is valid, unexpired, unused,
 * belongs to the signed-in user and the new address is still free.
 */
export async function confirmEmailChange(userId: string, token: string): Promise<EmailChangeResult> {
  if (token.length < 20 || token.length > 128) return { ok: false, reason: "invalid" };

  const record = await prisma.verificationToken.findUnique({
    where: { tokenHash: hashToken(token) },
    select: { id: true, userId: true, purpose: true, newEmail: true, expiresAt: true, usedAt: true },
  });
  if (!record || record.purpose !== "EMAIL_CHANGE" || !record.newEmail || record.usedAt) {
    return { ok: false, reason: "invalid" };
  }
  if (record.userId !== userId) return { ok: false, reason: "foreign" };
  if (record.expiresAt.getTime() < Date.now()) return { ok: false, reason: "expired" };

  const taken = await prisma.user.findUnique({ where: { email: record.newEmail }, select: { id: true } });
  if (taken && taken.id !== userId) return { ok: false, reason: "taken" };

  const now = new Date();
  try {
    await prisma.$transaction([
      // Whoever opened the link controls the new mailbox, so it counts as verified.
      prisma.user.update({ where: { id: userId }, data: { email: record.newEmail, emailVerifiedAt: now } }),
      prisma.verificationToken.update({ where: { id: record.id }, data: { usedAt: now } }),
    ]);
  } catch (err) {
    if ((err as { code?: string })?.code === "P2002") return { ok: false, reason: "taken" };
    throw err;
  }
  return { ok: true, email: record.newEmail };
}
