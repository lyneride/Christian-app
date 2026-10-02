import { markdownToText } from "@/lib/markdown";
import { DEFAULT_EVENT_DURATION_MS } from "./time";

/**
 * Minimal iCalendar (RFC 5545) export for a single event. Pure: no I/O.
 * All timestamps are written in UTC ("Z"), text is escaped and lines are
 * folded at 75 octets so multi-byte characters never get split.
 */

export interface IcsEvent {
  id: string;
  title: string;
  /** Markdown; converted to plain text. */
  description: string;
  startsAt: Date;
  endsAt: Date | null;
  isOnline: boolean;
  /** Only pass the link when the viewer may see it. */
  onlineUrl: string | null;
  location: string | null;
  city: string | null;
  updatedAt?: Date;
}

export interface IcsOptions {
  /** DTSTAMP; defaults to the current time. */
  now?: Date;
  /** Absolute link to the event page (appended to the description and used as URL for on-site events). */
  pageUrl?: string;
  /** Domain part of the UID. */
  domain?: string;
}

const MAX_LINE_OCTETS = 75;

/** Escapes backslash, semicolon, comma and line breaks as required for TEXT values. */
export function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n|\r|\n/g, "\\n");
}

/** "20261009T173000Z" */
export function formatIcsDate(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

function utf8Length(ch: string): number {
  const cp = ch.codePointAt(0) ?? 0;
  if (cp < 0x80) return 1;
  if (cp < 0x800) return 2;
  if (cp < 0x10000) return 3;
  return 4;
}

/**
 * Folds a content line into physical lines of at most 75 octets; continuation
 * lines start with a single space (which counts towards their 75 octets).
 */
export function foldIcsLine(line: string, maxOctets = MAX_LINE_OCTETS): string {
  const out: string[] = [];
  let current = "";
  let octets = 0;
  for (const ch of line) {
    const len = utf8Length(ch);
    if (octets + len > maxOctets) {
      out.push(current);
      current = " ";
      octets = 1;
    }
    current += ch;
    octets += len;
  }
  out.push(current);
  return out.join("\r\n");
}

export function buildIcs(event: IcsEvent, options: IcsOptions = {}): string {
  const now = options.now ?? new Date();
  const domain = options.domain ?? "bleibe";
  const end = event.endsAt ?? new Date(event.startsAt.getTime() + DEFAULT_EVENT_DURATION_MS);

  let description = markdownToText(event.description, 5000);
  if (options.pageUrl) description = description ? `${description}\n\n${options.pageUrl}` : options.pageUrl;

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Bleibe//Veranstaltungen//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.id}@${domain}`,
    `DTSTAMP:${formatIcsDate(now)}`,
    `DTSTART:${formatIcsDate(event.startsAt)}`,
    `DTEND:${formatIcsDate(end)}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
  ];
  if (description) lines.push(`DESCRIPTION:${escapeIcsText(description)}`);

  if (event.isOnline) {
    lines.push("LOCATION:Online");
    if (event.onlineUrl) lines.push(`URL:${event.onlineUrl}`);
  } else {
    const place = [event.location, event.city].filter(Boolean).join(", ");
    if (place) lines.push(`LOCATION:${escapeIcsText(place)}`);
    if (options.pageUrl) lines.push(`URL:${options.pageUrl}`);
  }
  if (event.updatedAt) lines.push(`LAST-MODIFIED:${formatIcsDate(event.updatedAt)}`);
  lines.push("END:VEVENT", "END:VCALENDAR");

  return lines.map((line) => foldIcsLine(line)).join("\r\n") + "\r\n";
}
