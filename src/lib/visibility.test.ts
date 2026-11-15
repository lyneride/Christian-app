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
  it("friends-only content requires friendship, author or moderator", () => {
    expect(canView({ visibility: "FRIENDS", authorId: "u2" }, null)).toBe(false);
    expect(canView({ visibility: "FRIENDS", authorId: "u2" }, user)).toBe(false);
    expect(canView({ visibility: "FRIENDS", authorId: "u2" }, user, false, true)).toBe(true);
    expect(canView({ visibility: "FRIENDS", authorId: "u1" }, user)).toBe(true);
    expect(canView({ visibility: "FRIENDS", authorId: "u2" }, mod)).toBe(true);
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
  it("members see public, members, own, their groups and their friends' content", () => {
    const where = visibilityWhere(user, ["g1"], ["u2", "u3"]);
    expect(where).toHaveProperty("OR");
    const or = (where as { OR: unknown[] }).OR;
    expect(or).toContainEqual({ visibility: "FRIENDS", authorId: { in: ["u2", "u3"] } });
    expect(or).toContainEqual({ visibility: "GROUP", groupId: { in: ["g1"] } });
    expect(or).toContainEqual({ authorId: "u1" });
  });
  it("without friends no one else's friends-only content matches", () => {
    const or = (visibilityWhere(user) as { OR: unknown[] }).OR;
    expect(or).toContainEqual({ visibility: "FRIENDS", authorId: { in: [] } });
  });
});
