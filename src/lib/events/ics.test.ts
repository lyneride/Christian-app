import { describe, expect, it } from "vitest";
import { buildIcs, escapeIcsText, foldIcsLine, formatIcsDate, type IcsEvent } from "./ics";

const event: IcsEvent = {
  id: "ev1",
  title: "Bibelabend; Römer 8, Teil 2",
  description: "Wir lesen **gemeinsam** und beten.\n\nBring etwas zu essen mit.",
  startsAt: new Date("2026-10-09T17:30:00Z"),
  endsAt: new Date("2026-10-09T19:00:00Z"),
  isOnline: false,
  onlineUrl: null,
  location: "Gemeindehaus, Saal 2",
  city: "Hamburg",
  updatedAt: new Date("2026-09-01T08:00:00Z"),
};

const now = new Date("2026-10-01T10:00:00Z");

function unfold(ics: string): string[] {
  return ics.replace(/\r\n /g, "").split("\r\n").filter(Boolean);
}

describe("escapeIcsText / formatIcsDate", () => {
  it("escapes backslash, semicolon, comma and newlines", () => {
    expect(escapeIcsText("a,b;c\\d\ne\r\nf")).toBe("a\\,b\;c\\\\d\\ne\\nf");
  });
  it("writes UTC timestamps in basic format", () => {
    expect(formatIcsDate(new Date("2026-10-09T17:30:00.123Z"))).toBe("20261009T173000Z");
  });
});

describe("foldIcsLine", () => {
  it("leaves short lines alone and folds long ones at 75 octets", () => {
    expect(foldIcsLine("SUMMARY:kurz")).toBe("SUMMARY:kurz");
    const folded = foldIcsLine("DESCRIPTION:" + "x".repeat(200));
    const physical = folded.split("\r\n");
    expect(physical.length).toBe(3);
    for (const line of physical) expect(Buffer.byteLength(line, "utf8")).toBeLessThanOrEqual(75);
    expect(physical[1].startsWith(" ")).toBe(true);
    expect(physical.join("").replace(/\r\n /g, "")).toBe(
      "DESCRIPTION:" +
        "x".repeat(200).slice(0, 63) +
        " " +
        "x".repeat(200).slice(63, 137) +
        " " +
        "x".repeat(200).slice(137),
    );
  });

  it("never splits multi-byte characters", () => {
    const text = "DESCRIPTION:" + "ä".repeat(100); // 2 octets each
    const physical = foldIcsLine(text).split("\r\n");
    for (const line of physical) {
      expect(Buffer.byteLength(line, "utf8")).toBeLessThanOrEqual(75);
      expect(line.replace(/^ /, "")).toMatch(/^(DESCRIPTION:)?ä+$/);
    }
    expect(physical.map((l) => l.replace(/^ /, "")).join("")).toBe(text);
  });
});

describe("buildIcs", () => {
  it("produces a VCALENDAR with one VEVENT in UTC", () => {
    const ics = buildIcs(event, {
      now,
      pageUrl: "https://bleibe.example/veranstaltungen/ev1",
      domain: "bleibe.example",
    });
    expect(ics.startsWith("BEGIN:VCALENDAR\r\nVERSION:2.0\r\n")).toBe(true);
    expect(ics.endsWith("END:VEVENT\r\nEND:VCALENDAR\r\n")).toBe(true);
    const lines = unfold(ics);
    expect(lines).toContain("UID:ev1@bleibe.example");
    expect(lines).toContain("DTSTAMP:20261001T100000Z");
    expect(lines).toContain("DTSTART:20261009T173000Z");
    expect(lines).toContain("DTEND:20261009T190000Z");
    expect(lines).toContain("SUMMARY:Bibelabend\; Römer 8\\, Teil 2");
    expect(lines).toContain("LOCATION:Gemeindehaus\\, Saal 2\\, Hamburg");
    expect(lines).toContain("URL:https://bleibe.example/veranstaltungen/ev1");
    expect(lines).toContain("LAST-MODIFIED:20260901T080000Z");
    const description = lines.find((l) => l.startsWith("DESCRIPTION:"));
    expect(description).toBe(
      "DESCRIPTION:Wir lesen gemeinsam und beten. Bring etwas zu essen mit.\\n\\nhttps://bleibe.example/veranstaltungen/ev1",
    );
    for (const physical of ics.split("\r\n")) expect(Buffer.byteLength(physical, "utf8")).toBeLessThanOrEqual(75);
  });

  it("defaults the end to two hours after the start", () => {
    const lines = unfold(buildIcs({ ...event, endsAt: null }, { now }));
    expect(lines).toContain("DTEND:20261009T193000Z");
    expect(lines).toContain("UID:ev1@bleibe");
  });

  it("writes LOCATION:Online and the link only when provided", () => {
    const withLink = unfold(
      buildIcs({ ...event, isOnline: true, onlineUrl: "https://meet.example.org/x", location: null }, { now }),
    );
    expect(withLink).toContain("LOCATION:Online");
    expect(withLink).toContain("URL:https://meet.example.org/x");
    const withoutLink = unfold(buildIcs({ ...event, isOnline: true, onlineUrl: null, location: null }, { now }));
    expect(withoutLink.some((l) => l.startsWith("URL:"))).toBe(false);
  });
});
