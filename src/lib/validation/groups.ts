import { z } from "zod";

/**
 * Validation, labels and filter helpers for groups ("Gruppen"). Pure module
 * usable from server actions, client forms and unit tests.
 */

export const GROUP_KINDS = ["ONLINE", "LOCAL"] as const;
export type GroupKindValue = (typeof GROUP_KINDS)[number];

export const GROUP_KIND_LABELS: Record<GroupKindValue, { label: string; description: string }> = {
  ONLINE: { label: "Online", description: "Ihr trefft euch digital – von überall aus." },
  LOCAL: { label: "Vor Ort", description: "Ihr trefft euch persönlich in eurer Stadt." },
};

/** Groups are either open (PUBLIC) or need approval (PRIVATE); MEMBERS/GROUP make no sense here. */
export const GROUP_VISIBILITIES = ["PUBLIC", "PRIVATE"] as const;
export type GroupVisibility = (typeof GROUP_VISIBILITIES)[number];

export const GROUP_VISIBILITY_LABELS: Record<GroupVisibility, { label: string; description: string }> = {
  PUBLIC: { label: "Offen", description: "Jedes Mitglied kann sofort beitreten. Beiträge sind für Gruppenmitglieder sichtbar." },
  PRIVATE: {
    label: "Geschlossen",
    description: "Beitritt nur nach Zustimmung der Leitung. Inhalte sehen nur Mitglieder.",
  },
};

export const GROUP_ROLES = ["OWNER", "ADMIN", "MEMBER"] as const;
export type GroupRoleValue = (typeof GROUP_ROLES)[number];

export const GROUP_ROLE_LABELS: Record<GroupRoleValue, string> = {
  OWNER: "Leitung",
  ADMIN: "Mitleitung",
  MEMBER: "Mitglied",
};

export const MEMBERSHIP_STATUS_LABELS = {
  ACTIVE: "Mitglied",
  PENDING: "Anfrage offen",
  BANNED: "Gesperrt",
} as const;

/** `?art=` filter on /gruppen. */
export const GROUP_FILTERS = ["alle", "online", "vor-ort"] as const;
export type GroupFilter = (typeof GROUP_FILTERS)[number];

export const GROUP_FILTER_LABELS: Record<GroupFilter, string> = {
  alle: "Alle",
  online: "Online",
  "vor-ort": "Vor Ort",
};

export function parseGroupFilter(value: string | string[] | undefined): GroupFilter {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw && (GROUP_FILTERS as readonly string[]).includes(raw) ? (raw as GroupFilter) : "alle";
}

export function filterToKind(filter: GroupFilter): GroupKindValue | undefined {
  if (filter === "online") return "ONLINE";
  if (filter === "vor-ort") return "LOCAL";
  return undefined;
}

/** Trims free-text filters (`?stadt=`, `?q=`) and caps their length. */
export function parseTextFilter(value: string | string[] | undefined, max = 80): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return (raw ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

export const groupNameSchema = z
  .string()
  .trim()
  .min(3, "Der Name braucht mindestens 3 Zeichen.")
  .max(60, "Der Name darf höchstens 60 Zeichen lang sein.");

export const groupDescriptionSchema = z
  .string()
  .trim()
  .min(10, "Beschreibe die Gruppe mit mindestens 10 Zeichen.")
  .max(2000, "Die Beschreibung darf höchstens 2000 Zeichen lang sein.");

export const groupSchema = z
  .object({
    name: groupNameSchema,
    description: groupDescriptionSchema,
    kind: z.enum(GROUP_KINDS, { error: "Bitte wähle, ob ihr euch online oder vor Ort trefft." }),
    city: z.string().trim().max(80, "Der Ortsname darf höchstens 80 Zeichen lang sein.").optional().default(""),
    visibility: z.enum(GROUP_VISIBILITIES, { error: "Bitte wähle, wie man der Gruppe beitreten kann." }),
    imageUrl: z.string().trim().max(500, "Die Bild-Adresse ist zu lang.").optional().default(""),
  })
  .superRefine((data, ctx) => {
    if (data.kind === "LOCAL" && !data.city) {
      ctx.addIssue({ code: "custom", path: ["city"], message: "Für eine Gruppe vor Ort brauchen wir die Stadt." });
    } else if (data.city && data.city.length < 2) {
      ctx.addIssue({ code: "custom", path: ["city"], message: "Der Ortsname braucht mindestens 2 Zeichen." });
    }
    if (data.imageUrl && !z.url({ protocol: /^https$/ }).safeParse(data.imageUrl).success) {
      ctx.addIssue({ code: "custom", path: ["imageUrl"], message: "Bitte eine vollständige https-Adresse angeben." });
    }
  })
  .transform((data) => ({
    name: data.name,
    description: data.description,
    kind: data.kind,
    city: data.city || null,
    visibility: data.visibility,
    imageUrl: data.imageUrl || null,
  }));

export type GroupInput = z.infer<typeof groupSchema>;

export const groupIdSchema = z.string().trim().min(1).max(64);
export const userIdSchema = z.string().trim().min(1).max(64);

export const changeRoleSchema = z.object({
  groupId: groupIdSchema,
  userId: userIdSchema,
  role: z.enum(GROUP_ROLES, { error: "Unbekannte Rolle." }),
});

/** Slug for a new group: slugified name, or a fallback when nothing survives. */
export function groupSlugBase(name: string, slugify: (s: string) => string): string {
  return slugify(name) || "gruppe";
}
