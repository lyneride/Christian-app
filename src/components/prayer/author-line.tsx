import type { ReactNode } from "react";
import Link from "next/link";
import { UserRound } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface AuthorLineAuthor {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
}

const avatarSizes = {
  xs: "size-6 [&_svg]:size-3.5",
  sm: "size-8 [&_svg]:size-4",
  md: "size-10 [&_svg]:size-5",
} as const;

/**
 * Avatar + name + @username linking to the profile. For anonymous content the
 * author is hidden ("Anonym") unless `reveal` is set (author or moderator).
 * Minimal local version; can be swapped for a shared profile user-link later.
 */
export function AuthorLine({
  author,
  isAnonymous = false,
  reveal = false,
  size = "sm",
  meta,
  className,
}: {
  author: AuthorLineAuthor;
  isAnonymous?: boolean;
  reveal?: boolean;
  size?: "xs" | "sm" | "md";
  /** Extra text after the name, e.g. the relative time. */
  meta?: ReactNode;
  className?: string;
}) {
  const hidden = isAnonymous && !reveal;
  const textSize = size === "xs" ? "text-xs" : "text-sm";

  return (
    <div className={cn("flex min-w-0 items-center gap-2", textSize, className)}>
      {hidden ? (
        <span
          aria-hidden="true"
          className={cn(
            "bg-surface-muted text-muted-foreground inline-flex shrink-0 items-center justify-center rounded-full",
            avatarSizes[size],
          )}
        >
          <UserRound />
        </span>
      ) : (
        <Avatar name={author.name} src={author.avatarUrl} size={size} />
      )}
      <div className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-0">
        {hidden ? (
          <span className="text-foreground font-medium">Anonym</span>
        ) : (
          <Link href={`/@${author.username}`} className="text-foreground truncate font-medium hover:underline">
            {author.name}
          </Link>
        )}
        {!hidden ? <span className="text-muted-foreground truncate">@{author.username}</span> : null}
        {isAnonymous && reveal ? (
          <span className="bg-surface-muted text-muted-foreground rounded-full px-1.5 py-0.5 text-[11px]">
            anonym geteilt
          </span>
        ) : null}
        {meta ? <span className="text-muted-foreground">· {meta}</span> : null}
      </div>
    </div>
  );
}
