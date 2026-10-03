import { getFriendState } from "@/lib/friends/queries";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/dal";
import { canViewProfile } from "@/lib/profile";
import { usernameSchema } from "@/lib/validation/auth";
import { PostList } from "./post-list";
import { ProfileHeader } from "./profile-header";
import { ProfileLimited } from "./profile-limited";
import { getProfilePosts, getProfileStats, getProfileUser, isFollowing } from "./queries";

/**
 * Public member profile. Reached as `/@benutzername` through the rewrite in
 * next.config.ts (see ../README.md); the real route is /profil/[username].
 */

function normaliseUsername(raw: string): string | null {
  const parsed = usernameSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

export async function generateMetadata(props: PageProps<"/profil/[username]">): Promise<Metadata> {
  const username = normaliseUsername((await props.params).username);
  const user = username ? await getProfileUser(username) : null;
  if (!user || user.status !== "ACTIVE") return { title: "Profil" };
  return { title: `${user.name} (@${user.username})` };
}

export default async function ProfilPage(props: PageProps<"/profil/[username]">) {
  const username = normaliseUsername((await props.params).username);
  if (!username) notFound();

  const [user, viewer] = await Promise.all([getProfileUser(username), getCurrentUser()]);
  if (!user || user.status !== "ACTIVE") notFound();

  const viewerInfo = viewer ? { id: viewer.id, role: viewer.role } : null;
  const isOwner = viewer?.id === user.id;
  if (!canViewProfile(user, viewerInfo)) {
    return <ProfileLimited user={user} signedIn={viewer !== null} />;
  }

  const [stats, content, following] = await Promise.all([
    getProfileStats(user.id, viewerInfo, isOwner),
    getProfilePosts(user.id, viewerInfo),
    viewer && !isOwner ? isFollowing(viewer.id, user.id) : Promise.resolve(false),
  ]);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      <ProfileHeader
        user={user}
        stats={stats}
        isOwner={isOwner}
        signedIn={viewer !== null}
        following={following}
        friendState={viewer && !isOwner ? await getFriendState(viewer.id, user.id) : null}
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="profil-beitraege" className="space-y-4">
          <h2 id="profil-beitraege" className="text-lg font-semibold tracking-tight">
            Beiträge
          </h2>
          <PostList
            posts={content.posts}
            emptyTitle="Noch keine Beiträge"
            emptyDescription={
              isOwner ? "Was du in der Gemeinschaft teilst, erscheint hier." : `${user.name} hat noch nichts geteilt, das du sehen kannst.`
            }
          />
        </section>
        <section aria-labelledby="profil-zeugnisse" className="space-y-4">
          <h2 id="profil-zeugnisse" className="text-lg font-semibold tracking-tight">
            Zeugnisse
          </h2>
          <PostList
            posts={content.testimonies}
            emptyTitle="Noch keine Zeugnisse"
            emptyDescription={isOwner ? "Erzähl, was Gott in deinem Leben getan hat." : "Hier gibt es noch kein Zeugnis zu lesen."}
          />
        </section>
      </div>
    </main>
  );
}
