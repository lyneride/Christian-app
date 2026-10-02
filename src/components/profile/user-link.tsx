import Link from "next/link";
import { Avatar, type AvatarProps } from "@/components/ui/avatar";
import { profilePath } from "@/lib/profile";
import { cn } from "@/lib/utils";

export interface UserLinkUser {
  name: string;
  username: string;
  avatarUrl?: string | null;
  /** Deleted members are rendered as plain text without a link. */
  status?: "ACTIVE" | "SUSPENDED" | "DELETED";
}

export interface UserLinkProps {
  user: UserLinkUser;
  size?: AvatarProps["size"];
  showUsername?: boolean;
  className?: string;
}

/** Avatar + name + @username as an inline link to the member's profile (`/@username`). */
export function UserLink({ user, size = "xs", showUsername = true, className }: UserLinkProps) {
  const classes = cn("inline-flex min-w-0 max-w-full items-center gap-2 text-sm", className);
  const content = (
    <>
      <Avatar name={user.name} src={user.avatarUrl} size={size} />
      <span className="truncate font-medium text-foreground">{user.name}</span>
      {showUsername && user.status !== "DELETED" ? (
        <span className="truncate text-muted-foreground">@{user.username}</span>
      ) : null}
    </>
  );
  if (user.status === "DELETED") return <span className={classes}>{content}</span>;
  return (
    <Link
      href={profilePath(user.username)}
      className={cn(classes, "rounded-md underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring")}
    >
      {content}
    </Link>
  );
}
