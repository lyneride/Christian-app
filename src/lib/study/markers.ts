import type { CSSProperties } from "react";

/**
 * Marker colours ("Markerfarben"): every user has a palette of colours with an
 * optional meaning ("Verheißungen", "Gebet" …). A colour is stored as hue +
 * strength; the actual light- and dark-mode shades are computed here so every
 * colour stays readable behind text in both themes.
 *
 * `Highlight.color` stores the marker's `key`. The five original colours keep
 * their old keys (yellow, green, …) so existing highlights stay valid.
 */

export interface MarkerColor {
  key: string;
  /** meaning, may be empty */
  name: string;
  /** OKLCH hue 0–359 */
  hue: number;
  /** 1 (zart) … 5 (kräftig) */
  strength: number;
}

export interface Marker extends MarkerColor {
  /** meaning, or the colour's name when no meaning is set */
  label: string;
  /** colour name derived from the hue ("Gelb", "Blau" …) */
  colorName: string;
  light: string;
  dark: string;
}

export const MAX_MARKERS = 12;
export const MAX_MARKER_NAME = 30;
export const MIN_STRENGTH = 1;
export const MAX_STRENGTH = 5;
export const STRENGTH_LABELS = ["Ganz zart", "Zart", "Mittel", "Kräftig", "Sehr kräftig"] as const;

/** Keys: lowercase letters/digits, starting with a letter. */
export const MARKER_KEY_PATTERN = /^[a-z][a-z0-9]{1,23}$/;

export function isMarkerKey(value: unknown): value is string {
  return typeof value === "string" && MARKER_KEY_PATTERN.test(value);
}

/** The palette everyone starts with – a common colour-coding scheme for Bible study. */
export const DEFAULT_MARKERS: readonly MarkerColor[] = [
  { key: "yellow", name: "Gott & sein Wesen", hue: 99, strength: 2 },
  { key: "green", name: "Wachstum & Nachfolge", hue: 155, strength: 2 },
  { key: "blue", name: "Verheißungen", hue: 256, strength: 2 },
  { key: "pink", name: "Liebe & Beziehungen", hue: 355, strength: 2 },
  { key: "orange", name: "Sünde & Warnung", hue: 62, strength: 2 },
  { key: "purple", name: "Gebet", hue: 305, strength: 2 },
];

export const DEFAULT_MARKER_KEYS: readonly string[] = DEFAULT_MARKERS.map((m) => m.key);

/** Hues offered as one-tap presets in the colour editor. */
export const HUE_PRESETS = [25, 62, 99, 125, 155, 190, 225, 256, 285, 305, 330, 355] as const;

// ---------------------------------------------------------------------------
// Colour maths (OKLCH → sRGB hex, chroma reduced until the colour fits sRGB)
// ---------------------------------------------------------------------------

function clampInt(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(n)));
}

function oklchToLinearRgb(l: number, c: number, h: number): [number, number, number] {
  const rad = (h * Math.PI) / 180;
  const a = c * Math.cos(rad);
  const b = c * Math.sin(rad);
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;
  const L = l_ ** 3;
  const M = m_ ** 3;
  const S = s_ ** 3;
  return [
    4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S,
    -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S,
    -0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S,
  ];
}

function inGamut(rgb: [number, number, number]) {
  return rgb.every((v) => v >= -0.0005 && v <= 1.0005);
}

function toHex(rgb: [number, number, number]) {
  return `#${rgb
    .map((v) => {
      const x = Math.min(1, Math.max(0, v));
      const s = x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055;
      return clampInt(s * 255, 0, 255).toString(16).padStart(2, "0");
    })
    .join("")}`;
}

/** OKLCH colour as sRGB hex; chroma is reduced until it is displayable. */
export function oklchHex(l: number, c: number, h: number): string {
  let chroma = c;
  let rgb = oklchToLinearRgb(l, chroma, h);
  for (let i = 0; i < 24 && !inGamut(rgb); i++) {
    chroma *= 0.9;
    rgb = oklchToLinearRgb(l, chroma, h);
  }
  return toHex(rgb);
}

// Lightness and chroma per strength: light backgrounds behind dark text, dark ones behind light text.
const LIGHT = [
  [0.958, 0.045],
  [0.93, 0.075],
  [0.9, 0.105],
  [0.865, 0.135],
  [0.83, 0.165],
] as const;
const DARK = [
  [0.31, 0.05],
  [0.36, 0.075],
  [0.405, 0.095],
  [0.45, 0.11],
  [0.495, 0.125],
] as const;

export function normalizeHue(hue: number): number {
  return ((Math.round(hue) % 360) + 360) % 360;
}

export function normalizeStrength(strength: number): number {
  return clampInt(strength, MIN_STRENGTH, MAX_STRENGTH);
}

export function markerShades(hue: number, strength: number): { light: string; dark: string } {
  const h = normalizeHue(hue);
  const s = normalizeStrength(strength) - 1;
  return { light: oklchHex(LIGHT[s][0], LIGHT[s][1], h), dark: oklchHex(DARK[s][0], DARK[s][1], h) };
}

/** German name of a hue, used when a colour has no meaning. */
export function hueName(hue: number): string {
  const h = normalizeHue(hue);
  if (h < 20) return "Rosa";
  if (h < 45) return "Rot";
  if (h < 78) return "Orange";
  if (h < 112) return "Gelb";
  if (h < 135) return "Hellgrün";
  if (h < 172) return "Grün";
  if (h < 210) return "Türkis";
  if (h < 240) return "Hellblau";
  if (h < 272) return "Blau";
  if (h < 318) return "Lila";
  if (h < 345) return "Pink";
  return "Rosa";
}

export function toMarker(c: MarkerColor): Marker {
  const name = c.name.trim();
  const colorName = hueName(c.hue);
  return { ...c, name, label: name || colorName, colorName, ...markerShades(c.hue, c.strength) };
}

export const DEFAULT_PALETTE: readonly Marker[] = DEFAULT_MARKERS.map(toMarker);

/**
 * Marker for a stored highlight colour. Unknown keys (an old or deleted
 * colour) fall back to the default with that key, else to the first colour.
 */
export function resolveMarker(palette: readonly Marker[], key: string | null | undefined): Marker {
  return (
    palette.find((m) => m.key === key) ??
    DEFAULT_PALETTE.find((m) => m.key === key) ??
    palette[0] ??
    DEFAULT_PALETTE[0]
  );
}

/** Classes that paint an element in a marker colour (set the variables with `markerStyle`). */
export const MARKER_BG = "bg-(--hl) dark:bg-(--hl-d)";

export function markerStyle(m: Pick<Marker, "light" | "dark">): CSSProperties {
  return { "--hl": m.light, "--hl-d": m.dark } as CSSProperties;
}

/** Fresh key for a new colour. */
export function newMarkerKey(): string {
  return `c${Math.random().toString(36).slice(2, 10).padEnd(8, "0")}`;
}

/** A hue not yet (or least) used in the palette, for "Neue Farbe". */
export function freeHue(palette: readonly MarkerColor[]): number {
  let best: number = HUE_PRESETS[0];
  let bestDistance = -1;
  for (const h of HUE_PRESETS) {
    const d = Math.min(
      ...palette.map((m) => {
        const diff = Math.abs(normalizeHue(m.hue) - h);
        return Math.min(diff, 360 - diff);
      }),
      360,
    );
    if (d > bestDistance) {
      best = h;
      bestDistance = d;
    }
  }
  return best;
}
