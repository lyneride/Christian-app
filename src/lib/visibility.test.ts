import { describe, expect, it } from "vitest";
import { canView, visibilityWhere } from "./visibility";

const user = { id: "u1", role: "USER" as const };
const mod = { id: "m1", role: "MODERATOR" as const };

describe("canView", () => {
  it("public content is visible to everyone", () => {
    expect(canView({ visibility: "PUBLIC" }, null)).toBe(true);
  });
  it("members-only content requires a viewer", () => {
    expect(canView({ visibility: "MEMBERS" }, null)).toBe(false);
    expect(canView({ visibility: "MEMBERS" }, user)).toBe(true);
  });
  it("group content requires membership, author or moderator", () => {
    expect(canView({ visibility: "GROUP", groupId: "g" }, user)).toBe(false);
    expect(canView({ visibility: "GROUP", groupId: "g" }, user, true)).toBe(true);
    expect(canView({ visibility: "GROUP", groupId: "g", authorId: "u1" }, user)).toBe(true);
    expect(canView({ visibility: "GROUP", groupId: "g" }, mod)).toBe(true);
  });
  it("private content only for the owner", () => {
    expect(canView({ visibility: "PRIVATE", authorId: "u1" }, user)).toBe(true);
    expect(canView({ visibility: "PRIVATE", authorId: "u2" }, user)).toBe(false);
  });
});

describe("visibilityWhere", () => {
  it("guests only see public", () => {
    expect(visibilityWhere(null)).toEqual({ visibility: "PUBLIC" });
  });
  it("moderators see everything", () => {
    expect(visibilityWhere(mod)).toEqual({});
  });
  it("members see public, members, own and their groups", () => {
    const where = visibilityWhere(user, ["g1"]);
    expect(where).toHaveProperty("OR");
  });
});
