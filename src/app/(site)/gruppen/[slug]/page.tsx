import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lock, Settings, Users } from "lucide-react";
import { Markdown } from "@/components/community/markdown";
import { PostCompose } from "@/components/community/post-compose";
import { PostList } from "@/components/community/post-list";
import { GroupAvatar } from "@/components/groups/group-avatar";
import { GroupKindBadge } from "@/components/groups/group-card";
import { GroupEvents, GroupPrayers, MemberList } from "@/components/groups/group-sections";
import { GroupReadingPlans } from "@/components/groups/group-plans";
import { JoinButton } from "@/components/groups/join-button";
import { GroupChatButton } from "@/components/groups/group-chat-button";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { createPost } from "@/app/(site)/gemeinschaft/actions";
import { getCurrentUser, isModerator } from "@/lib/auth/dal";
import { resolveTranslationId } from "@/lib/bible/data";
import { listPosts } from "@/lib/community/queries";
import { getGroupBySlug } from "@/lib/groups/queries";
import { groupChatUnread } from "@/lib/messages/group-chat";
import { markdownToText, renderMarkdown } from "@/lib/markdown";
import { parsePage } from "@/lib/pagination";
import { pluralize } from "@/lib/utils";
import { groupPath } from "@/lib/validation/community";

type Props = PageProps<"/gruppen/[slug]">;

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  const user = await getCurrentUser();
  const detail = await getGroupBySlug(slug, user);
  if (!detail) return { title: "Gruppe" };
  return {
    title: detail.group.name,
    description: markdownToText(detail.group.description, 160),
    robots: detail.group.visibility === "PUBLIC" ? undefined : { index: false },
  };
}

export default async function GroupPage(props: Props) {
  const [{ slug }, sp] = await Promise.all([props.params, props.searchParams]);
  const user = await getCurrentUser();
  const detail = await getGroupBySlug(slug, user);
  if (!detail) notFound();
  const { group, membership, memberCount, pendingCount, isActiveMember, canManage, canViewContent } = detail;
  const path = groupPath(group.slug);
  const page = parsePage(sp.seite, 15);
  const [translation, posts, chatUnread] = canViewContent
    ? await Promise.all([
        resolveTranslationId(user?.preferredTranslation),
        listPosts({ viewer: user, groupId: group.id, page }),
        user && isActiveMember ? groupChatUnread(group.id, user.id) : Promise.resolve(0),
      ])
    : [null, null, 0];
  const canPin = canManage || isModerator(user);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-8">
      <Link href="/gruppen" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground -my-3 py-3 font-semibold">
        <ArrowLeft className="size-4" aria-hidden="true" /> Alle Gruppen
      </Link>

      <header className="mt-4 overflow-hidden rounded-card border border-border bg-surface shadow-soft">
        <div className="p-5 sm:p-8">
          <div className="flex flex-wrap items-center gap-1.5">
            <GroupKindBadge kind={group.kind} city={group.city} />
            {group.visibility === "PRIVATE" ? (
              <Badge variant="outline">
                <Lock className="size-3" aria-hidden="true" /> Geschlossene Gruppe
              </Badge>
            ) : null}
            <Badge variant="default">
              <Users className="size-3" aria-hidden="true" /> {pluralize(memberCount, "Mitglied", "Mitglieder")}
            </Badge>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <GroupAvatar name={group.name} src={group.imageUrl} size="lg" />
            <h1 className="min-w-0 text-[28px] leading-tight [overflow-wrap:anywhere] sm:text-4xl">{group.name}</h1>
          </div>
          <Markdown html={renderMarkdown(group.description)} className="mt-4 max-w-prose" />
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {user && isActiveMember ? <GroupChatButton groupId={group.id} unread={chatUnread} /> : null}
            <JoinButton
              groupId={group.id}
              membership={membership}
              visibility={group.visibility === "FRIENDS" ? "MEMBERS" : group.visibility}
              signedIn={user !== null}
              loginHref={`/anmelden?next=${encodeURIComponent(path)}`}
            />
            {canManage ? (
              <>
                <Link href={`${path}/bearbeiten`} className={buttonClasses("outline", "sm")}>
                  <Settings aria-hidden="true" /> Bearbeiten
                </Link>
                <Link href={`${path}/mitglieder`} className={buttonClasses("outline", "sm")}>
                  <Users aria-hidden="true" /> Mitglieder verwalten
                  {pendingCount > 0 ? (
                    <Badge variant="warning" className="ml-1">
                      {pendingCount} offen
                    </Badge>
                  ) : null}
                </Link>
              </>
            ) : null}
          </div>
        </div>
      </header>

      {!canViewContent || !posts ? (
        <Alert tone="info" title="Diese Gruppe ist geschlossen" className="mt-8">
          Beiträge, Anliegen, Treffen und Mitglieder siehst du, sobald die Leitung deine Anfrage angenommen hat.
        </Alert>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-10">
          <section aria-labelledby="gruppe-beitraege" className="min-w-0 space-y-5">
            <h2 id="gruppe-beitraege" className="text-xl font-semibold tracking-tight">
              Beiträge
            </h2>
            {isActiveMember ? (
              <div className="rounded-card border border-border bg-surface p-5 shadow-soft">
                <PostCompose action={createPost} mode="inline" groups={[]} lockedGroup={{ id: group.id, name: group.name }} />
              </div>
            ) : null}
            <PostList
              posts={posts.items}
              viewer={user}
              translation={translation ?? "LUT1912"}
              canPin={canPin}
              hideGroup
              emptyTitle="Noch keine Beiträge in der Gruppe"
              emptyDescription={isActiveMember ? "Schreib den ersten – zum Beispiel, worauf ihr euch beim nächsten Treffen freut." : undefined}
            />
            <Pagination basePath={path} page={page.page} perPage={page.perPage} total={posts.total} />
          </section>

          <aside className="space-y-8">
            {canManage && pendingCount > 0 ? (
              <section aria-labelledby="gruppe-anfragen" className="rounded-card border border-warning/40 bg-warning-soft/40 p-4">
                <h2 id="gruppe-anfragen" className="text-base font-semibold">
                  Offene Anfragen ({pendingCount})
                </h2>
                <MemberList groupId={group.id} viewerId={user?.id ?? null} actor={membership} status="PENDING" manage limit={5} />
                {pendingCount > 5 ? (
                  <Link href={`${path}/mitglieder`} className="text-sm text-primary hover:underline">
                    Alle Anfragen ansehen
                  </Link>
                ) : null}
              </section>
            ) : null}

            <GroupReadingPlans groupId={group.id} isMember={isActiveMember} />
            <GroupPrayers groupId={group.id} slug={group.slug} viewer={user} isMember={isActiveMember} />
            <GroupEvents groupId={group.id} slug={group.slug} viewer={user} isMember={isActiveMember} />

            <section aria-labelledby="gruppe-mitglieder" className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h2 id="gruppe-mitglieder" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                  <Users className="size-5 text-primary" aria-hidden="true" /> Mitglieder
                </h2>
                <Link href={`${path}/mitglieder`} className="text-sm text-primary hover:underline">
                  Alle {memberCount}
                </Link>
              </div>
              <div className="rounded-card border border-border bg-surface px-4">
                <MemberList groupId={group.id} viewerId={user?.id ?? null} actor={membership} limit={8} />
              </div>
            </section>
          </aside>
        </div>
      )}
    </main>
  );
}
