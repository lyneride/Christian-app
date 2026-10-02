import { describe, expect, it } from "vitest";
import { canActOn, canChangeRole, canManageGroup, compareMembers, isOwner, membershipLabel } from "./roles";

const owner = { role: "OWNER", status: "ACTIVE" } as const;
const admin = { role: "ADMIN", status: "ACTIVE" } as const;
const member = { role: "MEMBER", status: "ACTIVE" } as const;
const pending = { role: "MEMBER", status: "PENDING" } as const;
const banned = { role: "MEMBER", status: "BANNED" } as const;

describe("group roles", () => {
  it("only active owners and admins manage a group", () => {
    expect(canManageGroup(owner)).toBe(true);
    expect(canManageGroup(admin)).toBe(true);
    expect(canManageGroup(member)).toBe(false);
    expect(canManageGroup({ role: "OWNER", status: "BANNED" })).toBe(false);
    expect(canManageGroup(null)).toBe(false);
    expect(isOwner(owner)).toBe(true);
    expect(isOwner(admin)).toBe(false);
  });

  it("admins act on members only, the owner on everyone but owners", () => {
    expect(canActOn(admin, member)).toBe(true);
    expect(canActOn(admin, pending)).toBe(true);
    expect(canActOn(admin, admin)).toBe(false);
    expect(canActOn(admin, owner)).toBe(false);
    expect(canActOn(owner, admin)).toBe(true);
    expect(canActOn(owner, owner)).toBe(false);
    expect(canActOn(member, member)).toBe(false);
  });

  it("only the owner changes roles of active non-owners", () => {
    expect(canChangeRole(owner, member)).toBe(true);
    expect(canChangeRole(owner, admin)).toBe(true);
    expect(canChangeRole(owner, pending)).toBe(false);
    expect(canChangeRole(owner, owner)).toBe(false);
    expect(canChangeRole(admin, member)).toBe(false);
  });

  it("sorts leadership first, then by join date", () => {
    const d = (n: number) => new Date(2024, 0, n);
    const list = [
      { role: "MEMBER", joinedAt: d(1) },
      { role: "OWNER", joinedAt: d(5) },
      { role: "ADMIN", joinedAt: d(3) },
      { role: "MEMBER", joinedAt: d(2) },
    ] as const;
    expect([...list].sort(compareMembers).map((m) => `${m.role}${m.joinedAt.getDate()}`)).toEqual([
      "OWNER5",
      "ADMIN3",
      "MEMBER1",
      "MEMBER2",
    ]);
  });

  it("describes the membership status", () => {
    expect(membershipLabel(null)).toBeNull();
    expect(membershipLabel(pending)).toBe("Anfrage gesendet");
    expect(membershipLabel(banned)).toBe("Kein Zugang");
    expect(membershipLabel(owner)).toBe("Du leitest die Gruppe");
    expect(membershipLabel(member)).toBe("Du bist dabei");
  });
});
