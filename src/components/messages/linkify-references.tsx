import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import { findReferencesInText, referencePath } from "@/lib/bible/reference";

/**
 * Renders plain text and turns Bible references ("Joh 3,16") into links to the
 * reader. Line breaks are kept by the caller via `whitespace-pre-wrap`.
 */
export function LinkifyReferences({ text }: { text: string }) {
  const hits = findReferencesInText(text);
  if (hits.length === 0) return <>{text}</>;

  const parts: ReactNode[] = [];
  let pos = 0;
  hits.forEach((hit, i) => {
    if (hit.start > pos) parts.push(<Fragment key={`t${i}`}>{text.slice(pos, hit.start)}</Fragment>);
    parts.push(
      <Link
        key={`r${i}`}
        href={referencePath(hit.ref)}
        className="text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary"
      >
        {hit.raw}
      </Link>,
    );
    pos = hit.end;
  });
  if (pos < text.length) parts.push(<Fragment key="tail">{text.slice(pos)}</Fragment>);
  return <>{parts}</>;
}
