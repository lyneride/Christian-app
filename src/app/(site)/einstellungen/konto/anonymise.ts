import "server-only";
import { prisma } from "@/lib/db";

/**
 * "Deletes" an account the way the privacy policy promises: the row stays so
 * that posts, comments and prayer requests keep a (now anonymous) author, but
 * every personal detail and all private study data are removed.
 */
export async function anonymiseUser(userId: string) {
  const shortId = userId.slice(-10).toLowerCase().replace(/[^a-z0-9]/g, "");
  await prisma.$transaction([
    prisma.session.deleteMany({ where: { userId } }),
    prisma.verificationToken.deleteMany({ where: { userId } }),
    prisma.notification.deleteMany({ where: { userId } }),
    prisma.follow.deleteMany({ where: { OR: [{ followerId: userId }, { followingId: userId }] } }),
    prisma.highlight.deleteMany({ where: { userId } }),
    prisma.note.deleteMany({ where: { userId } }),
    prisma.bookmark.deleteMany({ where: { userId } }),
    prisma.journalEntry.deleteMany({ where: { userId } }),
    prisma.memoryVerse.deleteMany({ where: { userId } }),
    prisma.planSubscription.deleteMany({ where: { userId } }),
    prisma.prayerSupport.deleteMany({ where: { userId } }),
    prisma.reaction.deleteMany({ where: { userId } }),
    prisma.readingLog.deleteMany({ where: { userId } }),
    prisma.user.update({
      where: { id: userId },
      data: {
        status: "DELETED",
        email: `deleted-${userId}@invalid.local`,
        emailVerifiedAt: null,
        passwordHash: "",
        name: "Gelöschtes Mitglied",
        username: `geloescht-${shortId}`,
        bio: null,
        avatarUrl: null,
        location: null,
        church: null,
        notifyByEmail: false,
        openForPartner: false,
        profileVisibility: "PRIVATE",
      },
    }),
  ]);
}
