"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Bell, BookMarked, LogOut, Settings, Shield, UserRound, NotebookPen } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  user: { name: string; username: string; avatarUrl: string | null; role: "USER" | "MODERATOR" | "ADMIN" };
  trigger: ReactNode;
}

export function UserMenuDropdown({ user, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const items = [
    { href: "/start", label: "Mein Bereich", icon: UserRound },
    { href: `/@${user.username}`, label: "Mein Profil", icon: BookMarked },
    { href: "/tagebuch", label: "Tagebuch", icon: NotebookPen },
    { href: "/benachrichtigungen", label: "Benachrichtigungen", icon: Bell },
    { href: "/einstellungen", label: "Einstellungen", icon: Settings },
    ...(user.role !== "USER" ? [{ href: "/admin", label: "Moderation", icon: Shield }] : []),
  ];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        className="flex items-center rounded-full ring-offset-2 ring-offset-background focus-visible:outline-2 focus-visible:outline-ring"
        aria-label={`Menü von ${user.name}`}
      >
        {trigger}
      </button>
      <div
        id={menuId}
        role="menu"
        className={cn(
          "absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-border bg-surface p-1.5 shadow-soft",
          open ? "block" : "hidden",
        )}
      >
        <div className="px-2.5 py-2">
          <p className="truncate text-sm font-semibold">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">@{user.username}</p>
        </div>
        <div className="my-1 h-px bg-border" />
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm hover:bg-surface-muted"
          >
            <item.icon className="size-4 text-muted-foreground" aria-hidden="true" />
            {item.label}
          </Link>
        ))}
        <div className="my-1 h-px bg-border" />
        <form method="post" action="/abmelden">
          <button
            type="submit"
            role="menuitem"
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm hover:bg-surface-muted"
          >
            <LogOut className="size-4 text-muted-foreground" aria-hidden="true" />
            Abmelden
          </button>
        </form>
      </div>
    </div>
  );
}
