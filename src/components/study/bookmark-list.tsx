import Link from "next/link";
import { Bookmark, X } from "lucide-react";
import { removeBookmark } from "@/lib/study/actions";
import { listBookmarks } from "@/lib/study/queries";
import { EmptyState } from "@/components/ui/empty-state";
import { formatRelative } from "@/lib/utils";
import { ActionButton } from "./action-button";
import { VerseSnippet } from "./verse-snippet";

export interface BookmarkListProps {
  userId: string;
  translation: string;
}

/** Lesezeichen: newest first, with verse text and a remove button. */
export async function BookmarkList({ userId, translation }: BookmarkListProps) {
  const items = await listBookmarks(userId);

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Bookmark />}
        title="Noch keine Lesezeichen"
        description="Setze im Bibel-Reader ein Lesezeichen, um schnell zu einer Stelle zurückzukehren."
        action={
          <Link href="/bibel" className="text-primary text-sm font-medium underline-offset-4 hover:underline">
            Zur Bibel
          </Link>
        }
      />
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((b) => (
        <li
          key={b.verseKey}
          className="rounded-card border-border bg-surface shadow-soft flex items-start gap-3 border p-4 sm:p-5"
        >
          <div className="min-w-0 flex-1 space-y-1">
            {b.label ? <p className="text-sm font-semibold">{b.label}</p> : null}
            <VerseSnippet verseKey={b.verseKey} translation={translation} maxLength={220} />
            <p className="text-muted-foreground text-xs">Gesetzt {formatRelative(b.createdAt)}</p>
          </div>
          <ActionButton
            action={removeBookmark.bind(null, b.verseKey)}
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            aria-label={`Lesezeichen ${b.label ?? b.verseKey} entfernen`}
            title="Lesezeichen entfernen"
          >
            <X aria-hidden="true" />
          </ActionButton>
        </li>
      ))}
    </ul>
  );
}
