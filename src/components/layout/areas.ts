/**
 * The five areas of Bleibe. Every page belongs to exactly one area; the bottom tab bar (phone),
 * the side navigation (computer), the area tabs and the tours all read from this list.
 * Client-safe: icons are referenced by name.
 */
export type AreaKey = "heute" | "bibel" | "gebet" | "gemeinschaft" | "ich";
export type AreaIcon = "sun" | "book" | "heart" | "users" | "user";

export interface AreaTab {
  href: string;
  label: string;
}

export interface Area {
  key: AreaKey;
  label: string;
  icon: AreaIcon;
  /** Where the tab leads; `guestHref` for visitors without an account. */
  href: string;
  guestHref?: string;
  /** Path prefixes that belong to this area (first match wins, checked in list order). */
  match: string[];
  /** Short line under the area name (tours, side navigation). */
  purpose: string;
  /** Tabs shown at the top of the area's main pages. */
  tabs?: AreaTab[];
}

export const AREAS: readonly Area[] = [
  {
    key: "heute",
    label: "Heute",
    icon: "sun",
    href: "/start",
    guestHref: "/",
    match: ["/start"],
    purpose: "Dein Tag auf einen Blick",
  },
  {
    key: "bibel",
    label: "Bibel",
    icon: "book",
    href: "/bibel",
    match: ["/bibel", "/leseplaene", "/merken", "/meine-bibel"],
    purpose: "Lesen, verstehen, merken",
    tabs: [
      { href: "/bibel", label: "Lesen" },
      { href: "/leseplaene", label: "Pläne" },
      { href: "/merken", label: "Merkverse" },
      { href: "/meine-bibel", label: "Notizen" },
    ],
  },
  {
    key: "gebet",
    label: "Gebet",
    icon: "heart",
    href: "/gebet",
    match: ["/gebet"],
    purpose: "Füreinander beten",
  },
  {
    key: "gemeinschaft",
    label: "Gemeinschaft",
    icon: "users",
    href: "/gemeinschaft",
    match: ["/gemeinschaft", "/gruppen", "/veranstaltungen", "/zeugnisse"],
    purpose: "Menschen, die mitgehen",
    tabs: [
      { href: "/gemeinschaft", label: "Beiträge" },
      { href: "/gruppen", label: "Gruppen" },
      { href: "/veranstaltungen", label: "Treffen" },
      { href: "/zeugnisse", label: "Zeugnisse" },
    ],
  },
  {
    key: "ich",
    label: "Ich",
    icon: "user",
    href: "/ich",
    guestHref: "/anmelden",
    match: ["/ich", "/freunde", "/nachrichten", "/tagebuch", "/benachrichtigungen", "/einstellungen", "/profil", "/@", "/admin"],
    purpose: "Alles Persönliche",
  },
];

function matches(pathname: string, prefix: string): boolean {
  if (prefix === "/@") return pathname.startsWith("/@");
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/** The area a path belongs to, or null (landing page, static pages, auth). */
export function areaForPath(pathname: string): Area | null {
  for (const area of AREAS) {
    if (area.match.some((p) => matches(pathname, p))) return area;
  }
  return null;
}

export function areaHref(area: Area, signedIn: boolean): string {
  return !signedIn && area.guestHref ? area.guestHref : area.href;
}

/** Tailwind classes per area (kept literal so Tailwind sees them). */
export const AREA_STYLE: Record<AreaKey, { text: string; bg: string; soft: string; ring: string }> = {
  heute: { text: "text-area-heute", bg: "bg-area-heute", soft: "bg-area-heute-soft", ring: "ring-area-heute" },
  bibel: { text: "text-area-bibel", bg: "bg-area-bibel", soft: "bg-area-bibel-soft", ring: "ring-area-bibel" },
  gebet: { text: "text-area-gebet", bg: "bg-area-gebet", soft: "bg-area-gebet-soft", ring: "ring-area-gebet" },
  gemeinschaft: { text: "text-area-gemeinschaft", bg: "bg-area-gemeinschaft", soft: "bg-area-gemeinschaft-soft", ring: "ring-area-gemeinschaft" },
  ich: { text: "text-area-ich", bg: "bg-area-ich", soft: "bg-area-ich-soft", ring: "ring-area-ich" },
};
