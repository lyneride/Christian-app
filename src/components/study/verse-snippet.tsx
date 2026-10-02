import Link from "next/link";
import { getTranslation, getVerses, resolveTranslationId } from "@/lib/bible/data";
import { formatReference, parseVerseKey, referencePath } from "@/lib/bible/reference";
import { localeFor } from "@/lib/bible/ui";
import { cn } from "@/lib/utils";

export interface VerseSnippetProps {
  verseKey: string;
  verseEnd?: number | null;
  /** translation id; falls back to the default translation */
  translation?: string | null;
  /** cut the text after this many characters (0 = full text) */
  maxLength?: number;
  className?: string;
}

/** Server component: verse text (scripture style) with a reference link into the reader. */
export async function VerseSnippet({ verseKey, verseEnd, translation, maxLength = 0, className }: VerseSnippetProps) {
  const parsed = parseVerseKey(verseKey);
  if (!parsed) return null;
  const t = await resolveTranslationId(translation);
  const [info, verses] = await Promise.all([
    getTranslation(t),
    getVerses(t, parsed.book.number, parsed.chapter, parsed.verse, verseEnd ?? parsed.verse),
  ]);
  const locale = localeFor(info?.language);
  const ref = { book: parsed.book, chapter: parsed.chapter, verseStart: parsed.verse, verseEnd: verseEnd ?? undefined };
  const label = formatReference(ref, locale);
  const full = verses.map((v) => v.text.trim()).join(" ");
  const text = maxLength > 0 && full.length > maxLength ? `${full.slice(0, maxLength).replace(/\s+\S*$/, "")} …` : full;

  return (
    <div className={cn("space-y-1", className)}>
      {text ? (
        <p className="scripture text-foreground/90 text-base leading-relaxed">{text}</p>
      ) : (
        <p className="text-muted-foreground text-sm">
          Dieser Vers ist in {info?.shortName ?? "dieser Übersetzung"} nicht enthalten.
        </p>
      )}
      <Link
        href={referencePath(ref, t)}
        className="text-primary text-sm font-medium underline-offset-4 hover:underline"
      >
        {label}
        {info ? <span className="text-muted-foreground font-normal"> · {info.shortName}</span> : null}
      </Link>
    </div>
  );
}
