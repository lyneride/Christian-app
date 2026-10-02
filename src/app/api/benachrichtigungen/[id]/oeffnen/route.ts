import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/dal";
import { prisma } from "@/lib/db";
import { markRead } from "@/lib/notifications";
import { safeNext } from "@/lib/action-state";

/**
 * GET /api/benachrichtigungen/[id]/oeffnen – marks the notification as read
 * and redirects (303) to its target, or to the notification centre.
 */
export async function GET(req: NextRequest, ctx: RouteContext<"/api/benachrichtigungen/[id]/oeffnen">) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) {
    const next = encodeURIComponent("/benachrichtigungen");
    return NextResponse.redirect(new URL(`/anmelden?next=${next}`, req.nextUrl), 303);
  }

  const notification = await prisma.notification.findFirst({
    where: { id, userId: user.id },
    select: { href: true },
  });
  if (notification) await markRead(user.id, id);

  const target = safeNext(notification?.href, "/benachrichtigungen");
  return NextResponse.redirect(new URL(target, req.nextUrl), 303);
}
