/**
 * Exports the Bible metadata the native Bleibe-Terminal app bundles
 * (book names, daily verses).
 * Run: npx tsx --conditions react-server scripts/export-terminal-data.ts <outDir>
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { BOOKS } from "../src/lib/bible/books";
import { DAILY_VERSES } from "../src/lib/bible/data";

const out = process.argv[2];
if (!out) throw new Error("Zielordner fehlt.");
mkdirSync(out, { recursive: true });

const books = BOOKS.map((b) => ({ number: b.number, osis: b.id, name: b.name.de, abbr: b.abbr.de, testament: b.testament }));
writeFileSync(join(out, "books.json"), JSON.stringify(books));
writeFileSync(join(out, "daily-verses.json"), JSON.stringify(DAILY_VERSES));
console.log(`${books.length} Bücher, ${DAILY_VERSES.length} Tagesverse → ${out}`);
