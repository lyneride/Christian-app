import Link from "next/link";
import { CalendarDays, Church, HandHeart, MapPin, MessageCircle, Pencil, UserPlus } from "lucide-react";
import { FollowButton } from "@/components/profile/follow-button";
import { MarkdownBody } from "@/components/profile/markdown-body";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { renderMarkdown } from "@/lib/markdown";
import { profilePath } from "@/lib/profile";
import { formatDate } from "@/lib/utils";
import type { ProfileStats, ProfileUser } from "./queries";

interface Props {
  user: ProfileUser;
  stats: ProfileStats;
  isOwner: boolean;
  signedIn: boolean;
  following: boolean;
}

export function ProfileHeader({ user, stats, isOwner, signedIn, following }: Props) {
  const next = encodeURIComponent(profilePath(user.username));
  const counts = [
    { label: "Öffentliche Beiträge", value: stats.posts },
    { label: "Gebetsanliegen", value: stats.prayers },
    { label: "Gruppen", value: stats.groups },
    { label: "Follower", value: stats.followers },
    { label: "Folgt", value: stats.following },
  ];

  return (
    <Card>
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <Avatar name={user.name} src={user.avatarUrl} size="xl" className="mx-auto sm:mx-0" />
          <div className="min-w-0 flex-1 space-y-4 text-center sm:text-left">
            <div>
              <h1 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">{user.name}</h1>
              <p className="text-muted-foreground">@{user.username}</p>
            </div>

            {user.openForPartner || user.role !== "USER" ? (
              <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                {user.openForPartner ? (
                  <Badge variant="accent">
                    <HandHeart className="size-3.5" aria-hidden="true" />
                    Offen für Gebetspartnerschaft
                  </Badge>
                ) : null}
                {user.role !== "USER" ? <Badge variant="primary">Moderation</Badge> : null}
              </div>
            ) : null}

            {user.bio ? <MarkdownBody html={renderMarkdown(user.bio, { headings: false })} className="mx-auto max-w-prose sm:mx-0" /> : null}

            <dl className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-sm text-muted-foreground sm:justify-start">
              {user.location ? (
                <div className="flex items-center gap-1.5">
                  <dt className="sr-only">Ort</dt>
                  <MapPin className="size-4" aria-hidden="true" />
                  <dd>{user.location}</dd>
                </div>
              ) : null}
              {user.church ? (
                <div className="flex items-center gap-1.5">
                  <dt className="sr-only">Gemeinde</dt>
                  <Church className="size-4" aria-hidden="true" />
                  <dd>{user.church}</dd>
                </div>
              ) : null}
              <div className="flex items-center gap-1.5">
                <dt className="sr-only">Mitglied seit</dt>
                <CalendarDays className="size-4" aria-hidden="true" />
                <dd>Dabei seit {formatDate(user.createdAt, "MMMM yyyy")}</dd>
              </div>
            </dl>

            <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
              {isOwner ? (
                <ButtonLink href="/einstellungen/profil" variant="outline">
                  <Pencil aria-hidden="true" />
                  Bearbeiten
                </ButtonLink>
              ) : signedIn ? (
                <>
                  <FollowButton username={user.username} following={following} />
                  <ButtonLink href={`/nachrichten/neu?an=${encodeURIComponent(user.username)}`} variant="outline">
                    <MessageCircle aria-hidden="true" />
                    Nachricht
                  </ButtonLink>
                </>
              ) : (
                <ButtonLink href={`/anmelden?next=${next}`}>
                  <UserPlus aria-hidden="true" />
                  Folgen
                </ButtonLink>
              )}
            </div>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-border pt-5 sm:grid-cols-5">
          {counts.map((c) => (
            <div key={c.label} className="text-center sm:text-left">
              <dd className="text-xl font-semibold tabular-nums">{c.value}</dd>
              <dt className="text-xs text-muted-foreground">{c.label}</dt>
            </div>
          ))}
        </dl>
        {isOwner ? (
          <p className="mt-4 text-xs text-muted-foreground">
            So sehen andere dein Profil. Was sichtbar ist, legst du in den{" "}
            <Link href="/einstellungen/profil" className="text-primary underline-offset-4 hover:underline">
              Einstellungen
            </Link>{" "}
            fest.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
