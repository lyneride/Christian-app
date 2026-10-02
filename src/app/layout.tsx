import type { Metadata, Viewport } from "next";
import { Inter, Lora } from "next/font/google";
import { ThemeScript } from "@/components/theme/theme-script";
import { RegisterServiceWorker } from "@/components/pwa/register-sw";
import "./globals.css";

const sans = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-sans", display: "swap" });
const serif = Lora({ subsets: ["latin", "latin-ext"], variable: "--font-serif", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Bleibe – Bibel. Gebet. Gemeinschaft.", template: "%s · Bleibe" },
  description:
    "Bleibe ist ein werbefreier Ort für Christen: Bibel lesen und verstehen, füreinander beten, Gemeinschaft finden und in Gottes Gegenwart bleiben.",
  applicationName: "Bleibe",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Bleibe", statusBarStyle: "default" },
  openGraph: { type: "website", siteName: "Bleibe", locale: "de_DE" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf7f2" },
    { media: "(prefers-color-scheme: dark)", color: "#12161d" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" className={`${sans.variable} ${serif.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-full flex-col">
        {children}
        <RegisterServiceWorker />
      </body>
    </html>
  );
}
