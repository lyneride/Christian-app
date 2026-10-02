import { beforeEach, describe, expect, it, vi } from "vitest";

// `clientIp()` reads request headers; outside a request we hand it a controllable stub.
const headerStore = { values: new Map<string, string>() };
vi.mock("next/headers", () => ({
  headers: async () => ({ get: (name: string) => headerStore.values.get(name.toLowerCase()) ?? null }),
}));

import { clientIp, formatRetryAfter, rateLimit, resetRateLimits } from "./rate-limit";

const MINUTE = 60_000;

describe("rateLimit", () => {
  beforeEach(() => resetRateLimits());

  it("allows up to `limit` hits inside the window and counts down `remaining`", () => {
    const opts = { limit: 3, windowMs: 15 * MINUTE, now: 1_000_000 };
    expect(rateLimit("k", opts)).toEqual({ ok: true, remaining: 2, retryAfterMs: 0 });
    expect(rateLimit("k", opts)).toEqual({ ok: true, remaining: 1, retryAfterMs: 0 });
    expect(rateLimit("k", opts)).toEqual({ ok: true, remaining: 0, retryAfterMs: 0 });
  });

  it("blocks the hit after the limit and reports when to retry", () => {
    const base = 1_000_000;
    rateLimit("k", { limit: 2, windowMs: 10 * MINUTE, now: base });
    rateLimit("k", { limit: 2, windowMs: 10 * MINUTE, now: base + MINUTE });

    const blocked = rateLimit("k", { limit: 2, windowMs: 10 * MINUTE, now: base + 2 * MINUTE });
    expect(blocked.ok).toBe(false);
    expect(blocked.remaining).toBe(0);
    // the oldest hit (at `base`) leaves the window at base + 10 min
    expect(blocked.retryAfterMs).toBe(8 * MINUTE);
  });

  it("does not count blocked attempts, so the lockout does not extend itself", () => {
    const base = 0;
    const opts = { limit: 1, windowMs: 5 * MINUTE };
    expect(rateLimit("k", { ...opts, now: base }).ok).toBe(true);
    expect(rateLimit("k", { ...opts, now: base + MINUTE }).ok).toBe(false);
    expect(rateLimit("k", { ...opts, now: base + 4 * MINUTE }).ok).toBe(false);
    // 5 minutes after the only allowed hit the key is free again, regardless of the retries in between
    expect(rateLimit("k", { ...opts, now: base + 5 * MINUTE + 1 }).ok).toBe(true);
  });

  it("slides the window instead of resetting it", () => {
    const opts = { limit: 2, windowMs: 10 * MINUTE };
    rateLimit("k", { ...opts, now: 0 });
    rateLimit("k", { ...opts, now: 6 * MINUTE });
    expect(rateLimit("k", { ...opts, now: 9 * MINUTE }).ok).toBe(false);
    // first hit expired, second (at 6 min) still inside the window: one slot free
    const r = rateLimit("k", { ...opts, now: 11 * MINUTE });
    expect(r.ok).toBe(true);
    expect(r.remaining).toBe(0);
    expect(rateLimit("k", { ...opts, now: 12 * MINUTE }).ok).toBe(false);
  });

  it("keeps keys independent", () => {
    const opts = { limit: 1, windowMs: MINUTE, now: 0 };
    expect(rateLimit("login:a@example.org:1.2.3.4", opts).ok).toBe(true);
    expect(rateLimit("login:a@example.org:1.2.3.4", opts).ok).toBe(false);
    expect(rateLimit("login:b@example.org:1.2.3.4", opts).ok).toBe(true);
    expect(rateLimit("login:a@example.org:5.6.7.8", opts).ok).toBe(true);
  });

  it("treats a non-positive limit as always blocked", () => {
    const r = rateLimit("k", { limit: 0, windowMs: MINUTE, now: 0 });
    expect(r.ok).toBe(false);
    expect(r.retryAfterMs).toBe(MINUTE);
  });

  it("resetRateLimits clears every counter", () => {
    const opts = { limit: 1, windowMs: MINUTE, now: 0 };
    rateLimit("k", opts);
    expect(rateLimit("k", opts).ok).toBe(false);
    resetRateLimits();
    expect(rateLimit("k", opts).ok).toBe(true);
  });

  it("defaults `now` to the wall clock", () => {
    const r = rateLimit("clock", { limit: 1, windowMs: MINUTE });
    expect(r.ok).toBe(true);
    const blocked = rateLimit("clock", { limit: 1, windowMs: MINUTE });
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);
    expect(blocked.retryAfterMs).toBeLessThanOrEqual(MINUTE);
  });
});

describe("formatRetryAfter", () => {
  it("rounds up to friendly German durations", () => {
    expect(formatRetryAfter(1)).toBe("in etwa einer Minute");
    expect(formatRetryAfter(MINUTE)).toBe("in etwa einer Minute");
    expect(formatRetryAfter(MINUTE + 1)).toBe("in etwa 2 Minuten");
    expect(formatRetryAfter(14.2 * MINUTE)).toBe("in etwa 15 Minuten");
    expect(formatRetryAfter(60 * MINUTE)).toBe("in etwa einer Stunde");
    expect(formatRetryAfter(61 * MINUTE)).toBe("in etwa 2 Stunden");
  });
});

describe("clientIp", () => {
  beforeEach(() => headerStore.values.clear());

  it("uses the first x-forwarded-for entry", async () => {
    headerStore.values.set("x-forwarded-for", " 203.0.113.9 , 10.0.0.1");
    expect(await clientIp()).toBe("203.0.113.9");
  });

  it("falls back to x-real-ip, then to 'local'", async () => {
    headerStore.values.set("x-real-ip", "198.51.100.4");
    expect(await clientIp()).toBe("198.51.100.4");
    headerStore.values.clear();
    expect(await clientIp()).toBe("local");
  });
});
