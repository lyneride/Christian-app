import { z } from "zod";

/** Validation and labels for content reports (shared moderation module). */

export const REPORT_TARGET_TYPES = ["post", "comment", "prayer", "user", "group", "event", "message"] as const;
export type ReportTargetType = (typeof REPORT_TARGET_TYPES)[number];

export const REPORT_TARGET_LABELS: Record<ReportTargetType, string> = {
  post: "Beitrag",
  comment: "Kommentar",
  prayer: "Gebetsanliegen",
  user: "Profil",
  group: "Gruppe",
  event: "Veranstaltung",
  message: "Nachricht",
};

export const REPORT_REASONS = ["spam", "beleidigung", "falschlehre", "persoenliche-daten", "anderes"] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  spam: "Spam oder Werbung",
  beleidigung: "Beleidigung oder Hass",
  falschlehre: "Irreführende Lehre",
  "persoenliche-daten": "Persönliche Daten anderer",
  anderes: "Etwas anderes",
};

export const REPORT_THANKS = "Danke, wir schauen uns das an.";

export const createReportSchema = z.object({
  targetType: z.enum(REPORT_TARGET_TYPES, { error: "Unbekannter Inhaltstyp." }),
  targetId: z.string().trim().min(1, "Unbekannter Inhalt.").max(64),
  reason: z.enum(REPORT_REASONS, { error: "Bitte einen Grund wählen." }),
  details: z.string().trim().max(1000, "Höchstens 1000 Zeichen.").optional().default(""),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
