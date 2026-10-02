import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNowStrict, isToday, isYesterday } from "date-fns";
import { de } from "date-fns/locale";

/** Merge Tailwind class names safely. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** URL-safe slug from a German/English title. */
export function slugify(input: string, maxLength = 80): string {
  return input
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength)
    .replace(/-+$/g, "");
}

export function formatDate(date: Date | string, pattern = "d. MMMM yyyy"): string {
  return format(new Date(date), pattern, { locale: de });
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), "d. MMM yyyy, HH:mm", { locale: de });
}

/** "vor 3 Minuten", "gestern", "12. März" */
export function formatRelative(date: Date | string): string {
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  if (diff < 60_000) return "gerade eben";
  if (diff < 86_400_000 && isToday(d)) return `vor ${formatDistanceToNowStrict(d, { locale: de })}`;
  if (isYesterday(d)) return `gestern, ${format(d, "HH:mm")}`;
  return format(d, d.getFullYear() === new Date().getFullYear() ? "d. MMM" : "d. MMM yyyy", { locale: de });
}

export function truncate(text: string, max = 160): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return cut.slice(0, Math.max(cut.lastIndexOf(" "), max - 20)).trimEnd() + " …";
}

/** First letters of a display name for avatar fallbacks. */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

export function pluralize(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}
