/** Main navigation (client-safe: icons are referenced by name). */
export type NavIcon = "bible" | "prayer" | "community" | "plans" | "events";

export interface NavItem {
  href: string;
  label: string;
  icon: NavIcon;
}

export const MAIN_NAV: readonly NavItem[] = [
  { href: "/bibel", label: "Bibel", icon: "bible" },
  { href: "/gebet", label: "Gebet", icon: "prayer" },
  { href: "/gemeinschaft", label: "Gemeinschaft", icon: "community" },
  { href: "/leseplaene", label: "Lesepläne", icon: "plans" },
  { href: "/veranstaltungen", label: "Treffen", icon: "events" },
];
