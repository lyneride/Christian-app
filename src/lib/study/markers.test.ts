import { describe, expect, it } from "vitest";
import {
  DEFAULT_MARKERS,
  DEFAULT_PALETTE,
  freeHue,
  hueName,
  isMarkerKey,
  markerShades,
  newMarkerKey,
  oklchHex,
  resolveMarker,
  toMarker,
} from "./markers";

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const contrast = (a: string, b: string) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

describe("markers", () => {
  it("keeps the old colour keys and has meanings by default", () => {
    expect(DEFAULT_MARKERS.map((m) => m.key)).toEqual(["yellow", "green", "blue", "pink", "orange", "purple"]);
    for (const m of DEFAULT_MARKERS) {
      expect(isMarkerKey(m.key)).toBe(true);
      expect(m.name.length).toBeGreaterThan(0);
    }
  });

  it("computes valid hex colours", () => {
    expect(oklchHex(1, 0, 0)).toBe("#ffffff");
    expect(oklchHex(0, 0, 0)).toBe("#000000");
    for (let h = 0; h < 360; h += 15) {
      for (let s = 1; s <= 5; s++) {
        const { light, dark } = markerShades(h, s);
        expect(light).toMatch(/^#[0-9a-f]{6}$/);
        expect(dark).toMatch(/^#[0-9a-f]{6}$/);
      }
    }
  });

  it("stays readable behind text in light and dark mode at every strength", () => {
    for (let h = 0; h < 360; h += 15) {
      for (let s = 1; s <= 5; s++) {
        const { light, dark } = markerShades(h, s);
        expect(contrast(light, "#2b2340")).toBeGreaterThan(7);
        expect(contrast(dark, "#f4effa")).toBeGreaterThan(4.5);
      }
    }
  });

  it("names hues and uses the name when there is no meaning", () => {
    expect(hueName(99)).toBe("Gelb");
    expect(hueName(256)).toBe("Blau");
    expect(hueName(-104)).toBe("Blau");
    const m = toMarker({ key: "cabc", name: "  ", hue: 155, strength: 3 });
    expect(m.label).toBe("Grün");
    expect(toMarker({ key: "cabc", name: " Weisheit ", hue: 155, strength: 3 }).label).toBe("Weisheit");
  });

  it("resolves unknown keys to a fallback", () => {
    const own = [toMarker({ key: "cxyz", name: "Eigene", hue: 10, strength: 2 })];
    expect(resolveMarker(own, "cxyz").name).toBe("Eigene");
    expect(resolveMarker(own, "blue").key).toBe("blue");
    expect(resolveMarker(own, "unbekannt").key).toBe("cxyz");
    expect(resolveMarker([], null).key).toBe(DEFAULT_PALETTE[0].key);
  });

  it("creates fresh keys and picks an unused hue", () => {
    const key = newMarkerKey();
    expect(isMarkerKey(key)).toBe(true);
    expect(key).not.toBe(newMarkerKey());
    const hue = freeHue(DEFAULT_MARKERS);
    for (const m of DEFAULT_MARKERS) expect(Math.min(Math.abs(m.hue - hue), 360 - Math.abs(m.hue - hue))).toBeGreaterThanOrEqual(20);
  });
});
