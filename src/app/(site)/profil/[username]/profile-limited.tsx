import Link from "next/link";
import { Lock } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { profilePath } from "@/lib/profile";

/** Name and username only: shown to guests on MEMBERS profiles and to everyone but the owner on PRIVATE profiles. */
export function ProfileLimited({ user, signedIn }: { user: { name: string; username: string; avatarUrl: string | null }; signedIn: boolean }) {
  const next = encodeURIComponent(profilePath(user.username));
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <Avatar name={user.name} src={user.avatarUrl} size="xl" />
          <div>
            <h1 className="font-serif text-2xl font-semibold tracking-tight">{user.name}</h1>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-surface-muted px-3 py-1.5 text-sm text-muted-foreground">
            <Lock className="size-4" aria-hidden="true" />
            {signedIn ? "Dieses Profil ist privat." : "Dieses Profil ist nur für Mitglieder sichtbar."}
          </div>
          {signedIn ? null : (
            <div className="space-y-3">
              <ButtonLink href={`/anmelden?next=${next}`}>Anmelden, um mehr zu sehen</ButtonLink>
              <p className="text-sm text-muted-foreground">
                Noch kein Konto?{" "}
                <Link href="/registrieren" className="font-medium text-primary underline-offset-4 hover:underline">
                  Jetzt registrieren
                </Link>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
