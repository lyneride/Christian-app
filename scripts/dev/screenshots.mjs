import { chromium } from "@playwright/test";
const base = "http://localhost:3000";
const pages = [["home", "/"], ["bibel", "/bibel"], ["reader", "/bibel/john/3?v=16"], ["suche", "/bibel/suche?q=liebe"], ["anmelden", "/anmelden"], ["registrieren", "/registrieren"]];
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
for (const scheme of ["light", "dark"]) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: scheme, locale: "de-DE" });
  const page = await ctx.newPage();
  for (const [name, path] of pages) {
    await page.goto(base + path, { waitUntil: "networkidle" });
    await page.screenshot({ path: `${process.argv[2]}/${name}-${scheme}.png`, fullPage: false });
  }
  await ctx.close();
}
const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: "de-DE", isMobile: true });
const mp = await mobile.newPage();
await mp.goto(base + "/bibel/john/3?v=16", { waitUntil: "networkidle" });
await mp.screenshot({ path: `${process.argv[2]}/reader-mobile.png` });
await mp.goto(base + "/", { waitUntil: "networkidle" });
await mp.screenshot({ path: `${process.argv[2]}/home-mobile.png` });
await browser.close();
