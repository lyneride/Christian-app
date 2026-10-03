"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { Send } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { sendVerseToFriend } from "@/lib/messages/share-actions";
import { SidePanel } from "./side-panel";

interface Friend {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  reference: string;
  book: number;
  chapter: number;
  verseStart: number;
  verseEnd?: number;
  translation: string;
}

/** "Vers an Freund senden": picks a friend and sends the passage as a direct message. */
export function SendVersePanel({ open, onClose, reference, book, chapter, verseStart, verseEnd, translation }: Props) {
  const [friends, setFriends] = useState<Friend[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [result, setResult] = useState<{ ok: boolean; message: string; href?: string } | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!open || friends !== null) return;
    let cancelled = false;
    fetch("/api/freunde")
      .then((r) => (r.ok ? r.json() : { friends: [] }))
      .then((data: { friends?: Friend[] }) => {
        if (!cancelled) setFriends(data.friends ?? []);
      })
      .catch(() => {
        if (!cancelled) setFriends([]);
      });
    return () => {
      cancelled = true;
    };
  }, [open, friends]);

  function send() {
    if (!selected) return;
    start(async () => {
      const res = await sendVerseToFriend({ toUserId: selected, book, chapter, verseStart, verseEnd, translation, note: note || undefined });
      setResult({ ok: Boolean(res.ok), message: res.message ?? "", href: typeof res.data?.href === "string" ? (res.data.href as string) : undefined });
    });
  }

  return (
    <SidePanel open={open} onClose={onClose} title="An Freund senden" subtitle={reference}>
      {friends === null ? (
        <p className="text-sm text-muted-foreground">Freunde werden geladen …</p>
      ) : friends.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Du hast noch keine Freunde hier.{" "}
          <Link href="/freunde" className="text-primary underline-offset-4 hover:underline">
            Freunde finden
          </Link>
        </p>
      ) : (
        <div className="space-y-4">
          <ul className="space-y-1" role="radiogroup" aria-label="Freund auswählen">
            {friends.map((f) => (
              <li key={f.id}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={selected === f.id}
                  onClick={() => setSelected(f.id)}
                  className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm ${selected === f.id ? "border-primary bg-primary-soft" : "border-border hover:bg-surface-muted"}`}
                >
                  <Avatar name={f.name} src={f.avatarUrl} size="xs" />
                  <span className="truncate">{f.name}</span>
                  <span className="truncate text-xs text-muted-foreground">@{f.username}</span>
                </button>
              </li>
            ))}
          </ul>
          <div>
            <label htmlFor="send-verse-note" className="text-sm font-medium">
              Ein paar Worte dazu (optional)
            </label>
            <Textarea id="send-verse-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} className="mt-1 min-h-20" placeholder="Hab heute an dich gedacht …" />
          </div>
          <Button onClick={send} disabled={!selected} loading={pending}>
            <Send aria-hidden="true" /> Senden
          </Button>
          {result ? (
            <p role="status" className={`text-sm ${result.ok ? "text-success" : "text-danger"}`}>
              {result.message}
              {result.ok && result.href ? (
                <>
                  {" "}
                  <Link href={result.href} className="text-primary underline-offset-4 hover:underline">
                    Zur Unterhaltung
                  </Link>
                </>
              ) : null}
            </p>
          ) : null}
        </div>
      )}
    </SidePanel>
  );
}
