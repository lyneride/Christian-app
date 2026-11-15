"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { Send, Users } from "lucide-react";
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

interface Chat {
  id: string;
  title: string;
  members: number;
}

/** "f:<userId>" for a friend, "c:<conversationId>" for a group chat. */
type Target = `f:${string}` | `c:${string}`;

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

/** "Vers senden": picks a friend or a group chat and sends the passage there. */
export function SendVersePanel({ open, onClose, reference, book, chapter, verseStart, verseEnd, translation }: Props) {
  const [friends, setFriends] = useState<Friend[] | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selected, setSelected] = useState<Target | null>(null);
  const [note, setNote] = useState("");
  const [result, setResult] = useState<{ ok: boolean; message: string; href?: string } | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!open || friends !== null) return;
    let cancelled = false;
    fetch("/api/freunde")
      .then((r) => (r.ok ? r.json() : { friends: [], chats: [] }))
      .then((data: { friends?: Friend[]; chats?: Chat[] }) => {
        if (cancelled) return;
        setFriends(data.friends ?? []);
        setChats(data.chats ?? []);
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
      const id = selected.slice(2);
      const target = selected.startsWith("c:") ? { conversationId: id } : { toUserId: id };
      const res = await sendVerseToFriend({ ...target, book, chapter, verseStart, verseEnd, translation, note: note || undefined });
      setResult({ ok: Boolean(res.ok), message: res.message ?? "", href: typeof res.data?.href === "string" ? (res.data.href as string) : undefined });
    });
  }

  return (
    <SidePanel open={open} onClose={onClose} title="Vers senden" subtitle={reference}>
      {friends === null ? (
        <p className="text-sm text-muted-foreground">Freunde werden geladen …</p>
      ) : friends.length === 0 && chats.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Du hast noch keine Freunde hier.{" "}
          <Link href="/freunde" className="text-primary underline-offset-4 hover:underline">
            Freunde finden
          </Link>
        </p>
      ) : (
        <div className="space-y-4">
          <div role="radiogroup" aria-label="Empfänger auswählen" className="space-y-4">
            {chats.length > 0 ? (
              <div>
                <p className="mb-1.5 text-xs font-extrabold text-muted-foreground">Gruppenchats</p>
                <ul className="space-y-1">
                  {chats.map((c) => (
                    <li key={c.id}>
                      <TargetButton active={selected === `c:${c.id}`} onSelect={() => setSelected(`c:${c.id}`)}>
                        <span aria-hidden="true" className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-area-gemeinschaft-soft text-area-gemeinschaft">
                          <Users className="size-3.5" />
                        </span>
                        <span className="truncate font-semibold">{c.title}</span>
                        <span className="shrink-0 text-xs text-muted-foreground">{c.members} Personen</span>
                      </TargetButton>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {friends.length > 0 ? (
              <div>
                {chats.length > 0 ? <p className="mb-1.5 text-xs font-extrabold text-muted-foreground">Freunde</p> : null}
                <ul className="space-y-1">
                  {friends.map((f) => (
                    <li key={f.id}>
                      <TargetButton active={selected === `f:${f.id}`} onSelect={() => setSelected(`f:${f.id}`)}>
                        <Avatar name={f.name} src={f.avatarUrl} size="xs" />
                        <span className="truncate font-semibold">{f.name}</span>
                        <span className="truncate text-xs text-muted-foreground">@{f.username}</span>
                      </TargetButton>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
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

function TargetButton({ active, onSelect, children }: { active: boolean; onSelect: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onSelect}
      className={`flex min-h-11 w-full items-center gap-2 rounded-2xl border-2 px-3 py-2 text-left text-sm transition ${active ? "border-primary bg-primary-soft" : "border-border hover:bg-surface-muted"}`}
    >
      {children}
    </button>
  );
}
