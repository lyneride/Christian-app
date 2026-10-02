import { describe, expect, it } from "vitest";
import { canViewProfile, profileContentVisibilities, profilePath } from "./profile";

const member = { id: "u2", role: "USER" as const };
const moderator = { id: "u3", role: "MODERATOR" as const };

describe("canViewProfile", () => {
  it("shows PUBLIC profiles to everyone", () => {
    expect(canViewProfile({ id: "u1", profileVisibility: "PUBLIC" }, null)).toBe(true);
    expect(canViewProfile({ id: "u1", profileVisibility: "PUBLIC" }, member)).toBe(true);
  });

  it("shows MEMBERS profiles only to signed-in members", () => {
    expect(canViewProfile({ id: "u1", profileVisibility: "MEMBERS" }, null)).toBe(false);
    expect(canViewProfile({ id: "u1", profileVisibility: "MEMBERS" }, member)).toBe(true);
  });

  it("shows PRIVATE profiles only to the owner and moderators", () => {
    const profile = { id: "u1", profileVisibility: "PRIVATE" as const };
    expect(canViewProfile(profile, null)).toBe(false);
    expect(canViewProfile(profile, member)).toBe(false);
    expect(canViewProfile(profile, { id: "u1", role: "USER" })).toBe(true);
    expect(canViewProfile(profile, moderator)).toBe(true);
  });
});

describe("profileContentVisibilities", () => {
  it("lists only public content for guests and members content for members", () => {
    expect(profileContentVisibilities(null)).toEqual(["PUBLIC"]);
    expect(profileContentVisibilities(member)).toEqual(["PUBLIC", "MEMBERS"]);
  });
});

describe("profilePath", () => {
  it("builds the pretty profile URL", () => {
    expect(profilePath("maria")).toBe("/@maria");
  });
});
