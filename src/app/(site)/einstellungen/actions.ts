"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { type ActionState, failure, fieldErrors, success } from "@/lib/action-state";
import { getCurrentUser } from "@/lib/auth/dal";
import { hashPassword, passwordProblems, verifyPassword } from "@/lib/auth/password";
import { formatRetryAfter, rateLimit } from "@/lib/auth/rate-limit";
import { destroyAllSessions, destroySession, readSession, revokeSession } from "@/lib/auth/session";
import { hashToken, randomToken } from "@/lib/auth/tokens";
import { listTranslations } from "@/lib/bible/data";
import { prisma } from "@/lib/db";
import {
  changeEmailSchema,
  changePasswordSchema,
  deleteAccountSchema,
  notificationSettingsSchema,
  profileSchema,
} from "@/lib/validation/profile";
import { anonymiseUser } from "./konto/anonymise";
import { sendEmailChangeMail } from "./konto/email-change-mail";

/**
 * Server actions of the settings area. All use the `(prevState, formData)`
 * signature for `useActionState`; expected failures come back as state.
 */

const NOT_SIGNED_IN = "Bitte melde dich an, um deine Einstellungen zu ändern.";
const GENERIC_ERROR = "Das hat leider nicht geklappt. Bitte versuche es später noch einmal.";
const WRONG_PASSWORD = "Das aktuelle Passwort ist nicht richtig.";
const EMAIL_CHANGE_TTL_MS = 24 * 60 * 60 * 1000;

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}

async function passwordMatches(userId: string, password: string): Promise<boolean> {
  const row = await prisma.user.findUnique({ where: { id: userId }, select: { passwordHash: true } });
  return verifyPassword(password, row?.passwordHash ?? "");
}

// ---------------------------------------------------------------------------
// Profil
// ---------------------------------------------------------------------------

export async function updateProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return failure(NOT_SIGNED_IN);

  const values = {
    name: str(formData, "name"),
    username: str(formData, "username"),
    bio: str(formData, "bio"),
    location: str(formData, "location"),
    church: str(formData, "church"),
    profileVisibility: str(formData, "profileVisibility"),
    openForPartner: formData.get("openForPartner") === "on" ? "on" : "",
    preferredTranslation: str(formData, "preferredTranslation"),
  };
  const parsed = profileSchema.safeParse({ ...values, openForPartner: values.openForPartner === "on" });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), values };
  const data = parsed.data;

  const translations = await listTranslations();
  if (!translations.some((t) => t.id === data.preferredTranslation)) {
    return { ok: false, errors: { preferredTranslation: ["Bitte eine gültige Übersetzung wählen."] }, values };
  }

  try {
    if (data.username !== user.username) {
      const taken = await prisma.user.findUnique({ where: { username: data.username }, select: { id: true } });
      if (taken && taken.id !== user.id) {
        return { ok: false, errors: { username: ["Dieser Benutzername ist leider schon vergeben."] }, values };
      }
    }
    await prisma.user.update({ where: { id: user.id }, data });
  } catch (err) {
    if ((err as { code?: string })?.code === "P2002") {
      return { ok: false, errors: { username: ["Dieser Benutzername ist gerade vergeben worden."] }, values };
    }
    console.error("[einstellungen] Profil speichern fehlgeschlagen:", err);
    return failure(GENERIC_ERROR, { values });
  }

  revalidatePath("/einstellungen/profil");
  revalidatePath(`/profil/${user.username}`);
  if (data.username !== user.username) revalidatePath(`/profil/${data.username}`);
  return success("Dein Profil wurde gespeichert.", { values: { ...values, username: data.username } });
}

// ---------------------------------------------------------------------------
// Konto: E-Mail, Passwort, Benachrichtigungen, Löschen
// ---------------------------------------------------------------------------

export async function requestEmailChange(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return failure(NOT_SIGNED_IN);

  const values = { newEmail: str(formData, "newEmail") };
  const parsed = changeEmailSchema.safeParse({ newEmail: values.newEmail, currentPassword: str(formData, "currentPassword") });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), values };
  const { newEmail, currentPassword } = parsed.data;
  if (newEmail === user.email) {
    return { ok: false, errors: { newEmail: ["Das ist schon deine aktuelle E-Mail-Adresse."] }, values };
  }

  const limit = rateLimit(`email-change:${user.id}`, { limit: 3, windowMs: 60 * 60 * 1000 });
  if (!limit.ok) {
    return failure(
      `Du hast gerade schon mehrere Links angefordert. Bitte schau in dein Postfach oder versuche es ${formatRetryAfter(limit.retryAfterMs)} noch einmal.`,
      { values },
    );
  }

  try {
    if (!(await passwordMatches(user.id, currentPassword))) {
      return { ok: false, errors: { currentPassword: [WRONG_PASSWORD] }, values };
    }
    const taken = await prisma.user.findUnique({ where: { email: newEmail }, select: { id: true } });
    if (taken) return { ok: false, errors: { newEmail: ["Zu dieser E-Mail-Adresse gibt es schon ein Konto."] }, values };

    const token = randomToken(32);
    // Only the newest link counts.
    await prisma.verificationToken.deleteMany({ where: { userId: user.id, purpose: "EMAIL_CHANGE", usedAt: null } });
    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        purpose: "EMAIL_CHANGE",
        newEmail,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + EMAIL_CHANGE_TTL_MS),
      },
    });
    await sendEmailChangeMail({ to: newEmail, name: user.name }, token);
  } catch (err) {
    console.error("[einstellungen] E-Mail-Änderung fehlgeschlagen:", err);
    return failure(GENERIC_ERROR, { values });
  }

  return success(
    `Wir haben einen Bestätigungslink an ${newEmail} geschickt. Deine Adresse wird geändert, sobald du ihn öffnest. Der Link ist 24 Stunden gültig.`,
  );
}

export async function changePassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return failure(NOT_SIGNED_IN);

  const parsed = changePasswordSchema.safeParse({
    currentPassword: str(formData, "currentPassword"),
    password: str(formData, "password"),
    confirm: str(formData, "confirm"),
  });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const { currentPassword, password } = parsed.data;
  const problems = passwordProblems(password);
  if (problems.length > 0) return { ok: false, errors: { password: problems } };

  const limit = rateLimit(`password-change:${user.id}`, { limit: 5, windowMs: 15 * 60 * 1000 });
  if (!limit.ok) {
    return failure(`Zu viele Versuche. Bitte versuche es ${formatRetryAfter(limit.retryAfterMs)} noch einmal.`);
  }

  try {
    if (!(await passwordMatches(user.id, currentPassword))) {
      return { ok: false, errors: { currentPassword: [WRONG_PASSWORD] } };
    }
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(password) } });
    // Other devices have to sign in again with the new password; this one stays signed in.
    await destroyAllSessions(user.id, true);
  } catch (err) {
    console.error("[einstellungen] Passwort ändern fehlgeschlagen:", err);
    return failure(GENERIC_ERROR);
  }

  revalidatePath("/einstellungen/sitzungen");
  return success("Dein Passwort wurde geändert. Auf allen anderen Geräten wurdest du abgemeldet.");
}

export async function updateNotifications(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return failure(NOT_SIGNED_IN);

  const parsed = notificationSettingsSchema.safeParse({ notifyByEmail: formData.get("notifyByEmail") === "on" });
  if (!parsed.success) return failure(GENERIC_ERROR);

  try {
    await prisma.user.update({ where: { id: user.id }, data: parsed.data });
  } catch (err) {
    console.error("[einstellungen] Benachrichtigungen speichern fehlgeschlagen:", err);
    return failure(GENERIC_ERROR);
  }

  revalidatePath("/einstellungen/konto");
  return success(
    parsed.data.notifyByEmail
      ? "Du bekommst wieder E-Mails, wenn etwas Wichtiges passiert."
      : "Du bekommst keine E-Mail-Benachrichtigungen mehr.",
  );
}

export async function deleteAccount(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return failure(NOT_SIGNED_IN);

  const parsed = deleteAccountSchema.safeParse({
    confirmation: str(formData, "confirmation"),
    password: str(formData, "password"),
  });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };

  const limit = rateLimit(`delete-account:${user.id}`, { limit: 5, windowMs: 15 * 60 * 1000 });
  if (!limit.ok) {
    return failure(`Zu viele Versuche. Bitte versuche es ${formatRetryAfter(limit.retryAfterMs)} noch einmal.`);
  }

  try {
    if (!(await passwordMatches(user.id, parsed.data.password))) {
      return { ok: false, errors: { password: [WRONG_PASSWORD] } };
    }
    await anonymiseUser(user.id);
    await destroySession();
  } catch (err) {
    console.error("[einstellungen] Konto löschen fehlgeschlagen:", err);
    return failure(GENERIC_ERROR);
  }

  redirect("/?nachricht=konto-geloescht");
}

// ---------------------------------------------------------------------------
// Sitzungen
// ---------------------------------------------------------------------------

export async function endSession(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return failure(NOT_SIGNED_IN);

  const sessionId = str(formData, "sessionId");
  if (!sessionId) return failure("Diese Sitzung gibt es nicht mehr.");

  const current = await readSession();
  const isCurrent = current?.sessionId === sessionId;
  try {
    if (isCurrent) {
      await destroySession();
    } else {
      await revokeSession(user.id, sessionId);
    }
  } catch (err) {
    console.error("[einstellungen] Sitzung beenden fehlgeschlagen:", err);
    return failure(GENERIC_ERROR);
  }

  if (isCurrent) redirect("/anmelden?nachricht=abgemeldet");
  revalidatePath("/einstellungen/sitzungen");
  return success("Die Sitzung wurde beendet.");
}

export async function endOtherSessions(): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return failure(NOT_SIGNED_IN);

  try {
    await destroyAllSessions(user.id, true);
  } catch (err) {
    console.error("[einstellungen] Sitzungen beenden fehlgeschlagen:", err);
    return failure(GENERIC_ERROR);
  }

  revalidatePath("/einstellungen/sitzungen");
  return success("Alle anderen Sitzungen wurden beendet.");
}
