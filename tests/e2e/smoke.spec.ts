import { expect, test } from "@playwright/test";

test.describe("öffentliche Seiten", () => {
  test("Startseite zeigt Tagesvers und Einstieg", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Bleib in seiner Nähe");
    await expect(page.getByText("Tagesvers")).toBeVisible();
    await expect(page.getByRole("link", { name: "Bibel öffnen" })).toBeVisible();
  });

  test("Bibel-Reader zeigt Johannes 3,16 und navigiert per Kapitel", async ({ page }) => {
    await page.goto("/bibel/john/3?v=16");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Johannes 3");
    await expect(page.locator("#v16")).toContainText("Also hat Gott die Welt geliebt");
    await page.goto("/bibel/joh/3");
    await expect(page).toHaveURL(/\/bibel\/john\/3/);
  });

  test("Bibelsuche findet Treffer", async ({ page }) => {
    await page.goto("/bibel/suche?q=liebe");
    await expect(page.locator("mark").first()).toBeVisible();
  });

  test("geschützte Seite leitet zur Anmeldung", async ({ page }) => {
    await page.goto("/einstellungen");
    await expect(page).toHaveURL(/\/anmelden\?next=/);
  });
});

test.describe("Konto", () => {
  const stamp = Date.now().toString(36);
  const email = `e2e-${stamp}@example.org`;
  const password = "sicheres-passwort-42";

  test("Registrierung, Abmeldung und Anmeldung", async ({ page }) => {
    await page.goto("/registrieren");
    await page.getByLabel("Name", { exact: true }).fill("E2E Testerin");
    await page.getByLabel("Benutzername").fill(`e2e${stamp}`);
    await page.getByLabel("E-Mail-Adresse").fill(email);
    await page.getByLabel("Passwort", { exact: true }).fill(password);
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Konto erstellen" }).click();
    await expect(page).toHaveURL(/\/start/);

    // Menü öffnen und abmelden
    await page.getByRole("button", { name: /Menü von/ }).click();
    await page.getByRole("menuitem", { name: "Abmelden" }).click();
    await expect(page).toHaveURL(/nachricht=abgemeldet/);

    await page.goto("/anmelden");
    await page.getByLabel("E-Mail-Adresse").fill(email);
    await page.getByLabel("Passwort", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Anmelden" }).click();
    await expect(page).toHaveURL(/\/start/);
  });

  test("falsches Passwort zeigt generische Fehlermeldung", async ({ page }) => {
    await page.goto("/anmelden");
    await page.getByLabel("E-Mail-Adresse").fill("niemand@example.org");
    await page.getByLabel("Passwort", { exact: true }).fill("falsch-falsch");
    await page.getByRole("button", { name: "Anmelden" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "E-Mail oder Passwort" })).toBeVisible();
  });
});
