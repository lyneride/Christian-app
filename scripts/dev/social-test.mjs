// Exercises friends + shared reading plans on a running dev server.
import { chromium } from "@playwright/test";
const base = process.env.BASE_URL || "http://localhost:3000";
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
async function login(email) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: "de-DE" });
  const page = await ctx.newPage();
  await page.goto(base + "/anmelden");
  await page.getByLabel("E-Mail-Adresse").fill(email);
  await page.getByLabel("Passwort", { exact: true }).fill("demo-passwort-123");
  await page.getByRole("button", { name: "Anmelden" }).click();
  await page.waitForURL(/\/start/);
  return page;
}
const mara = await login("mara@bleibe.local");
await mara.goto(base + "/@jonas");
await mara.getByRole("button", { name: "Als Freund hinzufügen" }).click();
await mara.waitForTimeout(1500);
console.log("mara sent:", await mara.getByRole("button", { name: /Anfrage gesendet/ }).count());
const jonas = await login("jonas@bleibe.local");
await jonas.goto(base + "/freunde");
await jonas.getByRole("button", { name: "Annehmen" }).first().click();
await jonas.waitForTimeout(1500);
console.log("jonas friends:", await jonas.locator("text=Deine Freunde (1)").count());
await mara.goto(base + "/leseplaene/gemeinsam/neu?plan=johannes-in-21-tagen");
await mara.getByRole("checkbox", { name: /Jonas/ }).check();
await mara.getByRole("button", { name: "Gemeinsam starten" }).click();
await mara.waitForURL(/\/leseplaene\/gemeinsam\/(?!neu)[a-z0-9]+$/);
const url = mara.url();
console.log("shared plan:", url.replace(base, ""));
await jonas.goto(url);
await jonas.waitForTimeout(800);
console.log("jonas sees:", (await jonas.locator("main").innerText()).slice(0, 400).replace(/\n+/g, " | "));
await jonas.getByRole("button", { name: "Einladung annehmen" }).click();
await jonas.waitForTimeout(1500);
await jonas.reload();
console.log("members shown:", await jonas.locator("text=Wer liest mit (2)").count());
await jonas.screenshot({ path: process.argv[2] });
await browser.close();
