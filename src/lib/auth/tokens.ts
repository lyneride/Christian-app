import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

/** Random URL-safe token (default 32 bytes → 43 chars). */
export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

/** SHA-256 hex digest; tokens are stored hashed so a DB leak does not leak sessions. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/** 6-digit numeric code for e-mail verification (zero-padded). */
export function numericCode(digits = 6): string {
  const max = 10 ** digits;
  const n = randomBytes(4).readUInt32BE(0) % max;
  return n.toString().padStart(digits, "0");
}
