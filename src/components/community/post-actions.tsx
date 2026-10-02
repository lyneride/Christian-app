"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Pencil, Pin, PinOff, Trash2 } from "lucide-react";
import { deletePost, togglePin } from "@/app/(site)/gemeinschaft/actions";
import { Button, buttonClasses } from "@/components/ui/button";
import { postPath } from "@/lib/validation/community";

interface Props {
  postId: string;
  canEdit: boolean;
  canDelete: boolean;
  canPin: boolean;
  pinned: boolean;
  /** Where to go after a delete (detail page); the feed simply re-renders. */
  afterDeleteHref?: string;
}

/** Edit / delete / pin controls for the author, group leadership and moderators. */
export function PostActions({ postId, canEdit, canDelete, canPin, pinned, afterDeleteHref }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  if (!canEdit && !canDelete && !canPin) return null;

  function remove() {
    if (!window.confirm("Diesen Beitrag wirklich löschen?")) return;
    startTransition(async () => {
      const result = await deletePost(postId);
      if (!result.ok) {
        setMessage(result.message ?? "Das hat leider nicht geklappt.");
        return;
      }
      if (afterDeleteHref) router.push(afterDeleteHref);
      else router.refresh();
    });
  }

  function pin() {
    startTransition(async () => {
      const result = await togglePin(postId);
      if (!result.ok) setMessage(result.message ?? "Das hat leider nicht geklappt.");
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      {canPin ? (
        <Button type="button" variant="ghost" size="sm" onClick={pin} disabled={pending} aria-pressed={pinned} title={pinned ? "Nicht mehr anpinnen" : "Oben anpinnen"}>
          {pinned ? <PinOff aria-hidden="true" /> : <Pin aria-hidden="true" />}
          <span className="sr-only sm:not-sr-only">{pinned ? "Lösen" : "Anpinnen"}</span>
        </Button>
      ) : null}
      {canEdit ? (
        <Link href={`${postPath(postId)}/bearbeiten`} className={buttonClasses("ghost", "sm")}>
          <Pencil aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">Bearbeiten</span>
        </Link>
      ) : null}
      {canDelete ? (
        <Button type="button" variant="ghost" size="sm" onClick={remove} disabled={pending} className="text-danger hover:bg-danger-soft">
          <Trash2 aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">Löschen</span>
        </Button>
      ) : null}
      {message ? (
        <span role="alert" className="text-xs text-danger">
          {message}
        </span>
      ) : null}
    </div>
  );
}
