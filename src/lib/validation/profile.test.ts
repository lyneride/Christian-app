import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  avatarUrlSchema,
  bioSchema,
  changeEmailSchema,
  changePasswordSchema,
  deleteAccountSchema,
  notificationSettingsSchema,
  profileSchema,
} from "./profile";

function fieldErrors(result: z.ZodSafeParseResult<unknown>) {
  if (result.success) throw new Error("expected a validation failure");
  return z.flattenError(result.error).fieldErrors as Record<string, string[] | undefined>;
}

const validProfile = {
  name: " Maria Müller ",
  username: "Maria_M",
  bio: "",
  location: "  ",
  church: "FeG Musterstadt",
  avatarUrl: "",
  profileVisibility: "MEMBERS",
  openForPartner: true,
  preferredTranslation: "lut1912",
};

describe("profileSchema", () => {
  it("normalises the fields and turns empty optional text into null", () => {
    expect(profileSchema.parse(validProfile)).toEqual({
      name: "Maria Müller",
      username: "maria_m",
      bio: null,
      location: null,
      church: "FeG Musterstadt",
      avatarUrl: null,
      profileVisibility: "MEMBERS",
      openForPartner: true,
      preferredTranslation: "LUT1912",
    });
  });

  it("rejects GROUP as a profile visibility", () => {
    expect(fieldErrors(profileSchema.safeParse({ ...validProfile, profileVisibility: "GROUP" })).profileVisibility).toEqual([
      "Bitte eine gültige Sichtbarkeit wählen.",
    ]);
  });

  it("reports every invalid field at once with German messages", () => {
    const errors = fieldErrors(
      profileSchema.safeParse({
        ...validProfile,
        name: "J",
        username: "a b",
        bio: "x".repeat(501),
        location: "x".repeat(81),
        avatarUrl: "http://example.org/bild.png",
        preferredTranslation: "",
      }),
    );
    expect(errors.name).toEqual(["Mindestens 2 Zeichen."]);
    expect(errors.username).toEqual(["Nur Buchstaben, Zahlen, Punkt, Unterstrich und Bindestrich."]);
    expect(errors.bio).toEqual(["Höchstens 500 Zeichen."]);
    expect(errors.location).toEqual(["Höchstens 80 Zeichen."]);
    expect(errors.avatarUrl).toEqual(["Bitte eine vollständige Adresse angeben, die mit https:// beginnt."]);
    expect(errors.preferredTranslation).toEqual(["Bitte eine Übersetzung wählen."]);
  });
});

describe("bioSchema", () => {
  it("allows up to 500 characters and keeps markdown as text", () => {
    expect(bioSchema.parse("**Hallo** Joh 3,16")).toBe("**Hallo** Joh 3,16");
    expect(bioSchema.safeParse("x".repeat(500)).success).toBe(true);
    expect(bioSchema.safeParse("x".repeat(501)).success).toBe(false);
  });
});

describe("avatarUrlSchema", () => {
  it("accepts https URLs and the empty string", () => {
    expect(avatarUrlSchema.parse(" https://example.org/me.jpg ")).toBe("https://example.org/me.jpg");
    expect(avatarUrlSchema.parse("")).toBeNull();
  });

  it("rejects http, relative paths and junk", () => {
    for (const bad of ["http://example.org/a.png", "/bilder/a.png", "javascript:alert(1)", "nur text"]) {
      expect(avatarUrlSchema.safeParse(bad).success, bad).toBe(false);
    }
  });
});

describe("changeEmailSchema", () => {
  it("normalises the address and requires the current password", () => {
    expect(changeEmailSchema.parse({ newEmail: " Neu@Example.org ", currentPassword: "pw" })).toEqual({
      newEmail: "neu@example.org",
      currentPassword: "pw",
    });
    expect(fieldErrors(changeEmailSchema.safeParse({ newEmail: "neu@example.org", currentPassword: "" })).currentPassword).toEqual([
      "Bitte dein aktuelles Passwort eingeben.",
    ]);
  });
});

describe("changePasswordSchema", () => {
  it("accepts a new, confirmed password", () => {
    expect(
      changePasswordSchema.safeParse({ currentPassword: "altes-passwort", password: "neues-passwort", confirm: "neues-passwort" })
        .success,
    ).toBe(true);
  });

  it("puts the mismatch on `confirm` and the unchanged-password error on `password`", () => {
    expect(
      fieldErrors(changePasswordSchema.safeParse({ currentPassword: "alt", password: "neues-passwort", confirm: "anders" })).confirm,
    ).toEqual(["Die Passwörter stimmen nicht überein."]);
    expect(
      fieldErrors(
        changePasswordSchema.safeParse({ currentPassword: "gleiches-passwort", password: "gleiches-passwort", confirm: "gleiches-passwort" }),
      ).password,
    ).toEqual(["Das neue Passwort sollte sich vom bisherigen unterscheiden."]);
  });

  it("rejects short passwords", () => {
    expect(fieldErrors(changePasswordSchema.safeParse({ currentPassword: "alt", password: "kurz", confirm: "kurz" })).password).toEqual([
      "Mindestens 8 Zeichen.",
    ]);
  });
});

describe("notificationSettingsSchema", () => {
  it("expects a boolean", () => {
    expect(notificationSettingsSchema.parse({ notifyByEmail: false })).toEqual({ notifyByEmail: false });
    expect(notificationSettingsSchema.safeParse({ notifyByEmail: "on" }).success).toBe(false);
  });
});

describe("deleteAccountSchema", () => {
  it("requires the exact confirmation word (trimmed) and a password", () => {
    expect(deleteAccountSchema.safeParse({ confirmation: " LÖSCHEN ", password: "pw" }).success).toBe(true);
    expect(fieldErrors(deleteAccountSchema.safeParse({ confirmation: "löschen", password: "pw" })).confirmation).toEqual([
      "Bitte „LÖSCHEN“ eingeben, um das Löschen zu bestätigen.",
    ]);
    expect(fieldErrors(deleteAccountSchema.safeParse({ confirmation: "LÖSCHEN", password: "" })).password).toBeDefined();
  });
});
