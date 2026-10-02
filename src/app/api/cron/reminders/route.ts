import { timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { purgeExpiredSessions } from "@/lib/auth/session";
import { placeLabel } from "@/lib/events/format";
import { listReminderCandidates } from "@/lib/events/queries";
import { formatEventDate } from "@/lib/events/time";
import { notifyMany } from "@/lib/notifications";

/**
 * Cron endpoint: event reminders ("Morgen: …") plus session housekeeping.
 *
 * Call it once per hour, authenticated with the CRON_SECRET from `.env`:
 *   0 * * * *  curl -fsS -X POST -H "Authorization: Bearer $CRON_SECRET" https://<host>/api/cron/reminders
 * GET works too for services that can only ping a URL. Each run picks up the
 * events starting in 24–25 hours and tells hosts and GOING/MAYBE attendees.
 * It is idempotent: a member gets at most one reminder per event, so overlapping
 * or repeated runs are harmless. Expired sessions are purged in the same run.
 * Responds with { notified, events, purgedSessions }.
 */

const WINDOW_START_H = 24;
const WINDOW_END_H = 25;

type Auth = { ok: true } | { ok: false; status: number; message: string };

function authorize(req: NextRequest): Auth {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return {
      ok: false,
      status: 503,
      message: "CRON_SECRET ist nicht gesetzt. Lege die Variable in .env an (z. B. `openssl rand -hex 32`) und starte neu.",
    };
  }
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  const a = new TextEncoder().encode(token);
  const b = new TextEncoder().encode(secret);
  if (a.byteLength !== b.byteLength || !timingSafeEqual(a, b)) return { ok: false, status: 403, message: "Kein Zugriff." };
  return { ok: true };
}

async function run(req: NextRequest): Promise<Response> {
  const auth = authorize(req);
  if (!auth.ok) return Response.json({ error: auth.message }, { status: auth.status });

  const now = Date.now();
  const from = new Date(now + WINDOW_START_H * 3_600_000);
  const to = new Date(now + WINDOW_END_H * 3_600_000);
  const events = await listReminderCandidates(from, to);

  let notified = 0;
  for (const event of events) {
    const href = `/veranstaltungen/${event.id}`;
    const recipients = new Set<string>([event.hostId, ...event.attendeeIds]);
    const already = await prisma.notification.findMany({
      where: { type: "event_reminder", href, userId: { in: [...recipients] } },
      select: { userId: true },
    });
    for (const n of already) recipients.delete(n.userId);
    if (recipients.size === 0) continue;

    notified += await notifyMany([...recipients], {
      type: "event_reminder",
      title: `Morgen: ${event.title}`,
      body: `${formatEventDate(event.startsAt, event.endsAt)} · ${placeLabel(event)}`,
      href,
    });
  }

  const purgedSessions = await purgeExpiredSessions();
  return Response.json({ notified, events: events.length, purgedSessions });
}

export async function POST(req: NextRequest) {
  return run(req);
}

export async function GET(req: NextRequest) {
  return run(req);
}
