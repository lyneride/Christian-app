import { z } from "zod";
import { displayNameSchema, emailSchema, passwordSchema, usernameSchema } from "./auth";

/** Visibility options a member can pick for their profile (no GROUP). */
export const PROFILE_VISIBILITIES = ["PUBLIC", "MEMBERS", "PRIVATE"] as const;
export type ProfileVisibility = (typeof PROFILE_VISIBILITIES)[number];

export const BIO_MAX = 500;
/** The word a member has to type to confirm deleting their account. */
export const DELETE_CONFIRMATION = "LÖSCHEN";

/** Trimmed text that becomes `null` when empty. */
function optionalText(max: number) {
  return z
    .string()
    .trim()
    .max(max, { error: `Höchstens ${max} Zeichen.` })
    .transform((s) => (s === "" ? null : s));
}

export const bioSchema = optionalText(BIO_MAX);

/** Optional avatar URL; only absolute https:// addresses are accepted (no uploads). */
export const avatarUrlSchema = z
  .string()
  .trim()
  .max(500, { error: "Höchstens 500 Zeichen." })
  .refine((s) => s === "" || (URL.canParse(s) && new URL(s).protocol === "https:"), {
    error: "Bitte eine vollständige Adresse angeben, die mit https:// beginnt.",
  })
  .transform((s) => (s === "" ? null : s));

export const profileSchema = z.object({
  name: displayNameSchema,
  username: usernameSchema,
  bio: bioSchema,
  location: optionalText(80),
  church: optionalText(120),
  avatarUrl: avatarUrlSchema,
  profileVisibility: z.enum(PROFILE_VISIBILITIES, { error: "Bitte eine gültige Sichtbarkeit wählen." }),
  openForPartner: z.boolean(),
  preferredTranslation: z
    .string()
    .trim()
    .min(1, { error: "Bitte eine Übersetzung wählen." })
    .max(20, { error: "Bitte eine gültige Übersetzung wählen." })
    .transform((s) => s.toUpperCase()),
});

const currentPasswordSchema = z.string().min(1, { error: "Bitte dein aktuelles Passwort eingeben." });

export const changeEmailSchema = z.object({
  newEmail: emailSchema,
  currentPassword: currentPasswordSchema,
});

export const changePasswordSchema = z
  .object({
    currentPassword: currentPasswordSchema,
    password: passwordSchema,
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { error: "Die Passwörter stimmen nicht überein.", path: ["confirm"] })
  .refine((d) => d.password !== d.currentPassword, {
    error: "Das neue Passwort sollte sich vom bisherigen unterscheiden.",
    path: ["password"],
  });

export const notificationSettingsSchema = z.object({
  notifyByEmail: z.boolean(),
});

export const deleteAccountSchema = z.object({
  confirmation: z
    .string()
    .trim()
    .refine((s) => s === DELETE_CONFIRMATION, {
      error: `Bitte „${DELETE_CONFIRMATION}“ eingeben, um das Löschen zu bestätigen.`,
    }),
  password: currentPasswordSchema,
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type ChangeEmailInput = z.infer<typeof changeEmailSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
