import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Users } from "lucide-react";
import { getCurrentUser, isModerator } from "@/lib/auth/dal";
import { markdownToText, renderMarkdown } from "@/lib/markdown";
import { moreSupportersLabel, supportSummary } from "@/lib/prayer/format";
import { getPrayerRequest, listSupporters } from "@/lib/prayer/queries";
import { formatDate, formatRelative } from "@/lib/utils";
import { CommentForm } from "@/components/comments/comment-form";
import { CommentList } from "@/components/comments/comment-list";
import { MarkdownBody } from "@/components/content/markdown-body";
import { ReportButton } from "@/components/moderation/report-button";
import { AuthorLine } from "@/components/prayer/author-line";
import { PrayButton } from "@/components/prayer/pray-button";
import { canRevealAuthor, categoryLabel, StatusBadge } from "@/components/prayer/prayer-card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { OwnerActions } from "./owner-actions";

export async function generateMetadata({ params }: PageProps<"/gebet/[id]">): Promise<Metadata> {
  const { id } = await params;
  const user = await getCurrentUser();
  const request = await getPrayerRequest(id, user);
  if (!request) return { title: "Anliegen" };
  return { title: request.title, description: markdownToText(request.body, 160) };
}

export default async function AnliegenPage(props: PageProps<"/gebet/[id]">) {
  const { id } = await props.params;
  const user = await getCurrentUser();
  const request = await getPrayerRequest(id, user);
  if (!request) notFound();

  const viewer = user ? { id: user.id, role: user.role } : null;
  const isOwner = viewer?.id === request.authorId;
  const canDelete = isOwner || isModerator(user);
  const supporters = await listSupporters(request.id, 12);
  const path = `/gebet/${request.id}`;
  const target = { prayerRequestId: request.id } as const;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <Link
        href="/gebet"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Zur Gebetswand
      </Link>

      <article className="mt-4">
        <header className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary">{categoryLabel(request.category)}</Badge>
            <StatusBadge status={request.status} />
            {request.visibility === "GROUP" && request.group ? (
              <Badge variant="outline">
                <Users aria-hidden="true" className="size-3" /> Nur Gruppe „{request.group.name}“
              </Badge>
            ) : null}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{request.title}</h1>
          <AuthorLine
            author={request.author}
            isAnonymous={request.isAnonymous}
            reveal={canRevealAuthor(viewer, request.authorId)}
            meta={<time dateTime={request.createdAt.toISOString()}>{formatRelative(request.createdAt)}</time>}
          />
        </header>

        <MarkdownBody html={renderMarkdown(request.body)} className="mt-6 text-base" />

        {request.status === "ANSWERED" ? (
          <aside className="rounded-card bg-accent-soft mt-8 p-5 sm:p-6" aria-labelledby="erhoert-titel">
            <h2
              id="erhoert-titel"
              className="text-accent-foreground/80 dark:text-accent text-xs font-semibold tracking-wide uppercase"
            >
              So hat Gott geantwortet
            </h2>
            {request.answerNote ? (
              <MarkdownBody
                html={renderMarkdown(request.answerNote, { headings: false })}
                className="text-foreground mt-3 font-serif text-lg leading-relaxed"
              />
            ) : (
              <p className="mt-3 font-serif text-lg leading-relaxed">Dieses Anliegen wurde als erhört markiert.</p>
            )}
            {request.answeredAt ? (
              <p className="text-muted-foreground mt-3 text-xs">Erhört am {formatDate(request.answeredAt)}</p>
            ) : null}
          </aside>
        ) : null}

        <section
          className="rounded-card border-border bg-surface shadow-soft mt-8 border p-5"
          aria-labelledby="mitbeten-titel"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p id="mitbeten-titel" className="text-muted-foreground text-sm">
              {supportSummary({ total: request.supporters, today: request.today })}
            </p>
            <PrayButton
              requestId={request.id}
              prayed={request.prayedToday}
              signedIn={viewer !== null}
              nextPath={path}
              size="md"
            />
          </div>
          {supporters.users.length > 0 ? (
            <ul className="mt-4 flex flex-wrap items-center gap-2" aria-label="Menschen, die mitgebetet haben">
              {supporters.users.map((u) => (
                <li key={u.id}>
                  <Link
                    href={`/@${u.username}`}
                    className="bg-surface-muted hover:bg-border inline-flex items-center gap-1.5 rounded-full py-1 pr-3 pl-1 text-xs font-medium"
                  >
                    <Avatar name={u.name} src={u.avatarUrl} size="xs" />
                    {u.name}
                  </Link>
                </li>
              ))}
              {supporters.more > 0 ? (
                <li className="text-muted-foreground text-xs">{moreSupportersLabel(supporters.more)}</li>
              ) : null}
            </ul>
          ) : null}
        </section>

        {canDelete || (viewer && !isOwner) ? (
          <div className="mt-6 space-y-4">
            {canDelete ? (
              <OwnerActions id={request.id} status={request.status} canEdit={isOwner} canDelete={canDelete} />
            ) : null}
            {viewer && !isOwner ? <ReportButton targetType="prayer" targetId={request.id} signedIn /> : null}
          </div>
        ) : null}

        <section id="ermutigungen" aria-labelledby="ermutigungen-titel" className="mt-10 scroll-mt-24">
          <h2 id="ermutigungen-titel" className="text-lg font-semibold">
            Ermutigungen
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Ein Wort, ein Vers, ein kurzes „Ich denke an dich“ – alles hilft.
          </p>
          <div className="mt-5">
            <CommentList
              target={target}
              viewer={viewer}
              emptyText="Noch keine Ermutigung. Vielleicht magst du die erste schreiben?"
              replyLabel="Antwort schreiben"
            />
          </div>
          <div className="border-border mt-6 border-t pt-6">
            {viewer ? (
              <CommentForm target={target} label="Ermutigung schreiben" submitLabel="Ermutigung senden" />
            ) : (
              <p className="text-muted-foreground text-sm">
                <Link
                  href={`/anmelden?next=${encodeURIComponent(path)}`}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Melde dich an
                </Link>
                , um eine Ermutigung zu schreiben.
              </p>
            )}
          </div>
        </section>
      </article>
    </main>
  );
}
