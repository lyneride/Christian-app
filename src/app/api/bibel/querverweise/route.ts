import type { NextRequest } from "next/server";
import { z } from "zod";
import { getCrossReferences, getTranslation, getVerses, resolveTranslationId } from "@/lib/bible/data";
import { referencePath } from "@/lib/bible/reference";
import { formatCrossReference, localeFor } from "@/lib/bible/ui";

const Query = z.object({
  book: z.coerce.number().int().min(1).max(66),
  chapter: z.coerce.number().int().min(1).max(150),
  verse: z.coerce.number().int().min(1).max(176),
  t: z.string().trim().min(1).max(16).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(40),
});

export interface CrossReferenceDto {
  /** "Römer 5,8" in the locale of the translation */
  reference: string;
  /** reader path, e.g. "/bibel/rom/5?v=8&t=LUT1912" */
  path: string;
  /** first verse of the target (plus "…" for ranges) */
  text: string;
  votes: number;
}

/** GET /api/bibel/querverweise?book=43&chapter=3&verse=16&t=LUT1912 */
export async function GET(req: NextRequest) {
  const parsed = Query.safeParse(Object.fromEntries(req.nextUrl.searchParams));
  if (!parsed.success) {
    return Response.json(
      { error: "Ungültige Parameter", issues: z.flattenError(parsed.error).fieldErrors },
      { status: 400 },
    );
  }
  const { book, chapter, verse, limit } = parsed.data;
  const t = await resolveTranslationId(parsed.data.t);
  const translation = await getTranslation(t);
  const locale = localeFor(translation?.language);

  const refs = (await getCrossReferences(book, chapter, verse)).slice(0, limit);
  const out: CrossReferenceDto[] = await Promise.all(
    refs.map(async (ref) => {
      const [firstVerse] = await getVerses(t, ref.book.number, ref.chapter, ref.verseStart, ref.verseStart);
      const text = firstVerse?.text ?? "";
      const isRange = ref.verseEnd !== undefined && (ref.endChapter !== undefined || ref.verseEnd !== ref.verseStart);
      return {
        reference: formatCrossReference(ref, locale),
        path: referencePath(
          {
            book: ref.book,
            chapter: ref.chapter,
            verseStart: ref.verseStart,
            verseEnd: ref.endChapter ? undefined : ref.verseEnd,
          },
          t,
        ),
        text: isRange && text ? `${text} …` : text,
        votes: ref.votes,
      };
    }),
  );

  return Response.json({ refs: out }, { headers: { "Cache-Control": "public, max-age=86400" } });
}
