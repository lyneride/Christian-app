import { getCurrentUser } from "@/lib/auth/dal";
import { prisma } from "@/lib/db";

/**
 * Data export (Art. 20 DSGVO) for the signed-in member as a JSON download.
 * Contains no password hash and no tokens.
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Nicht angemeldet." }, { status: 401 });
  const userId = user.id;

  const [profile, posts, comments, prayerRequests, notes, highlights, bookmarks, journalEntries, memoryVerses, planSubscriptions] =
    await Promise.all([
      prisma.user.findUniqueOrThrow({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          emailVerifiedAt: true,
          username: true,
          name: true,
          bio: true,
          avatarUrl: true,
          location: true,
          church: true,
          preferredTranslation: true,
          profileVisibility: true,
          notifyByEmail: true,
          openForPartner: true,
          createdAt: true,
        },
      }),
      prisma.post.findMany({
        where: { authorId: userId },
        orderBy: { createdAt: "asc" },
        select: { id: true, kind: true, groupId: true, title: true, body: true, verseRef: true, visibility: true, createdAt: true, updatedAt: true, deletedAt: true },
      }),
      prisma.comment.findMany({
        where: { authorId: userId },
        orderBy: { createdAt: "asc" },
        select: { id: true, postId: true, prayerRequestId: true, parentId: true, body: true, createdAt: true, updatedAt: true, deletedAt: true },
      }),
      prisma.prayerRequest.findMany({
        where: { authorId: userId },
        orderBy: { createdAt: "asc" },
        select: { id: true, groupId: true, title: true, body: true, category: true, isAnonymous: true, visibility: true, status: true, answerNote: true, answeredAt: true, createdAt: true, updatedAt: true, deletedAt: true },
      }),
      prisma.note.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
        select: { id: true, verseKey: true, verseEnd: true, title: true, body: true, visibility: true, createdAt: true, updatedAt: true },
      }),
      prisma.highlight.findMany({ where: { userId }, orderBy: { createdAt: "asc" }, select: { verseKey: true, color: true, translation: true, createdAt: true } }),
      prisma.bookmark.findMany({ where: { userId }, orderBy: { createdAt: "asc" }, select: { verseKey: true, label: true, createdAt: true } }),
      prisma.journalEntry.findMany({
        where: { userId },
        orderBy: { date: "asc" },
        select: { id: true, date: true, title: true, body: true, gratitude: true, prayer: true, verseKey: true, createdAt: true, updatedAt: true },
      }),
      prisma.memoryVerse.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
        select: { verseKey: true, verseEnd: true, translation: true, text: true, reference: true, box: true, nextReviewAt: true, lastReviewedAt: true, reviewCount: true, correctCount: true, createdAt: true },
      }),
      prisma.planSubscription.findMany({
        where: { userId },
        orderBy: { startedAt: "asc" },
        select: {
          plan: { select: { slug: true, title: true } },
          startedAt: true,
          completedAt: true,
          archivedAt: true,
          progress: { select: { day: true, completedAt: true }, orderBy: { day: "asc" } },
        },
      }),
    ]);

  const body = JSON.stringify(
    { exportedAt: new Date().toISOString(), profile, posts, comments, prayerRequests, notes, highlights, bookmarks, journalEntries, memoryVerses, planSubscriptions },
    null,
    2,
  );

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="bleibe-export.json"',
      "Cache-Control": "no-store",
    },
  });
}
