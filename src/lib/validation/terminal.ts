import { z } from "zod";
import { emailSchema } from "./auth";
import { planIdSchema } from "./plans";

/**
 * Validation for the Bleibe-Terminal API (the native iPhone app that keeps a
 * local copy of the reading plans and syncs when it is online). Pure module.
 */

export const terminalLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(200),
  /** Free-text device label shown in the session list, e.g. "iPhone 8". */
  device: z.string().trim().max(60).optional(),
});
export type TerminalLoginInput = z.infer<typeof terminalLoginSchema>;

/** Client-generated id of a queued change (UUID); makes retries idempotent on the client side. */
const changeIdSchema = z.string().min(8).max(64).regex(/^[A-Za-z0-9-]+$/);

/** When the change happened on the device (ISO 8601, with "Z" or an offset). */
const changeTimeSchema = z.iso.datetime({ offset: true });

export const planDayChangeSchema = z.object({
  id: changeIdSchema,
  type: z.literal("planDay"),
  planId: planIdSchema,
  day: z.number().int().min(1).max(2000),
  done: z.boolean(),
  at: changeTimeSchema,
});

export const chapterChangeSchema = z.object({
  id: changeIdSchema,
  type: z.literal("chapter"),
  book: z.number().int().min(1).max(66),
  chapter: z.number().int().min(1).max(150),
  translation: z.string().min(2).max(16),
  at: changeTimeSchema,
});

export const terminalChangeSchema = z.discriminatedUnion("type", [planDayChangeSchema, chapterChangeSchema]);
export type TerminalChange = z.infer<typeof terminalChangeSchema>;

/** Envelope of a sync request; the single changes are validated one by one so a bad entry never blocks the rest. */
export const terminalSyncSchema = z.object({
  changes: z.array(z.unknown()).max(500).default([]),
});
