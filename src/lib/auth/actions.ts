"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { layoutMail, sendMail } from "@/lib/mail/send";
import { loginSchema, registerSchema, requestPasswordResetSchema, resetPasswordSchema } from "@/lib/validation/auth";
import { getCurrentUser } from "./dal";
import { hashPassword, passwordProblems, verifyPassword } from "./password";
import { clientIp, formatRetryAfter, rateLimit } from "./rate-limit";
import { createSession, destroyAllSessions, destroySession } from "./session";
import { hashToken, randomToken } from "./tokens";

/**
 * Server actions for the authentication flows. All of them use the
 * `(prevState, formData)` signature so they plug into `useActionState`.
 * Expected failures are returned as state; only bugs throw.
 */

export type AuthFormState =
  | {
      ok?: boolean;
      message?: string;
      errors?: Record<string, string[] | undefined>;
      values?: Record<string, string>;
    }
  | undefined;

const EMAIL_VERIFY_TTL_MS = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

/** Message shown for unknown e-mail or wrong password (no account enumeration). */
const LOGIN_FAILED = "E-Mail oder Passwort ist falsch.";
const RESET_REQUESTED =
  "Wenn zu dieser E-Mail-Adresse ein Konto gehört, haben wir dir gerade einen Link zum Zurücksetzen geschickt. Schau bitte auch im Spam-Ordner nach.";
const RESET_LINK_INVALID = "Dieser Link ist ungültig oder abgelaufen. Bitte fordere einen neuen an.";

/** bcrypt hash of a random string; compared against when the user does not exist, so timing is similar. */
const DUMMY_HASH = "$2b$12$e3VGoq1ztjIktTqJlcV9beWvvVZ0Phc8IFla/0eSC5jPiYVO.D94u";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Only relative paths inside the app are allowed as post-login targets. */
function safeNextPath(raw: string): string {
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\") || /[\r\n]/.test(raw) || raw.length > 512) {
    return "/start";
  }
  return raw;
}

async function userAgent(): Promise<string | null> {
  return (await headers()).get("user-agent");
}

async function createVerificationToken(userId: string, purpose: "EMAIL_VERIFY" | "PASSWORD_RESET", ttlMs: number) {
  const token = randomToken(32);
  // Older unused links of the same kind stop working; only the newest mail counts.
  await prisma.verificationToken.deleteMany({ where: { userId, purpose, usedAt: null } });
  await prisma.verificationToken.create({
    data: { userId, purpose, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + ttlMs) },
  });
  return token;
}

async function sendVerificationMail(user: { email: string; name: string }, token: string) {
  const link = `${env().APP_URL}/email-bestaetigen/${token}`;
  const name = user.name.trim() || "du";
  await sendMail({
    to: user.email,
    subject: "Bitte bestätige deine E-Mail-Adresse",
    text: [
      `Hallo ${name},`,
      "",
      "schön, dass du bei Bleibe bist. Bitte bestätige deine E-Mail-Adresse über diesen Link:",
      "",
      link,
      "",
      "Der Link ist 24 Stunden gültig. Falls du dich nicht bei Bleibe registriert hast, kannst du diese E-Mail einfach ignorieren.",
    ].join("\n"),
    html: layoutMail(
      "E-Mail-Adresse bestätigen",
      `<p>Hallo ${escapeHtml(name)},</p>
<p>schön, dass du bei Bleibe bist. Bitte bestätige deine E-Mail-Adresse:</p>
<p><a href="${link}" style="display:inline-block;background:#27416f;color:#fff;text-decoration:none;padding:10px 18px;border-radius:999px">E-Mail-Adresse bestätigen</a></p>
<p style="font-size:13px;color:#6b645b">Oder kopiere diesen Link in deinen Browser:<br><a href="${link}">${link}</a></p>
<p style="font-size:13px;color:#6b645b">Der Link ist 24 Stunden gültig. Falls du dich nicht registriert hast, kannst du diese E-Mail ignorieren.</p>`,
    ),
  });
}

async function sendPasswordResetMail(user: { email: string; name: string }, token: string) {
  const link = `${env().APP_URL}/passwort-zuruecksetzen/${token}`;
  const name = user.name.trim() || "du";
  await sendMail({
    to: user.email,
    subject: "Dein Passwort zurücksetzen",
    text: [
      `Hallo ${name},`,
      "",
      "du möchtest dein Passwort bei Bleibe zurücksetzen. Hier ist dein Link:",
      "",
      link,
      "",
      "Der Link ist eine Stunde gültig. Falls du das nicht warst, kannst du diese E-Mail ignorieren – dein Passwort bleibt unverändert.",
    ].join("\n"),
    html: layoutMail(
      "Passwort zurücksetzen",
      `<p>Hallo ${escapeHtml(name)},</p>
<p>du möchtest dein Passwort bei Bleibe zurücksetzen:</p>
<p><a href="${link}" style="display:inline-block;background:#27416f;color:#fff;text-decoration:none;padding:10px 18px;border-radius:999px">Neues Passwort festlegen</a></p>
<p style="font-size:13px;color:#6b645b">Oder kopiere diesen Link in deinen Browser:<br><a href="${link}">${link}</a></p>
<p style="font-size:13px;color:#6b645b">Der Link ist eine Stunde gültig. Falls du das nicht warst, kannst du diese E-Mail ignorieren – dein Passwort bleibt unverändert.</p>`,
    ),
  });
}

// ---------------------------------------------------------------------------
// Registrieren
// ---------------------------------------------------------------------------

export async function register(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const values = {
    name: str(formData, "name"),
    username: str(formData, "username"),
    email: str(formData, "email"),
    acceptTerms: formData.get("acceptTerms") === "on" ? "on" : "",
  };

  const limit = rateLimit(`register:${await clientIp()}`, { limit: 5, windowMs: 60 * 60 * 1000 });
  if (!limit.ok) {
    return {
      message: `Zu viele Registrierungen von diesem Anschluss. Bitte versuche es ${formatRetryAfter(limit.retryAfterMs)} noch einmal.`,
      values,
    };
  }

  const parsed = registerSchema.safeParse({
    name: values.name,
    username: values.username,
    email: values.email,
    password: str(formData, "password"),
    acceptTerms: values.acceptTerms === "on",
  });
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors, values };

  const { name, username, email, password } = parsed.data;
  const problems = passwordProblems(password);
  if (problems.length > 0) return { errors: { password: problems }, values };

  try {
    const existing = await prisma.user.findMany({
      where: { OR: [{ email }, { username }] },
      select: { email: true, username: true },
    });
    const errors: Record<string, string[]> = {};
    if (existing.some((u) => u.email === email)) {
      errors.email = [
        "Zu dieser E-Mail-Adresse gibt es schon ein Konto. Melde dich an oder setze dein Passwort zurück.",
      ];
    }
    if (existing.some((u) => u.username === username)) {
      errors.username = ["Dieser Benutzername ist leider schon vergeben."];
    }
    if (Object.keys(errors).length > 0) return { errors, values };

    const user = await prisma.user.create({
      data: { name, username, email, passwordHash: await hashPassword(password) },
      select: { id: true, email: true, name: true },
    });

    const token = await createVerificationToken(user.id, "EMAIL_VERIFY", EMAIL_VERIFY_TTL_MS);
    try {
      await sendVerificationMail(user, token);
    } catch (err) {
      // The account exists; the user can request a new link from the verification page.
      console.error("[auth] Bestätigungs-Mail konnte nicht gesendet werden:", err);
    }

    await createSession(user.id, { remember: true, userAgent: await userAgent() });
  } catch (err) {
    if ((err as { code?: string })?.code === "P2002") {
      // Unique constraint hit by a concurrent registration.
      return {
        message: "E-Mail-Adresse oder Benutzername sind gerade vergeben worden. Bitte versuche es noch einmal.",
        values,
      };
    }
    console.error("[auth] Registrierung fehlgeschlagen:", err);
    return { message: "Das hat leider nicht geklappt. Bitte versuche es später noch einmal.", values };
  }

  redirect("/start?willkommen=1");
}

// ---------------------------------------------------------------------------
// Anmelden / Abmelden
// ---------------------------------------------------------------------------

export async function login(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const remember = formData.get("remember") === "on";
  const values = { email: str(formData, "email"), remember: remember ? "on" : "" };
  const next = safeNextPath(str(formData, "next"));

  const parsed = loginSchema.safeParse({ email: values.email, password: str(formData, "password"), remember });
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors, values };

  const { email, password } = parsed.data;
  const limit = rateLimit(`login:${email}:${await clientIp()}`, { limit: 10, windowMs: 15 * 60 * 1000 });
  if (!limit.ok) {
    return {
      message: `Zu viele Anmeldeversuche. Bitte versuche es ${formatRetryAfter(limit.retryAfterMs)} noch einmal.`,
      values,
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, passwordHash: true, status: true },
    });
    const valid = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !valid) return { message: LOGIN_FAILED, values };

    if (user.status === "SUSPENDED") {
      return {
        message: "Dein Konto ist zurzeit gesperrt. Wenn du Fragen dazu hast, melde dich bitte bei uns.",
        values,
      };
    }
    if (user.status === "DELETED") {
      return { message: "Dieses Konto wurde gelöscht. Du kannst dich jederzeit neu registrieren.", values };
    }

    await createSession(user.id, { remember, userAgent: await userAgent() });
  } catch (err) {
    console.error("[auth] Anmeldung fehlgeschlagen:", err);
    return { message: "Das hat leider nicht geklappt. Bitte versuche es später noch einmal.", values };
  }

  redirect(next);
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/");
}

// ---------------------------------------------------------------------------
// Passwort vergessen / zurücksetzen
// ---------------------------------------------------------------------------

export async function requestPasswordReset(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const values = { email: str(formData, "email") };
  const parsed = requestPasswordResetSchema.safeParse({ email: values.email });
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors, values };

  const { email } = parsed.data;
  const limit = rateLimit(`reset:${email}`, { limit: 3, windowMs: 60 * 60 * 1000 });
  if (!limit.ok) {
    return {
      message: `Du hast gerade schon mehrere Links angefordert. Bitte schau in dein Postfach oder versuche es ${formatRetryAfter(limit.retryAfterMs)} noch einmal.`,
      values,
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, status: true },
    });
    if (user && user.status === "ACTIVE") {
      const token = await createVerificationToken(user.id, "PASSWORD_RESET", PASSWORD_RESET_TTL_MS);
      await sendPasswordResetMail(user, token);
    }
  } catch (err) {
    console.error("[auth] Passwort-Reset-Mail fehlgeschlagen:", err);
    return { message: "Das hat leider nicht geklappt. Bitte versuche es später noch einmal.", values };
  }

  // Same answer whether or not the address exists.
  return { ok: true, message: RESET_REQUESTED };
}

export async function resetPassword(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = resetPasswordSchema.safeParse({
    token: str(formData, "token"),
    password: str(formData, "password"),
    confirm: str(formData, "confirm"),
  });
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    if (fieldErrors.token) return { message: RESET_LINK_INVALID };
    return { errors: fieldErrors };
  }

  const { token, password } = parsed.data;
  const problems = passwordProblems(password);
  if (problems.length > 0) return { errors: { password: problems } };

  try {
    const record = await prisma.verificationToken.findUnique({
      where: { tokenHash: hashToken(token) },
      select: {
        id: true,
        purpose: true,
        expiresAt: true,
        usedAt: true,
        user: { select: { id: true, status: true, emailVerifiedAt: true } },
      },
    });
    if (!record || record.purpose !== "PASSWORD_RESET" || record.usedAt || record.expiresAt.getTime() < Date.now()) {
      return { message: RESET_LINK_INVALID };
    }
    if (record.user.status !== "ACTIVE") {
      return { message: "Dieses Konto ist nicht aktiv. Wenn du Fragen dazu hast, melde dich bitte bei uns." };
    }

    const now = new Date();
    const userId = record.user.id;
    const passwordHash = await hashPassword(password);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        // Whoever opened the link controls the mailbox, so the address counts as verified.
        data: { passwordHash, ...(record.user.emailVerifiedAt ? {} : { emailVerifiedAt: now }) },
      }),
      prisma.verificationToken.update({ where: { id: record.id }, data: { usedAt: now } }),
    ]);

    // Sign out every device, then sign this one in with the new password.
    await destroyAllSessions(userId, false);
    await createSession(userId, { remember: false, userAgent: await userAgent() });
  } catch (err) {
    console.error("[auth] Passwort zurücksetzen fehlgeschlagen:", err);
    return { message: "Das hat leider nicht geklappt. Bitte versuche es später noch einmal." };
  }

  redirect("/start?passwort=geaendert");
}

// ---------------------------------------------------------------------------
// E-Mail bestätigen
// ---------------------------------------------------------------------------

export type VerifyEmailResult =
  { ok: true; status: "verified" | "already-verified" } | { ok: false; status: "invalid" | "expired" };

/** Marks the user's e-mail address as verified when the token is valid. Safe to call from a page. */
export async function verifyEmail(token: string): Promise<VerifyEmailResult> {
  if (typeof token !== "string" || token.length < 20 || token.length > 128) return { ok: false, status: "invalid" };

  const record = await prisma.verificationToken.findUnique({
    where: { tokenHash: hashToken(token) },
    select: {
      id: true,
      purpose: true,
      expiresAt: true,
      usedAt: true,
      user: { select: { id: true, emailVerifiedAt: true } },
    },
  });
  if (!record || record.purpose !== "EMAIL_VERIFY") return { ok: false, status: "invalid" };
  if (record.usedAt)
    return record.user.emailVerifiedAt ? { ok: true, status: "already-verified" } : { ok: false, status: "invalid" };
  if (record.expiresAt.getTime() < Date.now()) return { ok: false, status: "expired" };

  const now = new Date();
  await prisma.$transaction([
    prisma.verificationToken.update({ where: { id: record.id }, data: { usedAt: now } }),
    ...(record.user.emailVerifiedAt
      ? []
      : [prisma.user.update({ where: { id: record.user.id }, data: { emailVerifiedAt: now } })]),
  ]);
  return { ok: true, status: record.user.emailVerifiedAt ? "already-verified" : "verified" };
}

/** Sends a fresh verification link to the signed-in user. */
export async function resendVerification(): Promise<AuthFormState> {
  const user = await getCurrentUser();
  if (!user) return { message: "Bitte melde dich an, um einen neuen Bestätigungslink anzufordern." };
  if (user.emailVerifiedAt) return { ok: true, message: "Deine E-Mail-Adresse ist bereits bestätigt." };

  const limit = rateLimit(`verify:${user.email}`, { limit: 3, windowMs: 60 * 60 * 1000 });
  if (!limit.ok) {
    return {
      message: `Wir haben dir gerade erst einen Link geschickt. Bitte schau in dein Postfach oder versuche es ${formatRetryAfter(limit.retryAfterMs)} noch einmal.`,
    };
  }

  try {
    const token = await createVerificationToken(user.id, "EMAIL_VERIFY", EMAIL_VERIFY_TTL_MS);
    await sendVerificationMail(user, token);
  } catch (err) {
    console.error("[auth] Bestätigungs-Mail konnte nicht gesendet werden:", err);
    return { message: "Die E-Mail konnte nicht gesendet werden. Bitte versuche es später noch einmal." };
  }
  return { ok: true, message: `Wir haben dir einen neuen Bestätigungslink an ${user.email} geschickt.` };
}
