// Exercises the plan builder, group plans box, "who read today" and day posts on a running server.
import { chromium } from "@playwright/test";
const base = process.env.BASE_URL || "http://localhost:3000";
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
async function login(email, password = "demo-passwort-123") {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 }, locale: "de-DE" });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.log("PAGEERROR", email, e.message));
  await page.goto(base + "/anmelden");
  await page.getByLabel("E-Mail-Adresse").fill(email);
  await page.getByLabel("Passwort", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Anmelden" }).click();
  await page.waitForURL(/\/start/);
  return page;
}
const mara = await login("mara@bleibe.local");
// nav tab
await mara.goto(base + "/gruppen");
console.log("nav Gruppen:", await mara.getByRole("navigation", { name: "Hauptnavigation" }).getByRole("link", { name: "Gruppen" }).count());
// group page box
await mara.goto(base + "/gruppen/bibel-lesen-siegen");
await mara.getByRole("heading", { name: "Gemeinsam lesen" }).waitFor();
console.log("group box:", await mara.getByRole("heading", { name: "Gemeinsam lesen" }).count(), "start btn:", await mara.getByRole("link", { name: "Leseplan starten" }).count());
await mara.getByRole("link", { name: "Leseplan starten" }).click();
await mara.waitForURL(/\/leseplaene\/neu\?gruppe=/);
// builder: Johannes 1-21 default, 7 days
await mara.getByLabel("Tage").fill("7");
await mara.waitForTimeout(300);
console.log("preview:", (await mara.locator("p[aria-live=polite]").innerText()).trim());
await mara.getByRole("button", { name: "Weiteren Abschnitt" }).click();
await mara.getByLabel("Buch 2").selectOption({ label: "Psalmen" });
await mara.getByLabel("Von Kapitel (2)").fill("1");
await mara.getByLabel("Bis Kapitel (2)").fill("7");
await mara.waitForTimeout(300);
console.log("preview2:", (await mara.locator("p[aria-live=polite]").innerText()).trim());
console.log("group preselected:", await mara.getByLabel("Gruppe").inputValue() !== "");
await mara.getByLabel("Name des Plans (optional)").fill("Johannes und Psalmen");
await mara.getByRole("button", { name: "Plan erstellen und gemeinsam starten" }).click();
await mara.waitForURL(/\/leseplaene\/gemeinsam\/[a-z0-9]+$/);
await mara.getByRole("heading", { name: /Was wir mitnehmen/ }).waitFor();
const url = mara.url();
console.log("shared plan:", url.replace(base, ""));
const text = await mara.locator("main:not([aria-busy='true'])").innerText();
console.log("header:", text.split("\n").slice(0, 6).join(" | "));
console.log("gelesen line:", text.match(/Gelesen:[^\n]*/)?.[0], "| posts heading:", await mara.getByRole("heading", { name: /Was wir mitnehmen/ }).count());
// mark day as read + post
await mara.getByRole("button", { name: /Tag 1: Gelesen/ }).click();
await mara.waitForTimeout(3000);
await mara.reload();
await mara.getByRole("heading", { name: /Was wir mitnehmen/ }).waitFor();
console.log("after mark:", (await mara.locator("main:not([aria-busy='true'])").innerText()).match(/Gelesen:[^\n]*/)?.[0]);
await mara.getByLabel("Was nimmst du aus dem heutigen Abschnitt mit?").fill("Joh 1,5 – das Licht scheint in der Finsternis. **Das** trägt mich heute.");
await mara.getByRole("button", { name: "Teilen" }).click();
await mara.waitForTimeout(1500);
const t2 = await mara.locator("main:not([aria-busy='true'])").innerText();
console.log("post visible:", t2.includes("das Licht scheint"), "| textarea reset:", (await mara.getByLabel("Was nimmst du aus dem heutigen Abschnitt mit?").inputValue()) === "");
// admin (group member) sees invite + post + notification
const admin = await login("admin@bleibe.local", "admin-passwort-123").catch(() => null);
if (admin) {
  await admin.goto(url);
  await admin.getByRole("button", { name: "Einladung annehmen" }).click();
  await admin.waitForTimeout(1500);
  await admin.goto(url + "?tag=2");
  await admin.getByRole("heading", { name: /Was wir mitnehmen – Tag 2/ }).waitFor();
  const t3 = await admin.locator("main:not([aria-busy='true'])").innerText();
  console.log("admin sees post:", t3.includes("das Licht scheint"), "| gelesen:", t3.match(/Gelesen:[^\n]*/)?.[0], "| offen:", t3.match(/Noch offen:[^\n]*/)?.[0]);
  await admin.goto(base + "/leseplaene");
  await admin.getByRole("link", { name: "Eigenen Plan erstellen" }).waitFor();
  console.log("eigene plaene section:", await admin.getByRole("heading", { name: "Eigene Pläne" }).count(), "| CTA:", await admin.getByRole("link", { name: "Eigenen Plan erstellen" }).count());
  await admin.goto(base + "/gruppen/bibel-lesen-siegen");
  console.log("group lists plan:", (await admin.locator("main:not([aria-busy='true'])").innerText()).includes("Johannes und Psalmen"));
  await admin.goto(url);
  await admin.screenshot({ path: process.argv[2] || "/tmp/pg54329/shared.png", fullPage: true });
}
await browser.close();
