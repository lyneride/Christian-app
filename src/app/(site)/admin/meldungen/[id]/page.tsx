import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  ReactivateUserForm,
  RemoveContentForm,
  ResolveReportForm,
  RestoreContentForm,
  SuspendUserForm,
} from "@/components/admin/action-forms";
import { ReasonBadge, ReportStatusBadge, reasonLabel, targetTypeLabel } from "@/components/admin/badges";
import { TargetPreview } from "@/components/admin/target-preview";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/dal";
import { getReport, listReportsForTarget, loadReportTarget } from "@/lib/moderation/queries";
import { formatDateTime, formatRelative } from "@/lib/utils";

export async function generateMetadata(props: PageProps<"/admin/meldungen/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const report = await getReport(id);
  return { title: report ? `Meldung: ${targetTypeLabel(report.targetType)}` : "Meldung" };
}

export default async function ReportDetailPage(props: PageProps<"/admin/meldungen/[id]">) {
  const { id } = await props.params;
  const viewer = await requireRole("MODERATOR", `/admin/meldungen/${id}`);
  const report = await getReport(id);
  if (!report) notFound();

  const [target, previous] = await Promise.all([
    loadReportTarget(report.targetType, report.targetId),
    listReportsForTarget(report.targetType, report.targetId, report.id),
  ]);

  const removable = target !== null && report.targetType !== "user" && report.targetType !== "message";
  const author = target?.authorId ? target : null;
  const authorActionable = author !== null && author.authorId !== viewer.id && author.authorStatus !== "DELETED";

  return (
    <article className="space-y-8">
      <div>
        <Link
          href="/admin/meldungen"
          className="text-muted-foreground inline-flex items-center gap-1 text-sm underline-offset-4 hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Alle Meldungen
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Meldung: {targetTypeLabel(report.targetType)}</h1>
          <ReportStatusBadge status={report.status} />
          <ReasonBadge reason={report.reason} />
        </div>
        <p className="text-muted-foreground mt-1 text-sm">
          Eingegangen am <time dateTime={report.createdAt.toISOString()}>{formatDateTime(report.createdAt)}</time>
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-start">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gemeldeter Inhalt</CardTitle>
              <CardDescription>
                So sieht die Moderation den Inhalt – unabhängig von seiner Sichtbarkeit.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TargetPreview target={target} targetType={report.targetType} targetId={report.targetId} />
              {target?.authorId ? (
                <p className="mt-3 text-sm">
                  <Link
                    href={`/admin/mitglieder/${target.authorId}`}
                    className="text-primary font-medium underline-offset-4 hover:underline"
                  >
                    Mitglied verwalten
                  </Link>
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Meldung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Avatar name={report.reporter.name} src={report.reporter.avatarUrl} size="sm" />
                <div className="text-sm">
                  <Link
                    href={`/admin/mitglieder/${report.reporter.id}`}
                    className="font-medium underline-offset-4 hover:underline"
                  >
                    {report.reporter.name}
                  </Link>
                  <p className="text-muted-foreground">
                    @{report.reporter.username} · {formatRelative(report.createdAt)}
                  </p>
                </div>
              </div>
              <dl className="grid gap-3 text-sm sm:grid-cols-[8rem_1fr]">
                <dt className="text-muted-foreground">Grund</dt>
                <dd>{reasonLabel(report.reason)}</dd>
                <dt className="text-muted-foreground">Beschreibung</dt>
                <dd>
                  {report.details ? (
                    <blockquote className="border-border border-l-2 pl-3 whitespace-pre-wrap">
                      {report.details}
                    </blockquote>
                  ) : (
                    <span className="text-muted-foreground">Keine weiteren Angaben.</span>
                  )}
                </dd>
              </dl>
            </CardContent>
          </Card>

          {report.status !== "OPEN" ? (
            <Card>
              <CardHeader>
                <CardTitle>Entscheidung</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-3 text-sm sm:grid-cols-[8rem_1fr]">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd>
                    <ReportStatusBadge status={report.status} />
                  </dd>
                  <dt className="text-muted-foreground">Durch</dt>
                  <dd>
                    {report.resolvedBy ? (
                      <Link
                        href={`/admin/mitglieder/${report.resolvedBy.id}`}
                        className="font-medium underline-offset-4 hover:underline"
                      >
                        {report.resolvedBy.name}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">Unbekannt</span>
                    )}
                    {report.resolvedAt ? (
                      <span className="text-muted-foreground"> · {formatDateTime(report.resolvedAt)}</span>
                    ) : null}
                  </dd>
                  <dt className="text-muted-foreground">Notiz</dt>
                  <dd>
                    {report.resolution ? (
                      <span className="whitespace-pre-wrap">{report.resolution}</span>
                    ) : (
                      <span className="text-muted-foreground">Keine Notiz.</span>
                    )}
                  </dd>
                </dl>
              </CardContent>
            </Card>
          ) : null}

          {previous.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Weitere Meldungen zu diesem Inhalt</CardTitle>
                <CardDescription>Mehrere unabhängige Meldungen sind ein Hinweis, aber kein Urteil.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="divide-border divide-y text-sm">
                  {previous.map((r) => (
                    <li key={r.id} className="flex flex-wrap items-center gap-2 py-2.5">
                      <ReasonBadge reason={r.reason} />
                      <ReportStatusBadge status={r.status} />
                      <span className="text-muted-foreground">
                        von {r.reporter.name} · {formatRelative(r.createdAt)}
                      </span>
                      <Link
                        href={`/admin/meldungen/${r.id}`}
                        className="text-primary ml-auto font-medium underline-offset-4 hover:underline"
                      >
                        Öffnen
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <aside className="space-y-6" aria-label="Maßnahmen">
          <Card>
            <CardHeader>
              <CardTitle>Inhalt</CardTitle>
              <CardDescription>
                {removable
                  ? target?.deleted
                    ? "Der Inhalt ist zurzeit nicht sichtbar."
                    : "Entfernte Inhalte bleiben gespeichert und können wiederhergestellt werden."
                  : report.targetType === "message"
                    ? "Private Nachrichten werden nicht entfernt. Bei Verstößen kannst du das Mitglied sperren."
                    : report.targetType === "user"
                      ? "Profile werden nicht entfernt. Bei Verstößen kannst du das Mitglied sperren."
                      : "Der Inhalt existiert nicht mehr."}
              </CardDescription>
            </CardHeader>
            {removable ? (
              <CardContent>
                {target?.deleted ? (
                  <RestoreContentForm targetType={report.targetType} targetId={report.targetId} />
                ) : (
                  <RemoveContentForm targetType={report.targetType} targetId={report.targetId} />
                )}
              </CardContent>
            ) : null}
          </Card>

          {author ? (
            <Card>
              <CardHeader>
                <CardTitle>Mitglied</CardTitle>
                <CardDescription>
                  {author.authorName} (@{author.authorUsername})
                  {author.authorStatus === "SUSPENDED"
                    ? " ist zurzeit gesperrt."
                    : author.authorStatus === "DELETED"
                      ? " hat das Konto gelöscht."
                      : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!authorActionable ? (
                  <p className="text-muted-foreground text-sm">
                    {author.authorId === viewer.id ? "Das bist du selbst." : "Keine Maßnahme möglich."}
                  </p>
                ) : author.authorStatus === "SUSPENDED" ? (
                  <ReactivateUserForm userId={author.authorId as string} name={author.authorName ?? ""} />
                ) : (
                  <SuspendUserForm userId={author.authorId as string} name={author.authorName ?? ""} />
                )}
              </CardContent>
            </Card>
          ) : null}

          {report.status === "OPEN" ? (
            <Card>
              <CardHeader>
                <CardTitle>Meldung abschließen</CardTitle>
                <CardDescription>Die meldende Person erfährt, dass ihre Meldung bearbeitet wurde.</CardDescription>
              </CardHeader>
              <CardContent>
                <ResolveReportForm reportId={report.id} />
              </CardContent>
            </Card>
          ) : null}
        </aside>
      </div>
    </article>
  );
}
