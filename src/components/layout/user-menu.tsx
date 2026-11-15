import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/dal";
import { Avatar } from "@/components/ui/avatar";
import { buttonClasses } from "@/components/ui/button";
import { UserMenuDropdown } from "./user-menu-dropdown";

export function UserMenuSkeleton() {
  return <div className="hidden size-10 animate-pulse rounded-full bg-surface-muted md:block" aria-hidden="true" />;
}

export async function UserMenu() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/anmelden" className={buttonClasses("outline", "sm")}>
          Anmelden
        </Link>
        <Link href="/registrieren" className={buttonClasses("primary", "sm", "hidden md:inline-flex")}>
          Mitmachen
        </Link>
      </div>
    );
  }
  return (
    <div className="hidden md:block">
    <UserMenuDropdown
      user={{ name: user.name, username: user.username, avatarUrl: user.avatarUrl, role: user.role }}
      trigger={<Avatar name={user.name} src={user.avatarUrl} size="md" />}
    />
    </div>
  );
}
