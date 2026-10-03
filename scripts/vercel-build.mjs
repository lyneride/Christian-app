/**
 * Build step for Vercel: generates the Prisma client, applies migrations,
 * seeds (idempotent) and builds Next.js. Fails with a clear German message
 * when the database is not configured.
 */
import { spawnSync } from "node:child_process";

const raw = process.env.DATABASE_URL;
if (!raw || !/^postgres(ql)?:\/\//.test(raw)) {
  console.error("\n✖ DATABASE_URL fehlt oder ist keine PostgreSQL-Adresse.");
  console.error("  In Vercel unter Settings → Environment Variables die Neon-Verbindungszeile als DATABASE_URL eintragen");
  console.error("  (beginnt mit postgresql://) und dann Redeploy.\n");
  process.exit(1);
}
// Prisma's migration engine does not understand every libpq parameter; strip the ones Neon adds.
const url = new URL(raw);
url.searchParams.delete("channel_binding");
if (!url.searchParams.get("sslmode")) url.searchParams.set("sslmode", "require");
const env = { ...process.env, DATABASE_URL: url.toString() };

const steps = [
  ["Prisma-Client generieren", "npx", ["prisma", "generate"]],
  ["Datenbank-Migrationen anwenden", "npx", ["prisma", "migrate", "deploy"]],
  ["Startdaten einspielen (Lesepläne, Admin)", "npx", ["prisma", "db", "seed"]],
  ["Next.js bauen", "npx", ["next", "build"]],
];

for (const [label, cmd, args] of steps) {
  console.log(`\n▶ ${label}`);
  const result = spawnSync(cmd, args, { stdio: "inherit", env, shell: process.platform === "win32" });
  if (result.status !== 0) {
    console.error(`\n✖ Schritt fehlgeschlagen: ${label}`);
    process.exit(result.status ?? 1);
  }
}
