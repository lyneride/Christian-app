/**
 * Invite codes for "Freunde einladen". Pure module (no server imports) so the
 * format checks can be unit-tested and used on both sides.
 */

/** Lower-case letters and digits without look-alikes (no 0/o, 1/l/i). */
export const INVITE_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
export const INVITE_CODE_LENGTH = 10;

const CODE_RE = new RegExp(`^[${INVITE_ALPHABET}]{${INVITE_CODE_LENGTH}}$`);

export function isInviteCode(value: unknown): value is string {
  return typeof value === "string" && CODE_RE.test(value);
}

/** Normalises user input (trims, lower-cases); returns null when it is not a valid code. */
export function parseInviteCode(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const code = value.trim().toLowerCase();
  return isInviteCode(code) ? code : null;
}

/** A fresh random code from `INVITE_ALPHABET` using the Web Crypto API. */
export function generateInviteCode(random: (bytes: Uint8Array) => Uint8Array = (b) => crypto.getRandomValues(b)): string {
  const bytes = random(new Uint8Array(INVITE_CODE_LENGTH));
  let code = "";
  // 248 = 8 * 31: drop bytes above the largest multiple of the alphabet size to avoid bias.
  for (const byte of bytes) {
    if (byte >= 248) return generateInviteCode(random);
    code += INVITE_ALPHABET[byte % INVITE_ALPHABET.length];
  }
  return code;
}

export function invitePath(code: string): string {
  return `/einladung/${code}`;
}
