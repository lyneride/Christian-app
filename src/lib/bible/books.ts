/**
 * Canonical metadata for the 66 books of the Protestant Bible canon.
 *
 * `id` is the OSIS book id (used in URLs, lowercased), `number` is the
 * canonical 1-based position, and chapter counts follow the common
 * (KJV/English) versification. Individual translations may deviate slightly
 * (e.g. Joel has 4 chapters in Luther 1912); the per-translation index files
 * in `data/bibles/<translation>/index.json` carry the real counts.
 */

export type Testament = "OT" | "NT";

export type Genre =
  | "law"
  | "history"
  | "wisdom"
  | "prophets"
  | "gospel"
  | "letters"
  | "apocalypse";

export interface BibleBook {
  /** OSIS id, e.g. "Gen", "John" */
  id: string;
  /** 1-based canonical position (Genesis = 1 … Revelation = 66) */
  number: number;
  testament: Testament;
  genre: Genre;
  /** Default chapter count (KJV versification) */
  chapters: number;
  name: { de: string; en: string };
  /** Preferred short form, e.g. "1Mo", "Joh" (German) / "Gen", "John" (English) */
  abbr: { de: string; en: string };
  /** Additional accepted abbreviations/aliases (case-insensitive, punctuation-insensitive) */
  aliases: string[];
}

const b = (
  number: number,
  id: string,
  testament: Testament,
  genre: Genre,
  chapters: number,
  de: string,
  en: string,
  abbrDe: string,
  abbrEn: string,
  aliases: string[] = [],
): BibleBook => ({
  id,
  number,
  testament,
  genre,
  chapters,
  name: { de, en },
  abbr: { de: abbrDe, en: abbrEn },
  aliases,
});

export const BOOKS: readonly BibleBook[] = [
  b(1, "Gen", "OT", "law", 50, "1. Mose", "Genesis", "1Mo", "Gen", ["Genesis", "1Mose", "1 Mose", "Gn"]),
  b(2, "Exod", "OT", "law", 40, "2. Mose", "Exodus", "2Mo", "Exod", ["Exodus", "2Mose", "2 Mose", "Ex", "Exo"]),
  b(3, "Lev", "OT", "law", 27, "3. Mose", "Leviticus", "3Mo", "Lev", ["Levitikus", "Leviticus", "3Mose", "3 Mose", "Lv"]),
  b(4, "Num", "OT", "law", 36, "4. Mose", "Numbers", "4Mo", "Num", ["Numeri", "Numbers", "4Mose", "4 Mose", "Nm"]),
  b(5, "Deut", "OT", "law", 34, "5. Mose", "Deuteronomy", "5Mo", "Deut", ["Deuteronomium", "Deuteronomy", "5Mose", "5 Mose", "Dt", "Dtn"]),
  b(6, "Josh", "OT", "history", 24, "Josua", "Joshua", "Jos", "Josh", ["Joshua", "Josua"]),
  b(7, "Judg", "OT", "history", 21, "Richter", "Judges", "Ri", "Judg", ["Richter", "Judges", "Jdg", "Ri"]),
  b(8, "Ruth", "OT", "history", 4, "Rut", "Ruth", "Rut", "Ruth", ["Ruth", "Rut", "Rt"]),
  b(9, "1Sam", "OT", "history", 31, "1. Samuel", "1 Samuel", "1Sam", "1Sam", ["1 Samuel", "1Samuel", "1 Sam", "1S"]),
  b(10, "2Sam", "OT", "history", 24, "2. Samuel", "2 Samuel", "2Sam", "2Sam", ["2 Samuel", "2Samuel", "2 Sam", "2S"]),
  b(11, "1Kgs", "OT", "history", 22, "1. Könige", "1 Kings", "1Kön", "1Kgs", ["1 Könige", "1Könige", "1 Kings", "1Kings", "1Kon", "1 Kön", "1Ki", "1Kg"]),
  b(12, "2Kgs", "OT", "history", 25, "2. Könige", "2 Kings", "2Kön", "2Kgs", ["2 Könige", "2Könige", "2 Kings", "2Kings", "2Kon", "2 Kön", "2Ki", "2Kg"]),
  b(13, "1Chr", "OT", "history", 29, "1. Chronik", "1 Chronicles", "1Chr", "1Chr", ["1 Chronik", "1Chronik", "1 Chronicles", "1Chronicles", "1Ch"]),
  b(14, "2Chr", "OT", "history", 36, "2. Chronik", "2 Chronicles", "2Chr", "2Chr", ["2 Chronik", "2Chronik", "2 Chronicles", "2Chronicles", "2Ch"]),
  b(15, "Ezra", "OT", "history", 10, "Esra", "Ezra", "Esr", "Ezra", ["Esra", "Ezra", "Esr"]),
  b(16, "Neh", "OT", "history", 13, "Nehemia", "Nehemiah", "Neh", "Neh", ["Nehemia", "Nehemiah"]),
  b(17, "Esth", "OT", "history", 10, "Ester", "Esther", "Est", "Esth", ["Ester", "Esther", "Est"]),
  b(18, "Job", "OT", "wisdom", 42, "Hiob", "Job", "Hi", "Job", ["Hiob", "Job", "Ijob", "Hi"]),
  b(19, "Ps", "OT", "wisdom", 150, "Psalmen", "Psalms", "Ps", "Ps", ["Psalm", "Psalmen", "Psalms", "Psa", "Pss"]),
  b(20, "Prov", "OT", "wisdom", 31, "Sprüche", "Proverbs", "Spr", "Prov", ["Sprüche", "Sprueche", "Spruche", "Proverbs", "Prov", "Spr", "Sprichwörter"]),
  b(21, "Eccl", "OT", "wisdom", 12, "Prediger", "Ecclesiastes", "Pred", "Eccl", ["Prediger", "Ecclesiastes", "Kohelet", "Koh", "Pred", "Ecc", "Qoh"]),
  b(22, "Song", "OT", "wisdom", 8, "Hoheslied", "Song of Solomon", "Hld", "Song", ["Hoheslied", "Hohelied", "Hohes Lied", "Song of Songs", "Song of Solomon", "Hld", "Sos", "Cant"]),
  b(23, "Isa", "OT", "prophets", 66, "Jesaja", "Isaiah", "Jes", "Isa", ["Jesaja", "Isaiah", "Jes", "Is"]),
  b(24, "Jer", "OT", "prophets", 52, "Jeremia", "Jeremiah", "Jer", "Jer", ["Jeremia", "Jeremiah"]),
  b(25, "Lam", "OT", "prophets", 5, "Klagelieder", "Lamentations", "Klgl", "Lam", ["Klagelieder", "Lamentations", "Klgl", "Kla"]),
  b(26, "Ezek", "OT", "prophets", 48, "Hesekiel", "Ezekiel", "Hes", "Ezek", ["Hesekiel", "Ezechiel", "Ezekiel", "Hes", "Ez", "Eze"]),
  b(27, "Dan", "OT", "prophets", 12, "Daniel", "Daniel", "Dan", "Dan", ["Daniel"]),
  b(28, "Hos", "OT", "prophets", 14, "Hosea", "Hosea", "Hos", "Hos", ["Hosea"]),
  b(29, "Joel", "OT", "prophets", 3, "Joel", "Joel", "Joel", "Joel", ["Joel"]),
  b(30, "Amos", "OT", "prophets", 9, "Amos", "Amos", "Am", "Amos", ["Amos", "Am"]),
  b(31, "Obad", "OT", "prophets", 1, "Obadja", "Obadiah", "Obd", "Obad", ["Obadja", "Obadiah", "Obd", "Ob"]),
  b(32, "Jonah", "OT", "prophets", 4, "Jona", "Jonah", "Jona", "Jonah", ["Jona", "Jonah", "Jon"]),
  b(33, "Mic", "OT", "prophets", 7, "Micha", "Micah", "Mi", "Mic", ["Micha", "Micah", "Mi"]),
  b(34, "Nah", "OT", "prophets", 3, "Nahum", "Nahum", "Nah", "Nah", ["Nahum", "Na"]),
  b(35, "Hab", "OT", "prophets", 3, "Habakuk", "Habakkuk", "Hab", "Hab", ["Habakuk", "Habakkuk"]),
  b(36, "Zeph", "OT", "prophets", 3, "Zefanja", "Zephaniah", "Zef", "Zeph", ["Zefanja", "Zephanja", "Zephaniah", "Zef", "Zep"]),
  b(37, "Hag", "OT", "prophets", 2, "Haggai", "Haggai", "Hag", "Hag", ["Haggai"]),
  b(38, "Zech", "OT", "prophets", 14, "Sacharja", "Zechariah", "Sach", "Zech", ["Sacharja", "Zechariah", "Sach", "Zec"]),
  b(39, "Mal", "OT", "prophets", 4, "Maleachi", "Malachi", "Mal", "Mal", ["Maleachi", "Malachi"]),
  b(40, "Matt", "NT", "gospel", 28, "Matthäus", "Matthew", "Mt", "Matt", ["Matthäus", "Matthaeus", "Matthaus", "Matthew", "Mt", "Mat"]),
  b(41, "Mark", "NT", "gospel", 16, "Markus", "Mark", "Mk", "Mark", ["Markus", "Mark", "Mk", "Mr"]),
  b(42, "Luke", "NT", "gospel", 24, "Lukas", "Luke", "Lk", "Luke", ["Lukas", "Luke", "Lk", "Luk"]),
  b(43, "John", "NT", "gospel", 21, "Johannes", "John", "Joh", "John", ["Johannes", "John", "Joh", "Jn", "Jh"]),
  b(44, "Acts", "NT", "history", 28, "Apostelgeschichte", "Acts", "Apg", "Acts", ["Apostelgeschichte", "Acts", "Apg", "Ac", "Act"]),
  b(45, "Rom", "NT", "letters", 16, "Römer", "Romans", "Röm", "Rom", ["Römer", "Roemer", "Romer", "Romans", "Röm", "Rom", "Ro"]),
  b(46, "1Cor", "NT", "letters", 16, "1. Korinther", "1 Corinthians", "1Kor", "1Cor", ["1 Korinther", "1Korinther", "1 Corinthians", "1Corinthians", "1 Kor", "1Co"]),
  b(47, "2Cor", "NT", "letters", 13, "2. Korinther", "2 Corinthians", "2Kor", "2Cor", ["2 Korinther", "2Korinther", "2 Corinthians", "2Corinthians", "2 Kor", "2Co"]),
  b(48, "Gal", "NT", "letters", 6, "Galater", "Galatians", "Gal", "Gal", ["Galater", "Galatians"]),
  b(49, "Eph", "NT", "letters", 6, "Epheser", "Ephesians", "Eph", "Eph", ["Epheser", "Ephesians"]),
  b(50, "Phil", "NT", "letters", 4, "Philipper", "Philippians", "Phil", "Phil", ["Philipper", "Philippians", "Php", "Phil"]),
  b(51, "Col", "NT", "letters", 4, "Kolosser", "Colossians", "Kol", "Col", ["Kolosser", "Colossians", "Kol"]),
  b(52, "1Thess", "NT", "letters", 5, "1. Thessalonicher", "1 Thessalonians", "1Thess", "1Thess", ["1 Thessalonicher", "1Thessalonicher", "1 Thessalonians", "1Thessalonians", "1 Thess", "1Th", "1Thes"]),
  b(53, "2Thess", "NT", "letters", 3, "2. Thessalonicher", "2 Thessalonians", "2Thess", "2Thess", ["2 Thessalonicher", "2Thessalonicher", "2 Thessalonians", "2Thessalonians", "2 Thess", "2Th", "2Thes"]),
  b(54, "1Tim", "NT", "letters", 6, "1. Timotheus", "1 Timothy", "1Tim", "1Tim", ["1 Timotheus", "1Timotheus", "1 Timothy", "1Timothy", "1 Tim", "1Ti"]),
  b(55, "2Tim", "NT", "letters", 4, "2. Timotheus", "2 Timothy", "2Tim", "2Tim", ["2 Timotheus", "2Timotheus", "2 Timothy", "2Timothy", "2 Tim", "2Ti"]),
  b(56, "Titus", "NT", "letters", 3, "Titus", "Titus", "Tit", "Titus", ["Titus", "Tit"]),
  b(57, "Phlm", "NT", "letters", 1, "Philemon", "Philemon", "Phlm", "Phlm", ["Philemon", "Phlm", "Phm", "Philem"]),
  b(58, "Heb", "NT", "letters", 13, "Hebräer", "Hebrews", "Hebr", "Heb", ["Hebräer", "Hebraeer", "Hebraer", "Hebrews", "Hebr", "Heb"]),
  b(59, "Jas", "NT", "letters", 5, "Jakobus", "James", "Jak", "Jas", ["Jakobus", "James", "Jak", "Jas", "Jam"]),
  b(60, "1Pet", "NT", "letters", 5, "1. Petrus", "1 Peter", "1Petr", "1Pet", ["1 Petrus", "1Petrus", "1 Peter", "1Peter", "1 Petr", "1Pe", "1Pt"]),
  b(61, "2Pet", "NT", "letters", 3, "2. Petrus", "2 Peter", "2Petr", "2Pet", ["2 Petrus", "2Petrus", "2 Peter", "2Peter", "2 Petr", "2Pe", "2Pt"]),
  b(62, "1John", "NT", "letters", 5, "1. Johannes", "1 John", "1Joh", "1John", ["1 Johannes", "1Johannes", "1 John", "1John", "1 Joh", "1Jn", "1Jo"]),
  b(63, "2John", "NT", "letters", 1, "2. Johannes", "2 John", "2Joh", "2John", ["2 Johannes", "2Johannes", "2 John", "2John", "2 Joh", "2Jn", "2Jo"]),
  b(64, "3John", "NT", "letters", 1, "3. Johannes", "3 John", "3Joh", "3John", ["3 Johannes", "3Johannes", "3 John", "3John", "3 Joh", "3Jn", "3Jo"]),
  b(65, "Jude", "NT", "letters", 1, "Judas", "Jude", "Jud", "Jude", ["Judas", "Jude", "Jud"]),
  b(66, "Rev", "NT", "apocalypse", 22, "Offenbarung", "Revelation", "Offb", "Rev", ["Offenbarung", "Revelation", "Offb", "Off", "Apk", "Apokalypse", "Rev", "Re"]),
] as const;

export const BOOK_COUNT = BOOKS.length;

/** Lowercased OSIS id → book */
const BY_SLUG = new Map<string, BibleBook>(BOOKS.map((book) => [book.id.toLowerCase(), book]));
const BY_NUMBER = new Map<number, BibleBook>(BOOKS.map((book) => [book.number, book]));

/** Normalises a user-typed book name: lowercase, no dots/spaces/hyphens, ä→ae etc. kept as-is for lookup table */
export function normalizeBookToken(token: string): string {
  return token
    .toLowerCase()
    .replace(/[.\s\-_]/g, "")
    .replace(/ä/g, "a")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/ß/g, "ss");
}

const BY_ALIAS = new Map<string, BibleBook>();
for (const book of BOOKS) {
  const candidates = [book.id, book.name.de, book.name.en, book.abbr.de, book.abbr.en, ...book.aliases];
  for (const c of candidates) {
    BY_ALIAS.set(normalizeBookToken(c), book);
  }
}

export function getBookBySlug(slug: string): BibleBook | undefined {
  return BY_SLUG.get(slug.toLowerCase()) ?? BY_ALIAS.get(normalizeBookToken(slug));
}

export function getBookByNumber(number: number): BibleBook | undefined {
  return BY_NUMBER.get(number);
}

/** Resolves any German/English name or abbreviation (e.g. "1. Mose", "Joh", "Röm", "Song of Songs"). */
export function findBook(nameOrAbbr: string): BibleBook | undefined {
  return BY_ALIAS.get(normalizeBookToken(nameOrAbbr));
}

export function bookSlug(book: BibleBook): string {
  return book.id.toLowerCase();
}

export const OLD_TESTAMENT = BOOKS.filter((book) => book.testament === "OT");
export const NEW_TESTAMENT = BOOKS.filter((book) => book.testament === "NT");

export const GENRE_LABELS: Record<Genre, { de: string; en: string }> = {
  law: { de: "Gesetz (Tora)", en: "Law (Torah)" },
  history: { de: "Geschichte", en: "History" },
  wisdom: { de: "Weisheit & Poesie", en: "Wisdom & Poetry" },
  prophets: { de: "Propheten", en: "Prophets" },
  gospel: { de: "Evangelien", en: "Gospels" },
  letters: { de: "Briefe", en: "Letters" },
  apocalypse: { de: "Apokalyptik", en: "Apocalyptic" },
};
