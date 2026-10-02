import type { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/dal";
import { buildIcs } from "@/lib/events/ics";
import { getEvent } from "@/lib/events/queries";
import { slugify } from "@/lib/utils";

/**
 * GET /api/veranstaltungen/[id]/ics – calendar file for one event.
 * Respects the event's visibility (guests only get PUBLIC events, 404 otherwise);
 * the online link is included only for signed-in members.
 */
export async function GET(req: NextRequest, ctx: RouteContext<"/api/veranstaltungen/[id]/ics">) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  const viewer = user ? { id: user.id, role: user.role } : null;
  const event = await getEvent(id, viewer);
  if (!event) return new Response("Nicht gefunden", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });

  const base = (process.env.APP_URL || req.nextUrl.origin).replace(/\/+$/, "");
  let domain = "bleibe";
  try {
    domain = new URL(base).hostname || domain;
  } catch {
    // keep the default domain
  }

  const ics = buildIcs(
    { ...event, onlineUrl: viewer ? event.onlineUrl : null },
    { pageUrl: `${base}/veranstaltungen/${event.id}`, domain },
  );
  const filename = `${slugify(event.title) || "treffen"}.ics`;

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
