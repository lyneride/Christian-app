import { describe, expect, it } from "vitest";
import { generateInviteCode, INVITE_CODE_LENGTH, invitePath, isInviteCode, parseInviteCode } from "./invite-code";

describe("invite codes", () => {
  it("generates codes in the expected format", () => {
    for (let i = 0; i < 50; i++) {
      const code = generateInviteCode();
      expect(code).toHaveLength(INVITE_CODE_LENGTH);
      expect(isInviteCode(code)).toBe(true);
    }
  });

  it("never uses look-alike characters", () => {
    const all = Array.from({ length: 200 }, () => generateInviteCode()).join("");
    expect(all).not.toMatch(/[0o1li]/);
  });

  it("retries instead of biasing on high bytes", () => {
    let call = 0;
    const code = generateInviteCode((b) => {
      call++;
      b.fill(call === 1 ? 255 : 0);
      return b;
    });
    expect(call).toBe(2);
    expect(code).toBe("a".repeat(INVITE_CODE_LENGTH));
  });

  it("parses user input", () => {
    expect(parseInviteCode("  ABCDEFGHJK ")).toBe("abcdefghjk");
    expect(parseInviteCode("abc")).toBeNull();
    expect(parseInviteCode("abcdefghj0")).toBeNull();
    expect(parseInviteCode(42)).toBeNull();
  });

  it("builds the public path", () => {
    expect(invitePath("abcdefghjk")).toBe("/einladung/abcdefghjk");
  });
});
