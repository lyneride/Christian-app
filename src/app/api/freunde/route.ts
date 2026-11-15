import { getCurrentUser } from "@/lib/auth/dal";
import { prisma } from "@/lib/db";
import { listFriends } from "@/lib/friends/queries";

/**
 * Friends and group chats of the signed-in user (for pickers such as
 * "Vers senden"). Group chats are sorted by last activity.
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Nicht angemeldet." }, { status: 401 });
  const [friends, chats] = await Promise.all([
    listFriends(user.id),
    prisma.conversation.findMany({
      where: { isGroup: true, participants: { some: { userId: user.id } } },
      orderBy: { updatedAt: "desc" },
      take: 20,
      select: { id: true, title: true, group: { select: { name: true } }, _count: { select: { participants: true } } },
    }),
  ]);
  return Response.json(
    {
      friends,
      chats: chats.map((c) => ({ id: c.id, title: c.group?.name ?? c.title ?? "Gruppenchat", members: c._count.participants })),
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
