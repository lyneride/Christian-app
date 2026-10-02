// Logs in as the demo user and screenshots signed-in pages. Usage: node scripts/dev/login-shots.mjs <outDir> [paths...]
import { chromium } from "@playwright/test";
const [,, out, ...paths] = process.argv;
const base = process.env.BASE_URL || "http://localhost:3000";
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, locale: "de-DE" });
await page.goto(base + "/anmelden");
await page.getByLabel("E-Mail-Adresse").fill(process.env.LOGIN_EMAIL || "mara@bleibe.local");
await page.getByLabel("Passwort", { exact: true }).fill(process.env.LOGIN_PASSWORD || "demo-passwort-123");
await page.getByRole("button", { name: "Anmelden" }).click();
await page.waitForURL(/\/start/);
for (const p of paths) {
  const res = await page.goto(base + p, { waitUntil: "networkidle" });
  const name = p.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "") || "root";
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: process.env.FULL === "1" });
  console.log(res?.status(), p);
}
await browser.close();
