import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  displayNameSchema,
  emailSchema,
  loginSchema,
  passwordSchema,
  registerSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  usernameSchema,
} from "./auth";

function fieldErrors(result: z.ZodSafeParseResult<unknown>) {
  if (result.success) throw new Error("expected a validation failure");
  return z.flattenError(result.error).fieldErrors as Record<string, string[] | undefined>;
}

const validRegistration = {
  email: "Maria@Example.org",
  password: "ein-gutes-passwort",
  name: "Maria Müller",
  username: "Maria_M",
  acceptTerms: true as const,
};

describe("emailSchema", () => {
  it("trims and lower-cases the address", () => {
    expect(emailSchema.parse("  Maria.Mueller@Example.ORG \n")).toBe("maria.mueller@example.org");
  });

  it("rejects invalid addresses with a German message", () => {
    const r = emailSchema.safeParse("maria@");
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0]?.message).toBe("Das ist keine gültige E-Mail-Adresse.");
    expect(emailSchema.safeParse("").success).toBe(false);
    expect(emailSchema.safeParse("nur text").success).toBe(false);
    expect(emailSchema.safeParse(`${"a".repeat(250)}@example.org`).success).toBe(false);
  });
});

describe("passwordSchema", () => {
  it("enforces 8 to 128 characters", () => {
    expect(passwordSchema.safeParse("1234567").success).toBe(false);
    expect(passwordSchema.safeParse("12345678").success).toBe(true);
    expect(passwordSchema.safeParse("x".repeat(128)).success).toBe(true);
    expect(passwordSchema.safeParse("x".repeat(129)).success).toBe(false);
  });
});

describe("usernameSchema", () => {
  it("allows letters, digits, dot, underscore and dash and lower-cases the result", () => {
    expect(usernameSchema.parse("  Maria_M.2-x ")).toBe("maria_m.2-x");
  });

  it("rejects other characters, umlauts and spaces", () => {
    for (const bad of ["maria m", "maria@m", "märia", "ma/ria", "<b>"]) {
      expect(usernameSchema.safeParse(bad).success, bad).toBe(false);
    }
  });

  it("enforces 3 to 30 characters", () => {
    expect(usernameSchema.safeParse("ab").success).toBe(false);
    expect(usernameSchema.safeParse("abc").success).toBe(true);
    expect(usernameSchema.safeParse("a".repeat(30)).success).toBe(true);
    expect(usernameSchema.safeParse("a".repeat(31)).success).toBe(false);
  });
});

describe("displayNameSchema", () => {
  it("trims and enforces 2 to 60 characters", () => {
    expect(displayNameSchema.parse("  Jo ")).toBe("Jo");
    expect(displayNameSchema.safeParse(" J ").success).toBe(false);
    expect(displayNameSchema.safeParse("x".repeat(61)).success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("normalises e-mail and username and keeps the rest", () => {
    const r = registerSchema.parse(validRegistration);
    expect(r).toEqual({
      email: "maria@example.org",
      password: "ein-gutes-passwort",
      name: "Maria Müller",
      username: "maria_m",
      acceptTerms: true,
    });
  });

  it("requires acceptTerms to be literally true", () => {
    const errors = fieldErrors(registerSchema.safeParse({ ...validRegistration, acceptTerms: false }));
    expect(errors.acceptTerms).toEqual(["Bitte die Nutzungsbedingungen akzeptieren."]);
    expect(
      fieldErrors(registerSchema.safeParse({ ...validRegistration, acceptTerms: "on" })).acceptTerms,
    ).toBeDefined();
    expect(
      fieldErrors(registerSchema.safeParse({ ...validRegistration, acceptTerms: undefined })).acceptTerms,
    ).toBeDefined();
  });

  it("reports every invalid field at once with German messages", () => {
    const errors = fieldErrors(
      registerSchema.safeParse({ email: "nope", password: "kurz", name: "J", username: "a b", acceptTerms: false }),
    );
    expect(errors.email).toEqual(["Das ist keine gültige E-Mail-Adresse."]);
    expect(errors.password).toEqual(["Mindestens 8 Zeichen."]);
    expect(errors.name).toEqual(["Mindestens 2 Zeichen."]);
    expect(errors.username).toEqual(["Nur Buchstaben, Zahlen, Punkt, Unterstrich und Bindestrich."]);
    expect(errors.acceptTerms).toEqual(["Bitte die Nutzungsbedingungen akzeptieren."]);
  });
});

describe("loginSchema", () => {
  it("accepts an e-mail with any non-empty password; remember is optional", () => {
    expect(loginSchema.parse({ email: " A@B.de ", password: "x" })).toEqual({ email: "a@b.de", password: "x" });
    expect(loginSchema.parse({ email: "a@b.de", password: "x", remember: true }).remember).toBe(true);
  });

  it("asks for the password when it is empty", () => {
    expect(fieldErrors(loginSchema.safeParse({ email: "a@b.de", password: "" })).password).toEqual([
      "Bitte das Passwort eingeben.",
    ]);
  });
});

describe("requestPasswordResetSchema", () => {
  it("normalises the address", () => {
    expect(requestPasswordResetSchema.parse({ email: "  A@B.de" })).toEqual({ email: "a@b.de" });
  });
});

describe("resetPasswordSchema", () => {
  const token = "x".repeat(43);

  it("accepts matching passwords", () => {
    expect(
      resetPasswordSchema.safeParse({ token, password: "neues-passwort", confirm: "neues-passwort" }).success,
    ).toBe(true);
  });

  it("puts the mismatch error on `confirm`", () => {
    const errors = fieldErrors(
      resetPasswordSchema.safeParse({ token, password: "neues-passwort", confirm: "anderes-passwort" }),
    );
    expect(errors.confirm).toEqual(["Die Passwörter stimmen nicht überein."]);
    expect(errors.password).toBeUndefined();
  });

  it("rejects short passwords and short tokens", () => {
    expect(fieldErrors(resetPasswordSchema.safeParse({ token, password: "kurz", confirm: "kurz" })).password).toEqual([
      "Mindestens 8 Zeichen.",
    ]);
    expect(
      fieldErrors(
        resetPasswordSchema.safeParse({ token: "abc", password: "neues-passwort", confirm: "neues-passwort" }),
      ).token,
    ).toBeDefined();
  });
});
