import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import type { UserRow as UserRowData } from "@/lib/moderation/queries";
import { formatDate, formatRelative } from "@/lib/utils";
import { RoleBadge, UserStatusBadge } from "./badges";

/** Table row of the member list. Expects a table with the columns Mitglied · Rolle · Status · Dabei seit · Zuletzt aktiv. */
export function UserRow({ user }: { user: UserRowData }) {
  return (
    <tr className="border-border border-t align-top">
      <td className="py-3 pr-4">
        <div className="flex items-start gap-3">
          <Avatar name={user.name} src={user.avatarUrl} size="sm" className="mt-0.5" />
          <div className="min-w-0">
            <Link
              href={`/admin/mitglieder/${user.id}`}
              className="text-foreground font-medium underline-offset-4 hover:underline"
            >
              {user.name}
            </Link>
            <p className="text-muted-foreground truncate text-xs">
              @{user.username} · {user.email}
              {!user.emailVerifiedAt ? <span className="text-warning ml-1">(unbestätigt)</span> : null}
            </p>
          </div>
        </div>
      </td>
      <td className="py-3 pr-4">
        <RoleBadge role={user.role} />
      </td>
      <td className="py-3 pr-4">
        <UserStatusBadge status={user.status} />
      </td>
      <td className="text-muted-foreground py-3 pr-4 text-sm whitespace-nowrap">
        <time dateTime={user.createdAt.toISOString()}>{formatDate(user.createdAt, "d. MMM yyyy")}</time>
      </td>
      <td className="text-muted-foreground py-3 text-sm whitespace-nowrap">
        {user.lastSeenAt ? (
          <time dateTime={user.lastSeenAt.toISOString()}>{formatRelative(user.lastSeenAt)}</time>
        ) : (
          "–"
        )}
      </td>
    </tr>
  );
}
