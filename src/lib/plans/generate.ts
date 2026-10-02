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

export type PlanCategory = "ganze-bibel" | "neues-testament" | "altes-testament" | "einstieg" | "thema" | "buch";

export interface PlanDefinition {
  slug: string;
  title: string;
  description: string;
  category: PlanCategory;
  /** approximate minutes per day, for the overview */
  minutesPerDay: number;
  days: Reading[][];
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

export function generatePlans(): PlanDefinition[] {
  const otChapters = chaptersOfBooks(OT);
  const ntChapters = chaptersOfBooks(NT);

  // Bible in a year: every day an OT portion and a NT portion.
  const otByDay = distribute(otChapters, 365);
  const ntByDay = distribute(ntChapters, 365);
  const bibleInAYear: Reading[][] = otByDay.map((ot, i) => [...ot, ...ntByDay[i]]);

  // Bible in two years: lighter pace (roughly 1–2 chapters per day).
  const bibleInTwoYears = distribute([...otChapters, ...ntChapters], 730);

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
    bookPlan("John", "johannes-in-21-tagen", "Johannesevangelium in 21 Tagen", 21, "Ein Kapitel am Tag: „Damit ihr glaubt, dass Jesus der Christus ist.“ (Johannes 20,31)"),
    bookPlan("Mark", "markus-in-16-tagen", "Markusevangelium in 16 Tagen", 16, "Das kürzeste und schnellste Evangelium, ein Kapitel pro Tag.", 7),
    bookPlan("Rom", "roemerbrief-in-16-tagen", "Römerbrief in 16 Tagen", 16, "Paulus’ große Erklärung des Evangeliums, Kapitel für Kapitel.", 9),
    bookPlan("Gen", "1-mose-in-25-tagen", "1. Mose in 25 Tagen", 25, "Schöpfung, Abraham, Jakob, Josef – die Anfänge in zwei Kapiteln pro Tag.", 10),
    bookPlan("Acts", "apostelgeschichte-in-28-tagen", "Apostelgeschichte in 28 Tagen", 28, "Wie die erste Gemeinde entstand – ein Kapitel pro Tag.", 7),
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
