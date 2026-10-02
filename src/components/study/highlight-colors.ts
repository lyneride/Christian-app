import { HIGHLIGHT_COLOR_VALUES, type HighlightColor } from "@/lib/validation/study";

export interface HighlightColorInfo {
  value: HighlightColor;
  label: string;
  /** background class for marked verses, e.g. "bg-highlight-yellow" */
  className: string;
}

/** Highlight colours in display order with their Tailwind classes (tokens from globals.css). */
export const HIGHLIGHT_COLORS: Record<HighlightColor, HighlightColorInfo> = {
  yellow: { value: "yellow", label: "Gelb", className: "bg-highlight-yellow" },
  green: { value: "green", label: "Grün", className: "bg-highlight-green" },
  blue: { value: "blue", label: "Blau", className: "bg-highlight-blue" },
  pink: { value: "pink", label: "Rosa", className: "bg-highlight-pink" },
  orange: { value: "orange", label: "Orange", className: "bg-highlight-orange" },
};

export const HIGHLIGHT_COLOR_LIST: readonly HighlightColorInfo[] = HIGHLIGHT_COLOR_VALUES.map(
  (c) => HIGHLIGHT_COLORS[c],
);

/** Class for a verse background; unknown colours fall back to yellow. */
export function highlightClass(color: string | null | undefined): string {
  return HIGHLIGHT_COLORS[(color ?? "yellow") as HighlightColor]?.className ?? HIGHLIGHT_COLORS.yellow.className;
}
