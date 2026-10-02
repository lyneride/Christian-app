import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { ReactivateUserForm, SetRoleForm, SuspendUserForm } from "@/components/admin/action-forms";
import { RoleBadge, UserStatusBadge } from "@/components/admin/badges";
import { ReportRow } from "@/components/admin/report-row";
import { StatCard } from "@/components/admin/stat-card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isAdmin, requireRole } from "@/lib/auth/dal";
import {
  getUserDetail,
  listReportsAgainstUser,
  listUserContent,
  loadReportTargets,
  reportTargetKey,
  type ContentItem,
} from "@/lib/moderation/queries";
import { profilePath } from "@/lib/profile";
import { formatDate, formatDateTime, formatRelative } from "@/lib/utils";

export async function generateMetadata(props: PageProps<"/admin/mitglieder/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const member = await getUserDetail(id);
  return { title: member ? member.name : "Mitglied" };
}

function ContentList({ title, items, emptyText }: { title: string; items: ContentItem[]; emptyText: string }) {
  return (
    <section aria-label={title}>
      <h3 className="text-sm font-semibold">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <ul className="mt-2 divide-y divide-border">
          {items.map((item) => (
            <li key={item.id} className="py-2.5 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                {item.href && !item.deleted ? (
                  <Link href={item.href} className="font-medium text-primary underline-offset-4 hover:underline">
                    {item.title}
                  </Link>
                ) : (
                  <span className="font-medium">{item.title}</span>
                )}
                {item.deleted ? <Badge variant="danger">Entfernt</Badge> : null}
                <time dateTime={item.createdAt.toISOString()} className="text-xs text-muted-foreground">
                  {formatRelative(item.createdAt)}
                </time>
              </div>
              {item.excerpt ? <p className="mt-0.5 line-clamp-2 text-muted-foreground">{item.excerpt}</p> : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default async function MemberDetailPage(props: PageProps<"/admin/mitglieder/[id]">) {
  const { id } = await props.params;
  const viewer = await requireRole("MODERATOR", `/admin/mitglieder/${id}`);
  const member = await getUserDetail(id);
  if (!member) notFound();

  const [content, reportsAgainst] = await Promise.all([listUserContent(member.id), listReportsAgainstUser(member.id)]);
  const targets = await loadReportTargets(reportsAgainst);

  const isSelf = viewer.id === member.id;
  const admin = isAdmin(viewer);
  const canModerate = !isSelf && member.status !== "DELETED" && (member.role === "USER" || admin);

  return (
    <article className="space-y-8">
      <div>
        <Link href="/admin/mitglieder" className="inline-flex items-center gap-1 text-sm text-muted-foreground underline-offset-4 hover:underline">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Alle Mitglieder
        </Link>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
          <Avatar name={member.name} src={member.avatarUrl} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">{member.name}</h1>
              <RoleBadge role={member.role} />
              <UserStatusBadge status={member.status} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              @{member.username} · {member.email}
              {member.emailVerifiedAt ? "" : <span className="text-warning"> (E-Mail unbestätigt)</span>}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Dabei seit <time dateTime={member.createdAt.toISOString()}>{formatDate(member.createdAt)}</time>
              {member.lastSeenAt ? (
                <>
                  {" "}
                  · zuletzt aktiv <time dateTime={member.lastSeenAt.toISOString()}>{formatDateTime(member.lastSeenAt)}</time>
                </>
              ) : (
                " · noch nie aktiv"
              )}
            </p>
            {member.location || member.church ? (
              <p className="mt-1 text-sm text-muted-foreground">{[member.location, member.church].filter(Boolean).join(" · ")}</p>
            ) : null}
            {member.bio ? <p className="mt-3 max-w-prose text-sm whitespace-pre-wrap">{member.bio}</p> : null}
            <p className="mt-3 text-sm">
              <Link href={profilePath(member.username)} className="inline-flex items-center gap-1 font-medium text-primary underline-offset-4 hover:underline">
                Öffentliches Profil
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Beiträge" value={member._count.posts} />
        <StatCard label="Kommentare" value={member._count.comments} />
        <StatCard label="Gebetsanliegen" value={member._count.prayerRequests} />
        <StatCard label="Gemeldet" value={member._count.reportsMade} hint="selbst gemeldet" />
        <StatCard label="Meldungen" value={member.reportsAgainst} hint="gegen dieses Mitglied" tone={member.reportsAgainst > 0 ? "warning" : "default"} />
        <StatCard label="Sitzungen" value={member.activeSessions} hint="aktive Geräte" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-start">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Neueste Inhalte</CardTitle>
              <CardDescription>Entfernte Inhalte sind markiert und bleiben hier sichtbar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ContentList title="Beiträge" items={content.posts} emptyText="Keine Beiträge." />
              <ContentList title="Kommentare" items={content.comments} emptyText="Keine Kommentare." />
              <ContentList title="Gebetsanliegen" items={content.prayers} emptyText="Keine Gebetsanliegen." />
            </CardContent>
          </Card>

          <section aria-labelledby="reports-against-heading">
            <h2 id="reports-against-heading" className="text-lg font-semibold tracking-tight">
              Meldungen zu diesem Mitglied
            </h2>
            {reportsAgainst.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">Keine Meldungen zum Profil oder zu Inhalten dieses Mitglieds.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {reportsAgainst.map((report) => (
                  <ReportRow key={report.id} report={report} target={targets.get(reportTargetKey(report)) ?? null} />
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-6" aria-label="Maßnahmen">
          <Card>
            <CardHeader>
              <CardTitle>Konto</CardTitle>
              <CardDescription>
                {member.status === "SUSPENDED"
                  ? "Gesperrte Mitglieder können sich nicht anmelden."
                  : member.status === "DELETED"
                    ? "Das Konto wurde gelöscht."
                    : "Eine Sperre beendet alle Sitzungen und verhindert die Anmeldung."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSelf ? (
                <p className="text-sm text-muted-foreground">Das bist du selbst.</p>
              ) : !canModerate ? (
                <p className="text-sm text-muted-foreground">
                  {member.status === "DELETED"
                    ? "Keine Maßnahme möglich."
                    : "Mitglieder mit Moderations- oder Admin-Rolle kann nur die Administration sperren."}
                </p>
              ) : member.status === "SUSPENDED" ? (
                <ReactivateUserForm userId={member.id} name={member.name} />
              ) : (
                <SuspendUserForm userId={member.id} name={member.name} />
              )}
            </CardContent>
          </Card>

          {admin ? (
            <Card>
              <CardHeader>
                <CardTitle>Rolle</CardTitle>
                <CardDescription>Nur die Administration kann Rollen vergeben.</CardDescription>
              </CardHeader>
              <CardContent>
                {isSelf ? (
                  <p className="text-sm text-muted-foreground">Deine eigene Rolle kannst du nicht ändern.</p>
                ) : member.status === "DELETED" ? (
                  <p className="text-sm text-muted-foreground">Keine Maßnahme möglich.</p>
                ) : (
                  <SetRoleForm userId={member.id} currentRole={member.role} />
                )}
              </CardContent>
            </Card>
          ) : null}

          <p className="text-xs text-muted-foreground">
            <Link href={`/admin/protokoll?akteur=${member.id}`} className="underline-offset-4 hover:underline">
              Protokoll-Einträge dieses Mitglieds
            </Link>
          </p>
        </aside>
      </div>
    </article>
  );
}
