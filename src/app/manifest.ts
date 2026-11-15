import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bleibe – Bibel. Gebet. Gemeinschaft.",
    short_name: "Bleibe",
    description: "Werbefreier Ort für Christen: Bibel lesen, füreinander beten, Gemeinschaft finden.",
    start_url: "/start",
    display: "standalone",
    background_color: "#fff8ee",
    theme_color: "#6c47f5",
    lang: "de",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
