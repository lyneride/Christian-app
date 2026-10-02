import { headers } from "next/headers";

/**
 * Small in-memory sliding-window rate limiter. Good enough for a single
 * Node process (SQLite deployment); swap for Redis when scaling out.
 *
 * Each key keeps the timestamps of its recent hits. A hit is allowed when
 * fewer than `limit` hits happened in the last `windowMs` milliseconds.
 */

export interface RateLimitOptions {
  /** Maximum number of hits inside the window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
  /** Injectable clock (tests). Defaults to Date.now(). */
  now?: number;
}

export interface RateLimitResult {
  ok: boolean;
  /** Hits still available in the current window (0 when blocked). */
  remaining: number;
  /** Milliseconds until the next hit would be accepted (0 when ok). */
  retryAfterMs: number;
}

/** Sweep idle keys at most this often, to keep the map from growing forever. */
const SWEEP_INTERVAL_MS = 60_000;

type Store = { hits: Map<string, number[]>; lastSweep: number };

// Kept on globalThis so the store survives HMR reloads in development.
const globalStore = globalThis as unknown as { __bleibeRateLimit?: Store };
const store: Store = globalStore.__bleibeRateLimit ?? { hits: new Map(), lastSweep: 0 };
if (process.env.NODE_ENV !== "production") globalStore.__bleibeRateLimit = store;

function sweep(now: number, windowMs: number) {
  if (now - store.lastSweep < SWEEP_INTERVAL_MS) return;
  store.lastSweep = now;
  for (const [key, stamps] of store.hits) {
    if (stamps.length === 0 || stamps[stamps.length - 1]! + windowMs <= now) store.hits.delete(key);
  }
}

/**
 * Records a hit for `key` and tells whether it is within the limit.
 * A blocked call does not count as a hit, so a client that keeps retrying
 * is not locked out for longer than `windowMs` after its last allowed hit.
 */
export function rateLimit(key: string, { limit, windowMs, now = Date.now() }: RateLimitOptions): RateLimitResult {
  if (limit <= 0) return { ok: false, remaining: 0, retryAfterMs: windowMs };
  sweep(now, windowMs);

  const cutoff = now - windowMs;
  const recent = (store.hits.get(key) ?? []).filter((t) => t > cutoff);

  if (recent.length >= limit) {
    store.hits.set(key, recent);
    const oldest = recent[0]!;
    return { ok: false, remaining: 0, retryAfterMs: Math.max(1, oldest + windowMs - now) };
  }

  recent.push(now);
  store.hits.set(key, recent);
  return { ok: true, remaining: limit - recent.length, retryAfterMs: 0 };
}

/** Clears all counters (tests, admin tooling). */
export function resetRateLimits() {
  store.hits.clear();
  store.lastSweep = 0;
}

/** Human-friendly German wait hint, e.g. "in etwa 3 Minuten". */
export function formatRetryAfter(retryAfterMs: number): string {
  const minutes = Math.ceil(retryAfterMs / 60_000);
  if (minutes <= 1) return "in etwa einer Minute";
  if (minutes < 60) return `in etwa ${minutes} Minuten`;
  const hours = Math.ceil(minutes / 60);
  return hours === 1 ? "in etwa einer Stunde" : `in etwa ${hours} Stunden`;
}

/**
 * Best-effort client address for rate-limit keys. Reads the first entry of
 * `x-forwarded-for` (set by the reverse proxy); falls back to "local".
 */
export async function clientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  if (first) return first.slice(0, 64);
  const real = h.get("x-real-ip")?.trim();
  return real ? real.slice(0, 64) : "local";
}
