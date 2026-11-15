import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/dal";
import { getFriendState } from "@/lib/friends/queries";
import { findInviter } from "@/lib/friends/invites";
import { invitePath, parseInviteCode } from "@/lib/friends/invite-code";
import { Avatar } from "@/components/ui/avatar";
import { buttonClasses } from "@/components/ui/button";
import { Rebi, RebiBubble } from "@/components/rebi/rebi";
import { AcceptInviteButton } from "@/components/friends/accept-invite-button";

type Props = PageProps<"/einladung/[code]">;

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { code } = await props.params;
  const inviter = await findInviter(code);
  return {
    title: inviter ? `Einladung von ${inviter.name}` : "Einladung",
    description: "Komm zu Bleibe – Bibel lesen, beten und Gemeinschaft erleben.",
    robots: { index: false },
  };
}

export default async function InvitePage(props: Props) {
  const { code: rawCode } = await props.params;
  const code = parseInviteCode(rawCode);
  const [inviter, viewer] = await Promise.all([findInviter(code), getCurrentUser()]);

  if (!code || !inviter) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center px-4 py-10 text-center">
        <Rebi pose="think" size={140} priority />
        <h1 className="mt-4 text-[28px] leading-tight">Dieser Link gilt nicht mehr</h1>
        <p className="mt-2 text-muted-foreground">
          Vielleicht wurde ein neuer Einladungslink erstellt. Frag die Person, die dich eingeladen hat, einfach nach dem aktuellen.
        </p>
        <Link href={viewer ? "/start" : "/"} className={buttonClasses("primary", "md", "mt-6")}>
          Zu Bleibe
        </Link>
      </main>
    );
  }

  const state = viewer ? await getFriendState(viewer.id, inviter.id) : null;
  const self = viewer?.id === inviter.id;
  const back = encodeURIComponent(invitePath(code));

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center px-4 py-8 text-center sm:py-12">
      <div className="flex items-end gap-2">
        <Rebi pose="wave" size={120} priority />
        <RebiBubble tail="left" className="mb-12 max-w-44 text-left">
          {self ? "Das ist dein Link!" : "Schön, dass du da bist!"}
        </RebiBubble>
      </div>

      <div className="mt-4 w-full rounded-card border border-border bg-surface p-6 shadow-pop">
        <Avatar name={inviter.name} src={inviter.avatarUrl} size="xl" className="mx-auto" />
        <h1 className="mt-4 text-[26px] leading-tight">
          {self ? "Dein Einladungslink" : `${inviter.name} lädt dich zu Bleibe ein`}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {self
            ? "Teile ihn mit Menschen, die du kennst. Wer ihn öffnet, ist sofort mit dir befreundet."
            : "Bleibe ist ein werbefreier Ort zum Bibellesen, Beten und für Gemeinschaft. Als Freunde könnt ihr gemeinsam Lesepläne machen und euch schreiben."}
        </p>

        <div className="mt-6">
          {self ? (
            <Link href="/freunde#einladen" className={buttonClasses("primary", "lg", "w-full sm:w-auto")}>
              Link teilen
            </Link>
          ) : !viewer ? (
            <div className="grid gap-2">
              <Link href={`/registrieren?einladung=${code}`} className={buttonClasses("primary", "lg")}>
                Kostenlos mitmachen
              </Link>
              <Link href={`/anmelden?next=${back}`} className={buttonClasses("outline", "lg")}>
                Ich habe schon ein Konto
              </Link>
            </div>
          ) : state?.kind === "friends" ? (
            <div className="space-y-4">
              <p className="font-display text-lg font-extrabold text-success">Du und {inviter.name} seid Freunde.</p>
              <Link href={`/@${inviter.username}`} className={buttonClasses("outline", "md")}>
                Profil ansehen
              </Link>
            </div>
          ) : (
            <AcceptInviteButton code={code} inviterUsername={inviter.username} />
          )}
        </div>
      </div>
    </main>
  );
}
