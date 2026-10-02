import { z } from "zod";

/**
 * Validation for the reading plans ("Lesepläne"). Pure module: used by the
 * server actions and unit tests. Inputs arrive as strings (form data or
 * client arguments) and are never trusted.
 */

export const planIdSchema = z.cuid({ error: "Diesen Plan gibt es nicht." });

/** Day number within a plan: 1 … 2000 (the longest built-in plan has 730 days). */
export const planDaySchema = z.preprocess(
  (v) => (typeof v === "string" && /^\d{1,4}$/.test(v.trim()) ? Number(v.trim()) : v),
  z
    .number({ error: "Ungültiger Tag." })
    .int({ error: "Ungültiger Tag." })
    .min(1, { error: "Ungültiger Tag." })
    .max(2000, { error: "Ungültiger Tag." }),
);

/** "true" / "false" (or a real boolean) → boolean. */
export const doneSchema = z.preprocess(
  (v) => (v === "true" ? true : v === "false" ? false : v),
  z.boolean({ error: "Ungültiger Wert." }),
);

export const planActionSchema = z.object({ planId: planIdSchema });
export type PlanActionInput = z.infer<typeof planActionSchema>;

export const markDaySchema = z.object({
  planId: planIdSchema,
  day: planDaySchema,
  done: doneSchema,
});
export type MarkDayInput = z.infer<typeof markDaySchema>;
