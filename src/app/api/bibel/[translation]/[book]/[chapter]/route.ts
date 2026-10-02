import type { NextRequest } from "next/server";
import { bookSlug, getBookBySlug, getBookByNumber } from "@/lib/bible/books";
import { getChapter, getTranslation } from "@/lib/bible/data";

/**
 * GET /api/bibel/LUT1912/john/3 (book as OSIS slug or canonical number).
 * Chapter JSON for the PWA/offline cache.
 */
export async function GET(_req: NextRequest, ctx: RouteContext<"/api/bibel/[translation]/[book]/[chapter]">) {
  const { translation: tParam, book: bookParam, chapter: chapterParam } = await ctx.params;
  const notFound = () => Response.json({ error: "Nicht gefunden" }, { status: 404 });

  const translation = await getTranslation(tParam.toUpperCase());
  const book = /^\d{1,2}$/.test(bookParam) ? getBookByNumber(Number(bookParam)) : getBookBySlug(bookParam);
  const chapter = /^\d{1,3}$/.test(chapterParam) ? Number(chapterParam) : 0;
  if (!translation || !book || chapter < 1) return notFound();

  const data = await getChapter(translation.id, book.number, chapter);
  if (!data) return notFound();

  return Response.json(
    {
      translation: {
        id: translation.id,
        name: translation.name,
        shortName: translation.shortName,
        language: translation.language,
      },
      book: { number: book.number, id: book.id, slug: bookSlug(book), name: book.name, testament: book.testament },
      chapter,
      chapterCount: data.chapterCount,
      verses: data.verses.map((v) => ({ verse: v.verse, text: v.text })),
    },
    { headers: { "Cache-Control": "public, max-age=86400" } },
  );
}
