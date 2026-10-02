import Link from "next/link";
import { Avatar, type AvatarProps } from "@/components/ui/avatar";
import { profilePath } from "@/lib/profile";
import { cn } from "@/lib/utils";

/**
 * Local fallback for the shared `@/components/profile/user-link` (not present
 * when the messaging feature was built): avatar + name linking to the profile.
 */

export interface UserLinkUser {
  name: string;
  username: string;
  avatarUrl?: string | null;
}

export function UserLink({
  user,
  size = "sm",
  showUsername = false,
  className,
}: {
  user: UserLinkUser;
  size?: AvatarProps["size"];
  showUsername?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={profilePath(user.username)}
      className={cn("inline-flex min-w-0 items-center gap-2 rounded-full text-sm font-medium hover:underline", className)}
    >
      <Avatar name={user.name} src={user.avatarUrl} size={size} />
      <span className="truncate">{user.name}</span>
      {showUsername ? <span className="truncate font-normal text-muted-foreground">@{user.username}</span> : null}
    </Link>
  );
}
