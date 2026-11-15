import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/dal";
import { findInviter } from "@/lib/friends/invites";
import { invitePath, parseInviteCode } from "@/lib/friends/invite-code";
import { Avatar } from "@/components/ui/avatar";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Registrieren" };

export default async function RegistrierenPage(props: PageProps<"/registrieren">) {
  const sp = await props.searchParams;
  const code = parseInviteCode(Array.isArray(sp.einladung) ? sp.einladung[0] : sp.einladung);
  if (await getCurrentUser()) redirect(code ? invitePath(code) : "/start");
  const inviter = code ? await findInviter(code) : null;
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-[26px] leading-tight font-black">Konto erstellen</h1>
        <p className="text-muted-foreground text-sm">Kostenlos und werbefrei. Du brauchst nur eine E-Mail-Adresse.</p>
      </div>

      {inviter ? (
        <div className="flex items-center gap-3 rounded-card border border-area-ich/40 bg-area-ich-soft p-3">
          <Avatar name={inviter.name} src={inviter.avatarUrl} size="sm" />
          <p className="text-sm">
            <strong className="font-extrabold">{inviter.name}</strong> hat dich eingeladen. Nach der Anmeldung seid ihr gleich Freunde.
          </p>
        </div>
      ) : null}

      <RegisterForm invite={inviter && code ? code : undefined} />

      <p className="text-muted-foreground text-center text-sm">
        Schon ein Konto?{" "}
        <Link
          href={inviter && code ? `/anmelden?next=${encodeURIComponent(invitePath(code))}` : "/anmelden"}
          className="text-primary font-medium underline-offset-4 hover:underline"
        >
          Anmelden
        </Link>
      </p>
    </div>
  );
}
