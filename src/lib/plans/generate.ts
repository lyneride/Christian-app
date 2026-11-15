/**
 * Generates the built-in reading plans from the canonical book structure.
 * Plans are pure data (no devotional text): each day lists one or more
 * passages. Chapter counts follow KJV versification (books.ts); the reader
 * clamps to the selected translation's actual chapter count.
 */
import { BOOKS, type BibleBook } from "@/lib/bible/books";

export interface Reading {
  book: number;
  chapter: number;
  verseStart?: number;
  verseEnd?: number;
}

export type PlanCategory = "eigen" | "ganze-bibel" | "neues-testament" | "altes-testament" | "einstieg" | "thema" | "studie" | "buch";

/**
 * Free companion reading for a book study (commentary or book), linked – never
 * copied. `pdf` = free download, `online` = free to read on the web.
 */
export interface PlanResource {
  kind: "pdf" | "online";
  title: string;
  author: string;
  url: string;
  /** short practical note, e.g. "Kostenloses PDF, Kapitel für Kapitel" */
  note: string;
}

export interface PlanDefinition {
  slug: string;
  title: string;
  description: string;
  category: PlanCategory;
  /** approximate minutes per day, for the overview */
  minutesPerDay: number;
  days: Reading[][];
  /** free companion reading (book studies) */
  resources?: PlanResource[];
}

function chaptersOf(book: BibleBook): Reading[] {
  return Array.from({ length: book.chapters }, (_, i) => ({ book: book.number, chapter: i + 1 }));
}

function chaptersOfBooks(books: readonly BibleBook[]): Reading[] {
  return books.flatMap(chaptersOf);
}

/** Splits an ordered chapter list into `days` contiguous groups of (nearly) equal size. */
export function distribute(readings: Reading[], days: number): Reading[][] {
  if (days <= 0) return [];
  const out: Reading[][] = [];
  const total = readings.length;
  for (let d = 0; d < days; d++) {
    const start = Math.floor((d * total) / days);
    const end = Math.floor(((d + 1) * total) / days);
    out.push(readings.slice(start, end));
  }
  return out;
}

const OT = BOOKS.filter((b) => b.testament === "OT");
const NT = BOOKS.filter((b) => b.testament === "NT");
const GOSPELS = BOOKS.filter((b) => b.genre === "gospel");
const byId = (id: string) => BOOKS.find((b) => b.id === id)!;

function bookPlan(id: string, slug: string, title: string, days: number, description: string, minutes = 8): PlanDefinition {
  return { slug, title, description, category: "buch", minutesPerDay: minutes, days: distribute(chaptersOf(byId(id)), days) };
}

/* ------------------------------------------------------------------ */
/* Book studies: a Bible book plus a free commentary                    */
/* ------------------------------------------------------------------ */

const BK = "https://www.bibelkommentare.de";

/**
 * William Kelly, "Einführende Vorträge zum Neuen Testament" (bibelkommentare.de):
 * one lecture per book, chapter by chapter, free PDF download.
 */
const KELLY_PDF: Record<string, { id: number; title: string }> = {
  Matt: { id: 196, title: "Einführende Vorträge zum Matthäusevangelium" },
  Mark: { id: 197, title: "Einführende Vorträge zum Markusevangelium" },
  Luke: { id: 198, title: "Einführende Vorträge zum Lukasevangelium" },
  John: { id: 199, title: "Einführende Vorträge zum Johannesevangelium" },
  Acts: { id: 357, title: "Einführende Vorträge zur Apostelgeschichte" },
  Rom: { id: 370, title: "Einführender Vortrag zum Römerbrief" },
  "1Cor": { id: 369, title: "Einführender Vortrag zum 1. Korintherbrief" },
  Gal: { id: 421, title: "Einführender Vortrag zum Galaterbrief" },
  Eph: { id: 422, title: "Einführender Vortrag zum Epheserbrief" },
  Phil: { id: 443, title: "Einführender Vortrag zum Philipperbrief" },
  Col: { id: 444, title: "Einführender Vortrag zum Kolosserbrief" },
  Heb: { id: 476, title: "Einführende Vorträge zum Hebräerbrief" },
  Jas: { id: 495, title: "Einführender Vortrag zum Jakobusbrief" },
  "1Pet": { id: 536, title: "Einführender Vortrag zum 1. Petrusbrief" },
  "1John": { id: 538, title: "Einführender Vortrag zum 1. Johannesbrief" },
};

/**
 * F. B. Hole, "Grundzüge des Neuen Testaments" (bibelkommentare.de):
 * short, clear overview of every chapter, free to read online.
 */
const HOLE_ONLINE: Record<string, { path: string; title: string }> = {
  Matt: { path: "61/das-evangelium-nach-matthaeus", title: "Das Evangelium nach Matthäus" },
  Mark: { path: "501/das-evangelium-nach-markus", title: "Das Evangelium nach Markus" },
  Luke: { path: "214/das-evangelium-nach-lukas", title: "Das Evangelium nach Lukas" },
  John: { path: "502/das-evangelium-nach-johannes", title: "Das Evangelium nach Johannes" },
  Acts: { path: "237/die-apostelgeschichte", title: "Die Apostelgeschichte" },
  Rom: { path: "503/der-brief-an-die-roemer", title: "Der Brief an die Römer" },
  "1Cor": { path: "51/der-1-brief-an-die-korinther", title: "Der 1. Brief an die Korinther" },
  Gal: { path: "238/der-brief-an-die-galater", title: "Der Brief an die Galater" },
  Eph: { path: "507/der-brief-an-die-epheser", title: "Der Brief an die Epheser" },
  Phil: { path: "227/der-brief-an-die-philipper", title: "Der Brief an die Philipper" },
  Col: { path: "244/der-brief-an-die-kolosser", title: "Der Brief an die Kolosser" },
  Heb: { path: "220/der-brief-an-die-hebraeer", title: "Der Brief an die Hebräer" },
  Jas: { path: "241/der-brief-des-jakobus", title: "Der Brief des Jakobus" },
  "1Pet": { path: "504/die-briefe-des-petrus", title: "Die Briefe des Petrus" },
  "1John": { path: "222/die-briefe-des-johannes", title: "Die Briefe des Johannes" },
};

function ntResources(id: string): PlanResource[] {
  const kelly = KELLY_PDF[id];
  const hole = HOLE_ONLINE[id];
  if (!kelly || !hole) throw new Error(`Keine Begleitlektüre für ${id} hinterlegt`);
  return [
    {
      kind: "online",
      title: hole.title,
      author: "F. B. Hole",
      url: `${BK}/kommentare/${hole.path}`,
      note: "Kurz und gut verständlich – zu jedem Kapitel ein eigener Abschnitt. Kostenlos online lesen.",
    },
    {
      kind: "pdf",
      title: kelly.title,
      author: "William Kelly",
      url: `${BK}/get/cmt.${kelly.id}.pdf`,
      note: "Ausführlicher Überblick Kapitel für Kapitel. Kostenloses PDF zum Herunterladen.",
    },
  ];
}

/** One chapter per day through a New Testament book, with the free companion commentaries. */
function bookStudy(id: string, slug: string, title: string, description: string, minutes = 20, days?: number): PlanDefinition {
  const book = byId(id);
  return {
    slug,
    title,
    description,
    category: "studie",
    minutesPerDay: minutes,
    days: distribute(chaptersOf(book), days ?? book.chapters),
    resources: ntResources(id),
  };
}

/** Shorthand for a passage: book number, chapter, optional verse range. */
function r(book: number, chapter: number, verseStart?: number, verseEnd?: number): Reading {
  return verseStart ? { book, chapter, verseStart, verseEnd } : { book, chapter };
}

export function generatePlans(): PlanDefinition[] {
  const otChapters = chaptersOfBooks(OT);
  const ntChapters = chaptersOfBooks(NT);

  // Bible in a year: every day an OT portion and a NT portion.
  const otByDay = distribute(otChapters, 365);
  const ntByDay = distribute(ntChapters, 365);
  const bibleInAYear: Reading[][] = otByDay.map((ot, i) => [...ot, ...ntByDay[i]]);

  // Bible in two years: lighter pace (roughly 1–2 chapters per day).
  const bibleInTwoYears = distribute([...otChapters, ...ntChapters], 730);

  // Faster whole-Bible plans: an OT portion and a NT portion every day.
  const parallel = (days: number): Reading[][] => {
    const ot = distribute(otChapters, days);
    const nt = distribute(ntChapters, days);
    return ot.map((o, i) => [...o, ...nt[i]]);
  };

  const plans: PlanDefinition[] = [
    {
      slug: "bibel-in-einem-jahr",
      title: "Die Bibel in einem Jahr",
      description: "Jeden Tag ein Abschnitt aus dem Alten Testament, an den meisten Tagen zusätzlich ein Kapitel aus dem Neuen Testament. In 365 Tagen durch die ganze Bibel.",
      category: "ganze-bibel",
      minutesPerDay: 15,
      days: bibleInAYear,
    },
    {
      slug: "bibel-in-3-monaten",
      title: "Die Bibel in 3 Monaten",
      description: "Die ganze Bibel in 90 Tagen: jeden Tag etwa zehn Kapitel Altes und drei Kapitel Neues Testament. Für alle, die sich viel Zeit am Tag nehmen können.",
      category: "ganze-bibel",
      minutesPerDay: 60,
      days: parallel(90),
    },
    {
      slug: "bibel-in-6-monaten",
      title: "Die Bibel in 6 Monaten",
      description: "Die ganze Bibel in 180 Tagen: jeden Tag etwa fünf Kapitel Altes und ein bis zwei Kapitel Neues Testament.",
      category: "ganze-bibel",
      minutesPerDay: 30,
      days: parallel(180),
    },
    {
      slug: "bibel-in-zwei-jahren",
      title: "Die Bibel in zwei Jahren",
      description: "Das ruhige Tempo: ein bis zwei Kapitel am Tag, von 1. Mose bis zur Offenbarung.",
      category: "ganze-bibel",
      minutesPerDay: 8,
      days: bibleInTwoYears,
    },
    {
      slug: "neues-testament-in-90-tagen",
      title: "Das Neue Testament in 90 Tagen",
      description: "Alle 260 Kapitel des Neuen Testaments in drei Monaten – etwa drei Kapitel pro Tag.",
      category: "neues-testament",
      minutesPerDay: 12,
      days: distribute(ntChapters, 90),
    },
    {
      slug: "neues-testament-in-einem-jahr",
      title: "Das Neue Testament in einem Jahr",
      description: "Ein Kapitel an fünf Tagen pro Woche – genug Raum, um jeden Abschnitt wirken zu lassen.",
      category: "neues-testament",
      minutesPerDay: 5,
      days: distribute(ntChapters, 260),
    },
    {
      slug: "evangelien-in-30-tagen",
      title: "Die vier Evangelien in 30 Tagen",
      description: "Matthäus, Markus, Lukas und Johannes in einem Monat: das Leben Jesu aus vier Blickwinkeln.",
      category: "neues-testament",
      minutesPerDay: 12,
      days: distribute(chaptersOfBooks(GOSPELS), 30),
    },
    {
      slug: "psalmen-in-60-tagen",
      title: "Die Psalmen in 60 Tagen",
      description: "Das Gebetbuch der Bibel: Klage, Dank, Vertrauen – alle 150 Psalmen in zwei Monaten.",
      category: "altes-testament",
      minutesPerDay: 7,
      days: distribute(chaptersOf(byId("Ps")), 60),
    },
    {
      slug: "psalmen-und-sprueche-in-einem-monat",
      title: "Psalmen und Sprüche – ein Monat Weisheit",
      description: "Jeden Tag fünf Psalmen und ein Kapitel aus den Sprüchen. Ideal als Begleitung zu einem anderen Plan.",
      category: "altes-testament",
      minutesPerDay: 12,
      days: Array.from({ length: 31 }, (_, i) => {
        const psalms = Array.from({ length: 5 }, (_, j) => ({ book: 19, chapter: i + 1 + j * 31 })).filter((r) => r.chapter <= 150);
        return [...psalms, { book: 20, chapter: i + 1 }];
      }),
    },
    {
      slug: "sprueche-in-31-tagen",
      title: "Sprüche in 31 Tagen",
      description: "Ein Kapitel pro Tag – das Buch der Sprüche hat genau 31 Kapitel, eines für jeden Tag des Monats.",
      category: "buch",
      minutesPerDay: 5,
      days: distribute(chaptersOf(byId("Prov")), 31),
    },
    bookStudy("John", "johannes-in-21-tagen", "Johannesevangelium in 21 Tagen", "Ein Kapitel am Tag: „Damit ihr glaubt, dass Jesus der Christus ist.“ (Johannes 20,31) – mit kostenlosem Kommentar zum Mitlesen."),
    bookStudy("Mark", "markus-in-16-tagen", "Markusevangelium in 16 Tagen", "Das kürzeste und schnellste Evangelium, ein Kapitel pro Tag – mit kostenlosem Kommentar zum Mitlesen.", 15),
    bookStudy("Rom", "roemerbrief-in-16-tagen", "Römerbrief in 16 Tagen", "Paulus’ große Erklärung des Evangeliums, Kapitel für Kapitel – mit kostenlosem Kommentar zum Mitlesen."),
    {
      ...bookPlan("Gen", "1-mose-in-25-tagen", "1. Mose in 25 Tagen", 25, "Schöpfung, Abraham, Jakob, Josef – die Anfänge in zwei Kapiteln pro Tag, mit kostenlosem Kommentar zum Mitlesen.", 25),
      category: "studie",
      resources: [
        {
          kind: "online",
          title: "Auslegung zum 1. Buch Mose",
          author: "F. B. Hole",
          url: `${BK}/kommentare/937/auslegung-zum-1-buch-mose`,
          note: "Gut verständliche Auslegung, Kapitel für Kapitel. Kostenlos online lesen.",
        },
        {
          kind: "online",
          title: "Betrachtungen über das erste Buch Mose",
          author: "C. H. Mackintosh",
          url: `${BK}/kommentare/361/betrachtungen-ueber-das-erste-buch-mose`,
          note: "Ausführlicher Klassiker aus dem 19. Jahrhundert, zu jedem Kapitel ein Abschnitt. Kostenlos online lesen.",
        },
      ],
    },
    bookStudy("Acts", "apostelgeschichte-in-28-tagen", "Apostelgeschichte in 28 Tagen", "Wie die erste Gemeinde entstand – ein Kapitel pro Tag, mit kostenlosem Kommentar zum Mitlesen.", 15),
    bookStudy("Matt", "matthaeus-studie", "Matthäusevangelium – Bücherstudie", "28 Tage, ein Kapitel pro Tag: Jesus als der verheißene König. Dazu kostenlose Kommentare zum Mitlesen."),
    bookStudy("Luke", "lukas-studie", "Lukasevangelium – Bücherstudie", "24 Tage, ein Kapitel pro Tag: der sorgfältige Bericht des Arztes Lukas. Dazu kostenlose Kommentare zum Mitlesen."),
    bookStudy("1Cor", "1-korinther-studie", "1. Korinther – Bücherstudie", "16 Tage, ein Kapitel pro Tag: Paulus an eine Gemeinde voller Fragen. Dazu kostenlose Kommentare zum Mitlesen."),
    bookStudy("Gal", "galater-studie", "Galaterbrief – Bücherstudie", "6 Tage, ein Kapitel pro Tag: Freiheit durch Gnade. Dazu kostenlose Kommentare zum Mitlesen."),
    bookStudy("Eph", "epheser-studie", "Epheserbrief – Bücherstudie", "6 Tage, ein Kapitel pro Tag: was Gott in Christus geschenkt hat und wie Gemeinde lebt. Dazu kostenlose Kommentare zum Mitlesen."),
    bookStudy("Phil", "philipper-studie", "Philipperbrief – Bücherstudie", "4 Tage, ein Kapitel pro Tag: der Brief der Freude. Dazu kostenlose Kommentare zum Mitlesen."),
    bookStudy("Col", "kolosser-studie", "Kolosserbrief – Bücherstudie", "4 Tage, ein Kapitel pro Tag: Christus über allem. Dazu kostenlose Kommentare zum Mitlesen."),
    bookStudy("Heb", "hebraeer-studie", "Hebräerbrief – Bücherstudie", "13 Tage, ein Kapitel pro Tag: Jesus, größer als alles davor. Dazu kostenlose Kommentare zum Mitlesen.", 25),
    bookStudy("Jas", "jakobus-studie", "Jakobusbrief – Bücherstudie", "5 Tage, ein Kapitel pro Tag: Glaube, der sich im Alltag zeigt. Dazu kostenlose Kommentare zum Mitlesen."),
    bookStudy("1Pet", "1-petrus-studie", "1. Petrus – Bücherstudie", "5 Tage, ein Kapitel pro Tag: Hoffnung mitten im Leiden. Dazu kostenlose Kommentare zum Mitlesen."),
    bookStudy("1John", "1-johannes-studie", "1. Johannesbrief – Bücherstudie", "5 Tage, ein Kapitel pro Tag: Licht, Liebe und Gewissheit. Dazu kostenlose Kommentare zum Mitlesen."),
    bookPlan("Isa", "jesaja-in-33-tagen", "Jesaja in 33 Tagen", 33, "Zwei Kapitel pro Tag durch das große Prophetenbuch.", 10),
    {
      slug: "jesus-kennenlernen-7-tage",
      title: "Jesus kennenlernen – 7 Tage",
      description: "Für den Einstieg: sieben zentrale Abschnitte, die zeigen, wer Jesus ist und was er für dich bedeutet.",
      category: "einstieg",
      minutesPerDay: 8,
      days: [
        [{ book: 43, chapter: 1, verseStart: 1, verseEnd: 18 }],
        [{ book: 43, chapter: 3, verseStart: 1, verseEnd: 21 }],
        [{ book: 42, chapter: 15 }],
        [{ book: 40, chapter: 5 }],
        [{ book: 43, chapter: 14 }],
        [{ book: 43, chapter: 15, verseStart: 1, verseEnd: 17 }],
        [{ book: 45, chapter: 8 }],
      ],
    },
    {
      slug: "bergpredigt-in-5-tagen",
      title: "Die Bergpredigt in 5 Tagen",
      description: "Matthäus 5–7 in kleinen Abschnitten: Jesu Lehre vom Leben im Reich Gottes.",
      category: "einstieg",
      minutesPerDay: 6,
      days: [
        [{ book: 40, chapter: 5, verseStart: 1, verseEnd: 20 }],
        [{ book: 40, chapter: 5, verseStart: 21, verseEnd: 48 }],
        [{ book: 40, chapter: 6, verseStart: 1, verseEnd: 18 }],
        [{ book: 40, chapter: 6, verseStart: 19, verseEnd: 34 }],
        [{ book: 40, chapter: 7 }],
      ],
    },
    {
      slug: "gottes-liebe-14-tage",
      title: "Gottes Liebe – 14 Tage",
      description: "Vierzehn Abschnitte über die Liebe Gottes, von den Psalmen bis zum ersten Johannesbrief.",
      category: "thema",
      minutesPerDay: 6,
      days: [
        [{ book: 19, chapter: 103 }],
        [{ book: 19, chapter: 136 }],
        [{ book: 23, chapter: 43, verseStart: 1, verseEnd: 13 }],
        [{ book: 23, chapter: 54 }],
        [{ book: 24, chapter: 31, verseStart: 1, verseEnd: 14 }],
        [{ book: 28, chapter: 11 }],
        [{ book: 36, chapter: 3, verseStart: 14, verseEnd: 20 }],
        [{ book: 42, chapter: 15, verseStart: 11, verseEnd: 32 }],
        [{ book: 43, chapter: 3, verseStart: 1, verseEnd: 21 }],
        [{ book: 45, chapter: 5, verseStart: 1, verseEnd: 11 }],
        [{ book: 45, chapter: 8, verseStart: 28, verseEnd: 39 }],
        [{ book: 49, chapter: 3, verseStart: 14, verseEnd: 21 }],
        [{ book: 62, chapter: 3 }],
        [{ book: 62, chapter: 4, verseStart: 7, verseEnd: 21 }],
      ],
    },
    {
      slug: "agape-21-tage",
      title: "Agape – 21 Tage",
      description: "Agape ist das griechische Wort, mit dem das Neue Testament Gottes Liebe und die Liebe untereinander beschreibt. 21 Abschnitte, in denen es eine zentrale Rolle spielt.",
      category: "thema",
      minutesPerDay: 6,
      days: [
        [r(43, 3, 1, 21)],
        [r(45, 5, 1, 11)],
        [r(45, 8, 31, 39)],
        [r(49, 2, 1, 10)],
        [r(49, 3, 14, 21)],
        [r(62, 3, 1, 18)],
        [r(62, 4, 7, 21)],
        [r(43, 13, 1, 17)],
        [r(43, 13, 31, 35)],
        [r(43, 15, 9, 17)],
        [r(43, 17, 20, 26)],
        [r(40, 5, 43, 48)],
        [r(40, 22, 34, 40)],
        [r(42, 10, 25, 37)],
        [r(46, 13)],
        [r(45, 12, 9, 21)],
        [r(45, 13, 8, 14)],
        [r(48, 5, 13, 26)],
        [r(50, 2, 1, 11)],
        [r(51, 3, 12, 17)],
        [r(60, 4, 7, 11)],
      ],
    },
    {
      slug: "gebet-14-tage",
      title: "Beten lernen – 14 Tage",
      description: "Was Jesus über das Gebet lehrt und wie Menschen in der Bibel gebetet haben: vom Vaterunser über die Psalmen bis zur ersten Gemeinde.",
      category: "thema",
      minutesPerDay: 6,
      days: [
        [r(40, 6, 5, 15)],
        [r(42, 11, 1, 13)],
        [r(42, 18, 1, 14)],
        [r(19, 5)],
        [r(19, 63)],
        [r(19, 139)],
        [r(9, 1, 1, 28)],
        [r(16, 1)],
        [r(27, 6)],
        [r(43, 17)],
        [r(40, 26, 36, 46)],
        [r(44, 4, 23, 31)],
        [r(50, 4, 4, 9)],
        [r(59, 5, 13, 18)],
      ],
    },
    {
      slug: "frucht-des-geistes-9-tage",
      title: "Frucht des Geistes – 9 Tage",
      description: "Liebe, Freude, Friede, Geduld, Freundlichkeit, Güte, Treue, Sanftmut, Selbstbeherrschung (Galater 5,22–23): jeden Tag ein Abschnitt zu einer davon.",
      category: "thema",
      minutesPerDay: 5,
      days: [
        [r(48, 5, 16, 26)],
        [r(16, 8, 1, 12)],
        [r(43, 14, 15, 31)],
        [r(59, 5, 7, 11)],
        [r(49, 4, 25, 32)],
        [r(42, 6, 27, 38)],
        [r(40, 25, 14, 30)],
        [r(40, 11, 25, 30)],
        [r(46, 9, 24, 27), r(56, 2, 11, 14)],
      ],
    },
    {
      slug: "heiliger-geist-12-tage",
      title: "Der Heilige Geist – 12 Tage",
      description: "Was Jesus über den Heiligen Geist versprochen hat, wie er an Pfingsten kam und was die Briefe über sein Wirken sagen.",
      category: "thema",
      minutesPerDay: 6,
      days: [
        [r(43, 3, 1, 8)],
        [r(43, 14, 15, 26)],
        [r(43, 16, 5, 15)],
        [r(44, 1, 1, 11)],
        [r(44, 2, 1, 21)],
        [r(44, 2, 37, 47)],
        [r(45, 8, 1, 17)],
        [r(45, 8, 18, 30)],
        [r(46, 12, 1, 13)],
        [r(48, 5, 16, 26)],
        [r(49, 1, 3, 14)],
        [r(49, 5, 15, 21)],
      ],
    },
    {
      slug: "helden-des-glaubens-12-tage",
      title: "Helden des Glaubens – 12 Tage",
      description: "Hebräer 11 und die Geschichten dahinter: Noah, Abraham, Mose, Rahab, Gideon, David – Menschen, die Gott vertraut haben.",
      category: "thema",
      minutesPerDay: 7,
      days: [
        [r(58, 11, 1, 7)],
        [r(1, 6, 9, 22)],
        [r(1, 12, 1, 9)],
        [r(1, 22, 1, 19)],
        [r(58, 11, 8, 22)],
        [r(2, 2, 1, 10)],
        [r(2, 14, 10, 31)],
        [r(6, 2)],
        [r(6, 6, 1, 20)],
        [r(7, 7)],
        [r(9, 17, 32, 50)],
        [r(58, 11, 23, 40), r(58, 12, 1, 3)],
      ],
    },
    {
      slug: "vergebung-7-tage",
      title: "Vergebung – 7 Tage",
      description: "Vergebung empfangen und weitergeben: sieben Abschnitte aus Psalmen, Evangelien und Briefen.",
      category: "thema",
      minutesPerDay: 5,
      days: [
        [r(19, 32)],
        [r(19, 51)],
        [r(40, 18, 21, 35)],
        [r(42, 15, 11, 32)],
        [r(42, 23, 32, 43)],
        [r(49, 4, 25, 32), r(49, 5, 1, 2)],
        [r(62, 1, 5, 10), r(62, 2, 1, 2)],
      ],
    },
    {
      slug: "trost-und-hoffnung-10-tage",
      title: "Trost und Hoffnung – 10 Tage",
      description: "Zehn Abschnitte für schwere Zeiten: Klage, Zuflucht, Zusage.",
      category: "thema",
      minutesPerDay: 6,
      days: [
        [{ book: 19, chapter: 23 }],
        [{ book: 19, chapter: 42 }],
        [{ book: 19, chapter: 46 }],
        [{ book: 19, chapter: 91 }],
        [{ book: 25, chapter: 3, verseStart: 19, verseEnd: 33 }],
        [{ book: 23, chapter: 40, verseStart: 27, verseEnd: 31 }],
        [{ book: 40, chapter: 11, verseStart: 25, verseEnd: 30 }],
        [{ book: 43, chapter: 14, verseStart: 1, verseEnd: 7 }],
        [{ book: 47, chapter: 4, verseStart: 7, verseEnd: 18 }],
        [{ book: 66, chapter: 21, verseStart: 1, verseEnd: 7 }],
      ],
    },
  ];

  return plans;
}

export function readingCount(plan: PlanDefinition): number {
  return plan.days.reduce((n, d) => n + d.length, 0);
}
