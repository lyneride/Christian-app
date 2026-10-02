import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Bitte eine E-Mail-Adresse eingeben.")
  .max(254)
  .email("Das ist keine gültige E-Mail-Adresse.");

export const passwordSchema = z.string().min(8, "Mindestens 8 Zeichen.").max(128, "Höchstens 128 Zeichen.");

export const usernameSchema = z
  .string()
  .trim()
  .min(3, "Mindestens 3 Zeichen.")
  .max(30, "Höchstens 30 Zeichen.")
  .regex(/^[a-z0-9_.-]+$/i, "Nur Buchstaben, Zahlen, Punkt, Unterstrich und Bindestrich.")
  .transform((s) => s.toLowerCase());

export const displayNameSchema = z.string().trim().min(2, "Mindestens 2 Zeichen.").max(60, "Höchstens 60 Zeichen.");

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: displayNameSchema,
  username: usernameSchema,
  acceptTerms: z.literal(true, { error: "Bitte die Nutzungsbedingungen akzeptieren." }),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Bitte das Passwort eingeben."),
  remember: z.boolean().optional(),
});

export const requestPasswordResetSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z
  .object({
    token: z.string().min(10),
    password: passwordSchema,
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: "Die Passwörter stimmen nicht überein.", path: ["confirm"] });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
