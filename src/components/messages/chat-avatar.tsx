import { Users } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import type { Participant } from "@/lib/messages/queries";
import { cn } from "@/lib/utils";

/** Avatar of a chat: the partner for 1:1 chats, two overlapping faces or a group badge for group chats. */
export function ChatAvatar({
  isGroup,
  others,
  size = "md",
  className,
}: {
  isGroup: boolean;
  others: Participant[];
  size?: "sm" | "md";
  className?: string;
}) {
  if (!isGroup) {
    const first = others[0];
    return <Avatar name={first?.name ?? "?"} src={first?.avatarUrl} size={size} className={className} />;
  }
  const box = size === "sm" ? "size-8" : "size-10";
  if (others.length < 2) {
    return (
      <span
        aria-hidden="true"
        className={cn("inline-flex shrink-0 items-center justify-center rounded-full bg-area-gemeinschaft-soft text-area-gemeinschaft", box, className)}
      >
        <Users className={size === "sm" ? "size-4" : "size-5"} />
      </span>
    );
  }
  const [a, b] = others;
  return (
    <span aria-hidden="true" className={cn("relative inline-block shrink-0", box, className)}>
      <Avatar name={a.name} src={a.avatarUrl} size="xs" className={cn("absolute left-0 top-0 ring-2 ring-surface", size === "md" && "size-7")} />
      <Avatar name={b.name} src={b.avatarUrl} size="xs" className={cn("absolute right-0 bottom-0 ring-2 ring-surface", size === "md" && "size-7")} />
    </span>
  );
}

/** Title of a chat for lists and headers. */
export function chatTitle(chat: { isGroup: boolean; title: string | null; others: Participant[] }): string {
  if (chat.title) return chat.title;
  if (chat.others.length === 0) return chat.isGroup ? "Gruppenchat" : "Ehemaliges Mitglied";
  return chat.others.map((u) => u.name).join(", ");
}

/** First name for compact "Mara: …" previews. */
export function firstName(name: string): string {
  return name.split(/\s+/)[0] ?? name;
}
