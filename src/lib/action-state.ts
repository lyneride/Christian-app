import { z } from "zod";

/**
 * Shared return type for server actions used with `useActionState`.
 * Expected failures are returned (never thrown) so forms can show them.
 */
export interface ActionState {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string[] | undefined>;
  /** Echo of submitted values to re-fill the form after a validation error */
  values?: Record<string, string>;
  /** Optional payload (e.g. created id) */
  data?: Record<string, unknown>;
}

export const initialActionState: ActionState = {};

export function fieldErrors(error: z.ZodError): Record<string, string[] | undefined> {
  return z.flattenError(error).fieldErrors as Record<string, string[] | undefined>;
}

/** Converts FormData into a plain object of strings (first value per key) and keeps multi-values as arrays when `multi` lists them. */
export function formValues(formData: FormData, multi: string[] = []): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value !== "string") continue;
    if (multi.includes(key)) {
      const prev = out[key];
      out[key] = Array.isArray(prev) ? [...prev, value] : prev ? [prev, value] : [value];
    } else if (!(key in out)) {
      out[key] = value;
    }
  }
  return out;
}

export function stringValues(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of formData.entries()) if (typeof value === "string" && !(key in out)) out[key] = value;
  return out;
}

export function failure(message: string, extra: Partial<ActionState> = {}): ActionState {
  return { ok: false, message, ...extra };
}

export function success(message?: string, extra: Partial<ActionState> = {}): ActionState {
  return { ok: true, message, ...extra };
}

/** Only allow relative in-app redirect targets. */
export function safeNext(next: string | null | undefined, fallback = "/start"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return fallback;
  return next;
}
