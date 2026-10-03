/**
 * Build step for Vercel: wakes the database (Neon suspends idle computes),
 * generates the Prisma client, applies migrations, seeds (idempotent) and
 * builds Next.js. Fails with a clear German message when something is missing.
 */
import { spawnSync } from "node:child_process";
import pg from "pg";

const raw = process.env.DATABASE_URL;
if (!raw || !/^postgres(ql)?:\/\//.test(raw)) {
  console.error("\n✖ DATABASE_URL fehlt oder ist keine PostgreSQL-Adresse.");
  console.error("  In Vercel unter Settings → Environment Variables die Neon-Verbindungszeile als DATABASE_URL eintragen");
  console.error("  (beginnt mit postgresql://) und dann Redeploy.\n");
  process.exit(1);
}

// Prisma's migration engine does not understand every libpq parameter; strip the ones Neon adds
// and give the (possibly sleeping) database generous timeouts.
const url = new URL(raw);
url.searchParams.delete("channel_binding");
if (!url.searchParams.get("sslmode")) url.searchParams.set("sslmode", "require");
url.searchParams.set("connect_timeout", "60");
url.searchParams.set("pool_timeout", "60");
const env = { ...process.env, DATABASE_URL: url.toString() };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function wakeDatabase() {
  console.log("\n▶ Datenbank aufwecken");
  for (let attempt = 1; attempt <= 8; attempt++) {
    const client = new pg.Client({ connectionString: raw, connectionTimeoutMillis: 20_000, ssl: { rejectUnauthorized: false } });
    try {
      await client.connect();
      await client.query("select 1");
      await client.end();
      console.log(`  Datenbank erreichbar (Versuch ${attempt}).`);
      return;
    } catch (err) {
      await client.end().catch(() => {});
      console.log(`  Noch nicht erreichbar (Versuch ${attempt}/8): ${err instanceof Error ? err.message : err}`);
      await sleep(5_000);
    }
  }
  console.error("\n✖ Die Datenbank antwortet nicht. DATABASE_URL in Vercel prüfen (Neon → Connect → Copy snippet) und Redeploy.\n");
  process.exit(1);
}

function run(label, cmd, args, retries = 0) {
  console.log(`\n▶ ${label}`);
  for (let attempt = 0; ; attempt++) {
    const result = spawnSync(cmd, args, { stdio: "inherit", env, shell: process.platform === "win32" });
    if (result.status === 0) return;
    if (attempt < retries) {
      console.log(`  Schritt fehlgeschlagen, neuer Versuch in 10 s …`);
      spawnSync(process.execPath, ["-e", "setTimeout(() => {}, 10000)"]);
      continue;
    }
    console.error(`\n✖ Schritt fehlgeschlagen: ${label}`);
    process.exit(result.status ?? 1);
  }
}

await wakeDatabase();
run("Prisma-Client generieren", "npx", ["prisma", "generate"]);
run("Datenbank-Migrationen anwenden", "npx", ["prisma", "migrate", "deploy"], 2);
run("Startdaten einspielen (Lesepläne, Admin)", "npx", ["prisma", "db", "seed"], 1);
run("Next.js bauen", "npx", ["next", "build"]);
