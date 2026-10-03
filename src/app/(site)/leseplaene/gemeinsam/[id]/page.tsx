import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Lightbulb, Users } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { listFriends } from "@/lib/friends/queries";
import { canViewPlanGroup, dayPosts, getDayReadings, getPlanGroup, memberProgress, sharedMarksForDay } from "@/lib/plans/shared";
import { renderMarkdown } from "@/lib/markdown";
import { Markdown } from "@/components/community/markdown";
import { MarkDayButton } from "@/components/plans/mark-day-button";
import { DayPostForm, DeleteDayPostButton } from "@/components/plans/day-post-form";
import { readingsLabel, spanPath, mergeReadings } from "@/lib/plans/progress";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/plans/progress-bar";
import { InviteFriendsForm } from "@/components/plans/invite-friends-form";
import { JoinPlanGroupButton, LeavePlanGroupButton, ShareHighlightsToggle } from "@/components/plans/shared-plan-buttons";
import { HIGHLIGHT_COLORS } from "@/components/study/highlight-colors";
import type { HighlightColor } from "@/lib/validation/study";
import { buttonClasses } from "@/components/ui/button";
import { formatRelative } from "@/lib/utils";

export async function generateMetadata(props: PageProps<"/leseplaene/gemeinsam/[id]">): Promise<Metadata> {
  const group = await getPlanGroup((await props.params).id);
  return { title: group ? group.name : "Gemeinsam lesen" };
}

export default async function GemeinsamPage(props: PageProps<"/leseplaene/gemeinsam/[id]">) {
  const { id } = await props.params;
  const searchParams = await props.searchParams;
  const user = await requireUser(`/leseplaene/gemeinsam/${id}`);
  const group = await getPlanGroup(id);
  if (!group || !(await canViewPlanGroup(group, user))) notFound();

  const members = await memberProgress(group);
  const me = members.find((m) => m.user.id === user.id);
  const active = members.filter((m) => m.status === "ACTIVE");
  const invited = members.filter((m) => m.status === "PENDING");
  const isCreator = group.createdById === user.id;
  const myDay = me?.currentDay ?? 1;
  const requested = Number(typeof searchParams.tag === "string" ? searchParams.tag : NaN);
  const day = Number.isFinite(requested) && requested >= 1 && requested <= group.plan.dayCount ? requested : (myDay ?? 1);
  const [readings, marks, friends, posts] = await Promise.all([
    getDayReadings(group.planId, day),
    me?.status === "ACTIVE" ? sharedMarksForDay(group, day, user.preferredTranslation) : Promise.resolve([]),
    isCreator ? listFriends(user.id) : Promise.resolve([]),
    dayPosts(group.id, day),
  ]);
  const readToday = active.filter((m) => m.days.includes(day));
  const notYet = active.filter((m) => !m.days.includes(day));
  const canModerate = user.role === "ADMIN" || user.role === "MODERATOR";
  const spans = mergeReadings(readings);
  const colorClass = (c?: string) => (c && c in HIGHLIGHT_COLORS ? HIGHLIGHT_COLORS[c as HighlightColor].className : "bg-highlight-yellow");

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <Link href="/leseplaene/meine" className="text-sm text-muted-foreground hover:text-primary">
        ← Meine Lesepläne
      </Link>
      <header className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold tracking-wider text-accent uppercase">Gemeinsam lesen</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">{group.name}</h1>
          <p className="mt-2 text-muted-foreground">
            <Link href={`/leseplaene/${group.plan.slug}`} className="text-primary hover:underline">
              {group.plan.title}
            </Link>{" "}
            · {group.plan.dayCount} Tage · gestartet von {group.createdBy.name}
            {group.group ? (
              <>
                {" "}
                · Gruppe{" "}
                <Link href={`/gruppen/${group.group.slug}`} className="text-primary hover:underline">
                  {group.group.name}
                </Link>
              </>
            ) : null}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {me?.status === "ACTIVE" ? (
            <>
              <Link href={`/leseplaene/${group.plan.slug}`} className={buttonClasses("primary")}>
                Weiterlesen
              </Link>
              <LeavePlanGroupButton id={group.id} />
            </>
          ) : (
            <JoinPlanGroupButton id={group.id} invited={me?.status === "PENDING"} />
          )}
        </div>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <section aria-labelledby="mitglieder" className="rounded-card border border-border bg-surface p-5 shadow-soft">
          <h2 id="mitglieder" className="flex items-center gap-2 font-semibold">
            <Users className="size-5 text-primary" aria-hidden="true" /> Wer liest mit ({active.length})
          </h2>
          <ul className="mt-4 space-y-4">
            {active.map((m) => (
              <li key={m.user.id} className="flex items-center gap-3">
                <Avatar name={m.user.name} src={m.user.avatarUrl} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <Link href={`/@${m.user.username}`} className="truncate font-medium hover:underline">
                      {m.user.name}
                      {m.user.id === user.id ? " (du)" : ""}
                    </Link>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {m.currentDay ? `Tag ${m.currentDay}` : "Fertig"} · {m.percent} %
                    </span>
                  </div>
                  <ProgressBar value={m.completed} max={group.plan.dayCount} size="sm" className="mt-1.5" label={`${m.user.name}: ${m.completed} von ${group.plan.dayCount} Tagen`} />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {m.lastActivity ? `zuletzt gelesen ${formatRelative(m.lastActivity)}` : "noch nicht angefangen"}
                    {!m.shareHighlights ? " · Markierungen privat" : ""}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          {invited.length > 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Eingeladen, noch nicht dabei: {invited.map((m) => m.user.name).join(", ")}
            </p>
          ) : null}
          {me?.status === "ACTIVE" ? (
            <div className="mt-5 border-t border-border pt-4">
              <ShareHighlightsToggle id={group.id} share={me.shareHighlights} />
            </div>
          ) : null}
          {isCreator ? (
            <div className="mt-5 border-t border-border pt-4">
              <h3 className="text-sm font-semibold">Weitere Freunde einladen</h3>
              <div className="mt-2">
                <InviteFriendsForm id={group.id} friends={friends.filter((f) => !members.some((m) => m.user.id === f.id))} />
              </div>
            </div>
          ) : null}
        </section>

        <section aria-labelledby="tag" className="space-y-4">
          <div className="rounded-card border border-border bg-surface p-5 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="tag" className="font-semibold">
                Tag {day} von {group.plan.dayCount}
                {day === myDay ? <Badge variant="primary" className="ml-2">dein nächster</Badge> : null}
              </h2>
              <div className="flex gap-1 text-sm">
                {day > 1 ? (
                  <Link href={`?tag=${day - 1}`} className={buttonClasses("ghost", "sm")}>
                    ← Tag {day - 1}
                  </Link>
                ) : null}
                {day < group.plan.dayCount ? (
                  <Link href={`?tag=${day + 1}`} className={buttonClasses("ghost", "sm")}>
                    Tag {day + 1} →
                  </Link>
                ) : null}
              </div>
            </div>
            <p className="mt-2 font-serif text-lg">{readingsLabel(readings)}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {spans.map((s, i) => {
                const href = spanPath(s, user.preferredTranslation);
                return href ? (
                  <li key={i}>
                    <Link href={href} className={buttonClasses("outline", "sm")}>
                      Lesen: {readingsLabel(readings.filter((r) => r.book === s.book && r.chapter >= s.chapterStart && r.chapter <= s.chapterEnd))}
                    </Link>
                  </li>
                ) : null;
              })}
            </ul>
            <div className="mt-4 border-t border-border pt-4">
              <p className="text-sm">
                <Check className="mr-1 inline size-4 text-success" aria-hidden="true" />
                <span className="font-medium">Gelesen:</span>{" "}
                {readToday.length === 0 ? <span className="text-muted-foreground">noch niemand</span> : readToday.map((m) => (m.user.id === user.id ? "du" : m.user.name)).join(", ")}
              </p>
              {notYet.length > 0 && readToday.length > 0 ? (
                <p className="mt-1 text-sm text-muted-foreground">Noch offen: {notYet.map((m) => (m.user.id === user.id ? "du" : m.user.name)).join(", ")}</p>
              ) : null}
              {me?.status === "ACTIVE" ? (
                <div className="mt-3">
                  <MarkDayButton planId={group.planId} day={day} done={me.days.includes(day)} size="md" />
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-card border border-border bg-surface p-5 shadow-soft">
            <h2 className="flex items-center gap-2 font-semibold">
              <Lightbulb className="size-5 text-accent" aria-hidden="true" /> Was wir mitnehmen – Tag {day}
            </h2>
            {posts.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">Noch nichts geteilt. Schreib als Erste:r, was dir aufgefallen ist.</p>
            ) : (
              <ul className="mt-3 divide-y divide-border">
                {posts.map((p) => (
                  <li key={p.id} className="flex gap-3 py-3">
                    <Avatar name={p.user.name} src={p.user.avatarUrl} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2 text-sm">
                        <p>
                          <Link href={`/@${p.user.username}`} className="font-medium hover:underline">
                            {p.user.name}
                          </Link>{" "}
                          <span className="text-xs text-muted-foreground">{formatRelative(p.createdAt)}</span>
                        </p>
                        {p.user.id === user.id || canModerate ? <DeleteDayPostButton id={p.id} /> : null}
                      </div>
                      <Markdown html={renderMarkdown(p.body, { headings: false })} className="mt-1 text-sm" />
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {me?.status === "ACTIVE" ? (
              <div className="mt-4 border-t border-border pt-4">
                <DayPostForm planGroupId={group.id} day={day} />
              </div>
            ) : null}
          </div>

          <div className="rounded-card border border-border bg-surface p-5 shadow-soft">
            <h2 className="font-semibold">Was die anderen markiert haben</h2>
            {me?.status !== "ACTIVE" ? (
              <p className="mt-2 text-sm text-muted-foreground">Tritt bei, um Markierungen und Notizen der anderen zu sehen.</p>
            ) : marks.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Für diesen Tag gibt es noch keine Markierungen oder geteilten Notizen. Markiere beim Lesen Verse oder schreib eine Notiz mit
                Sichtbarkeit „Mitglieder“.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-border">
                {marks.map((m, i) => (
                  <li key={i} className="flex gap-3 py-3">
                    <Avatar name={m.user.name} src={m.user.avatarUrl} size="sm" />
                    <div className="min-w-0 flex-1 text-sm">
                      <p>
                        <span className="font-medium">{m.user.name}</span>{" "}
                        {m.note ? "hat eine Notiz geteilt zu" : "hat markiert:"}{" "}
                        <Link href={m.path} className={`rounded px-1 ${m.note ? "text-primary underline-offset-4 hover:underline" : colorClass(m.color)}`}>
                          {m.reference}
                        </Link>
                      </p>
                      {m.note ? (
                        <p className="mt-1 text-muted-foreground">
                          {m.note.title ? <span className="font-medium text-foreground">{m.note.title}: </span> : null}
                          {m.note.excerpt}
                        </p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
