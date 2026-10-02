/**
 * Converts raw public-domain Bible sources into the compact per-book JSON
 * format used by the app (data/bibles/<ID>/<bookNumber>.json + index.json)
 * and converts the OpenBible.info cross-reference list into
 * data/crossrefs/<bookNumber>.json.
 *
 * Usage:
 *   npx tsx scripts/bible/convert.ts --src <dir with raw files> [--out data]
 *
 * Raw sources (not committed; see docs/dev/bible-data.md for download steps):
 *   - Beblia XML format (https://github.com/Beblia/Holy-Bible-XML-Format):
 *       GermanLuther1912Bible.xml, GermanElber1905Bible.xml, German1545Bible.xml, EnglishKJBible.xml
 *   - scrollmapper JSON format (https://github.com/scrollmapper/bible_databases):
 *       formats/json/GerSch.json, formats/json/BSB.json
 *   - OpenBible.info cross references (CC-BY): sources/extras/cross_references.txt
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { BOOKS } from "../../src/lib/bible/books";

interface SourceDef {
  id: string;
  name: string;
  shortName: string;
  language: "de" | "en";
  year: number;
  license: string;
  licenseNote: string;
  source: string;
  format: "beblia" | "scrollmapper";
  file: string;
  /** Preferred order in the UI (lower first) */
  order: number;
  /** false → may not be used for commercial purposes (Schlachter 1951) */
  commercialUse: boolean;
}

const SOURCES: SourceDef[] = [
  {
    id: "LUT1912",
    name: "Lutherbibel 1912",
    shortName: "Luther 1912",
    language: "de",
    year: 1912,
    license: "Public Domain",
    licenseNote: "Gemeinfrei. Revision von 1912 der Übersetzung Martin Luthers.",
    source: "https://github.com/Beblia/Holy-Bible-XML-Format (GermanLuther1912Bible.xml)",
    format: "beblia",
    file: "GermanLuther1912Bible.xml",
    order: 10,
    commercialUse: true,
  },
  {
    id: "ELB1905",
    name: "Elberfelder Bibel 1905 (unrevidiert)",
    shortName: "Elberfelder 1905",
    language: "de",
    year: 1905,
    license: "Public Domain",
    licenseNote: "Gemeinfrei. Unrevidierte Elberfelder Übersetzung (Darby), Ausgabe 1905.",
    source: "https://github.com/Beblia/Holy-Bible-XML-Format (GermanElber1905Bible.xml)",
    format: "beblia",
    file: "GermanElber1905Bible.xml",
    order: 20,
    commercialUse: true,
  },
  {
    id: "SCH1951",
    name: "Schlachter-Bibel 1951",
    shortName: "Schlachter 1951",
    language: "de",
    year: 1951,
    license: "Copyrighted; free for non-commercial distribution",
    licenseNote:
      "© Genfer Bibelgesellschaft. Frei für nicht-kommerzielle Verbreitung. Nicht in kommerziellen Angeboten verwenden.",
    source: "https://github.com/scrollmapper/bible_databases (formats/json/GerSch.json)",
    format: "scrollmapper",
    file: "GerSch.json",
    order: 30,
    commercialUse: false,
  },
  {
    id: "LUT1545",
    name: "Lutherbibel 1545 (Letzte Hand)",
    shortName: "Luther 1545",
    language: "de",
    year: 1545,
    license: "Public Domain",
    licenseNote: "Gemeinfrei. Ausgabe letzter Hand, Originalorthographie.",
    source: "https://github.com/Beblia/Holy-Bible-XML-Format (German1545Bible.xml)",
    format: "beblia",
    file: "German1545Bible.xml",
    order: 40,
    commercialUse: true,
  },
  {
    id: "BSB",
    name: "Berean Standard Bible",
    shortName: "BSB",
    language: "en",
    year: 2023,
    license: "Public Domain (CC0)",
    licenseNote: "Public domain since 2023 (Berean Bible / Bible Hub).",
    source: "https://github.com/scrollmapper/bible_databases (formats/json/BSB.json)",
    format: "scrollmapper",
    file: "BSB.json",
    order: 50,
    commercialUse: true,
  },
  {
    id: "KJV",
    name: "King James Version",
    shortName: "KJV",
    language: "en",
    year: 1769,
    license: "Public Domain",
    licenseNote: "Public domain (outside the United Kingdom).",
    source: "https://github.com/Beblia/Holy-Bible-XML-Format (EnglishKJBible.xml)",
    format: "beblia",
    file: "EnglishKJBible.xml",
    order: 60,
    commercialUse: true,
  },
];

type BookData = string[][]; // chapters → verses

function decodeEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function cleanVerse(text: string): string {
  return decodeEntities(text).replace(/\s+/g, " ").trim();
}

/** Parses the simple Beblia XML (no nested markup inside <verse>). */
function parseBeblia(xml: string): Map<number, BookData> {
  const books = new Map<number, BookData>();
  const bookRe = /<book number="(\d+)"[^>]*>([\s\S]*?)<\/book>/g;
  const chapterRe = /<chapter number="(\d+)"[^>]*>([\s\S]*?)<\/chapter>/g;
  const verseRe = /<verse number="(\d+)"[^>]*>([\s\S]*?)<\/verse>|<verse number="(\d+)"[^>]*\/>/g;
  let bm: RegExpExecArray | null;
  while ((bm = bookRe.exec(xml))) {
    const bookNumber = Number(bm[1]);
    const chapters: BookData = [];
    let cm: RegExpExecArray | null;
    chapterRe.lastIndex = 0;
    const bookXml = bm[2];
    while ((cm = chapterRe.exec(bookXml))) {
      const chapterNumber = Number(cm[1]);
      const verses: string[] = [];
      let vm: RegExpExecArray | null;
      verseRe.lastIndex = 0;
      while ((vm = verseRe.exec(cm[2]))) {
        const n = Number(vm[1] ?? vm[3]);
        const text = vm[2] ?? "";
        if (n !== verses.length + 1) {
          // fill gaps so that index === verse number - 1
          while (verses.length < n - 1) verses.push("");
        }
        verses[n - 1] = cleanVerse(text);
      }
      chapters[chapterNumber - 1] = verses;
    }
    // fill missing chapters with empty arrays to keep indexes stable
    for (let i = 0; i < chapters.length; i++) if (!chapters[i]) chapters[i] = [];
    books.set(bookNumber, chapters);
  }
  return books;
}

interface ScrollmapperJson {
  translation: string;
  books: { name: string; chapters: { chapter: number; verses: { verse: number; text: string }[] }[] }[];
}

function parseScrollmapper(json: string): Map<number, BookData> {
  const data = JSON.parse(json) as ScrollmapperJson;
  if (data.books.length !== 66) throw new Error(`expected 66 books, got ${data.books.length}`);
  const books = new Map<number, BookData>();
  data.books.forEach((book, i) => {
    const chapters: BookData = [];
    for (const ch of book.chapters) {
      const verses: string[] = [];
      for (const v of ch.verses) {
        while (verses.length < v.verse - 1) verses.push("");
        verses[v.verse - 1] = cleanVerse(v.text);
      }
      chapters[ch.chapter - 1] = verses;
    }
    for (let c = 0; c < chapters.length; c++) if (!chapters[c]) chapters[c] = [];
    books.set(i + 1, chapters);
  });
  return books;
}

function convertTranslation(src: SourceDef, srcDir: string, outDir: string) {
  const path = join(srcDir, src.file);
  if (!existsSync(path)) {
    console.warn(`! skipping ${src.id}: ${path} not found`);
    return null;
  }
  const raw = readFileSync(path, "utf8");
  const books = src.format === "beblia" ? parseBeblia(raw) : parseScrollmapper(raw);
  if (books.size !== 66) throw new Error(`${src.id}: expected 66 books, got ${books.size}`);
  const dir = join(outDir, "bibles", src.id);
  mkdirSync(dir, { recursive: true });
  const verseCounts: number[][] = [];
  let total = 0;
  for (const meta of BOOKS) {
    const chapters = books.get(meta.number);
    if (!chapters) throw new Error(`${src.id}: missing book ${meta.number}`);
    verseCounts[meta.number - 1] = chapters.map((c) => c.length);
    total += chapters.reduce((n, c) => n + c.filter(Boolean).length, 0);
    writeFileSync(join(dir, `${meta.number}.json`), JSON.stringify({ b: meta.number, c: chapters }));
  }
  const index = {
    id: src.id,
    name: src.name,
    shortName: src.shortName,
    language: src.language,
    year: src.year,
    license: src.license,
    licenseNote: src.licenseNote,
    source: src.source,
    order: src.order,
    commercialUse: src.commercialUse,
    verseCount: total,
    chapters: verseCounts.map((v) => v.length),
    verseCounts,
  };
  writeFileSync(join(dir, "index.json"), JSON.stringify(index, null, 1));
  console.log(`✓ ${src.id}: ${total} verses`);
  return index;
}

/** OSIS ids used by openbible.info → canonical book numbers */
const OSIS_TO_NUMBER = new Map<string, number>(BOOKS.map((b) => [b.id, b.number]));

function parseRef(ref: string): { b: number; c: number; v: number } | null {
  const m = /^([1-3]?[A-Za-z]+)\.(\d+)\.(\d+)$/.exec(ref);
  if (!m) return null;
  const b = OSIS_TO_NUMBER.get(m[1]);
  if (!b) return null;
  return { b, c: Number(m[2]), v: Number(m[3]) };
}

function convertCrossRefs(srcDir: string, outDir: string, perVerse = 12, minVotes = 1) {
  const path = join(srcDir, "cross_references.txt");
  if (!existsSync(path)) {
    console.warn(`! skipping cross references: ${path} not found`);
    return;
  }
  const lines = readFileSync(path, "utf8").split("\n");
  // bookNumber → "c:v" → [[target, votes], ...]
  const byBook = new Map<number, Record<string, [string, number][]>>();
  for (const line of lines.slice(1)) {
    if (!line.trim()) continue;
    const [from, to, votesStr] = line.split("\t");
    const votes = Number(votesStr);
    if (!Number.isFinite(votes) || votes < minVotes) continue;
    const f = parseRef(from);
    if (!f) continue;
    const [toStart, toEnd] = to.split("-");
    const ts = parseRef(toStart);
    if (!ts) continue;
    let target = `${ts.b}:${ts.c}:${ts.v}`;
    if (toEnd) {
      const te = parseRef(toEnd);
      if (te && te.b === ts.b && te.c === ts.c && te.v > ts.v) target += `-${te.v}`;
      else if (te && te.b === ts.b) target += `-${te.c}:${te.v}`;
    }
    const book = byBook.get(f.b) ?? {};
    const key = `${f.c}:${f.v}`;
    (book[key] ??= []).push([target, votes]);
    byBook.set(f.b, book);
  }
  const dir = join(outDir, "crossrefs");
  mkdirSync(dir, { recursive: true });
  let kept = 0;
  for (const [bookNumber, verses] of byBook) {
    for (const key of Object.keys(verses)) {
      verses[key].sort((a, b) => b[1] - a[1]);
      verses[key] = verses[key].slice(0, perVerse);
      kept += verses[key].length;
    }
    writeFileSync(join(dir, `${bookNumber}.json`), JSON.stringify(verses));
  }
  writeFileSync(
    join(dir, "index.json"),
    JSON.stringify({ source: "https://www.openbible.info/labs/cross-references/", license: "CC-BY 4.0", perVerse, kept }, null, 1),
  );
  console.log(`✓ cross references: ${kept} links`);
}

function main() {
  const args = process.argv.slice(2);
  const get = (flag: string, def: string) => {
    const i = args.indexOf(flag);
    return i >= 0 ? args[i + 1] : def;
  };
  const srcDir = get("--src", "raw");
  const outDir = get("--out", "data");
  const translations = SOURCES.map((s) => convertTranslation(s, srcDir, outDir)).filter(Boolean);
  mkdirSync(join(outDir, "bibles"), { recursive: true });
  writeFileSync(
    join(outDir, "bibles", "translations.json"),
    JSON.stringify(
      translations
        .sort((a, b) => a!.order - b!.order)
        .map((t) => ({ ...t!, verseCounts: undefined })),
      null,
      1,
    ),
  );
  convertCrossRefs(srcDir, outDir);
}

main();
