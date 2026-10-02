import type { Metadata } from "next";
import Link from "next/link";
import { PenLine, Sparkles, Users } from "lucide-react";
import { PostCompose } from "@/components/community/post-compose";
import { FeedTabs } from "@/components/community/feed-tabs";
import { PostList } from "@/components/community/post-list";
import { buttonClasses } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { getCurrentUser, isModerator } from "@/lib/auth/dal";
import { resolveTranslationId } from "@/lib/bible/data";
import { listPosts } from "@/lib/community/queries";
import { getUserGroups } from "@/lib/groups/queries";
import { parsePage } from "@/lib/pagination";
import { FEED_TAB_LABELS, parseFeedTab, type FeedTab } from "@/lib/validation/community";
import { createPost } from "./actions";

export const metadata: Metadata = {
  title: "Gemeinschaft",
  description: "Beiträge, Fragen, Zeugnisse und Impulse aus der Bleibe-Gemeinschaft – teile, was dich bewegt.",
};

const EMPTY: Record<FeedTab, { title: string; description: string }> = {
  alle: { title: "Noch ganz still hier", description: "Sei die erste Person, die etwas teilt – ein Gedanke, eine Frage, ein Vers." },
  fragen: { title: "Noch keine Fragen", description: "Du hast eine? Stell sie ruhig – hier fragt niemand zu viel." },
  zeugnisse: { title: "Noch keine Zeugnisse", description: "Was hat Gott in deinem Leben getan? Andere freuen sich, davon zu lesen." },
  impulse: { title: "Noch keine Impulse", description: "Ein kurzer Gedanke zum Mitnehmen – vielleicht von dir?" },
  gefolgt: { title: "Noch nichts von Menschen, denen du folgst", description: "Folge Mitgliedern über ihr Profil, dann erscheinen ihre Beiträge hier." },
  meine: { title: "Du hast noch nichts geteilt", description: "Dein erster Beitrag wartet oben im Feld." },
};

export default async function CommunityPage(props: PageProps<"/gemeinschaft">) {
  const sp = await props.searchParams;
  const user = await getCurrentUser();
  const tab = parseFeedTab(sp.tab, user !== null);
  const page = parsePage(sp.seite, 20);
  const [translation, groups, { items, total }] = await Promise.all([
    resolveTranslationId(user?.preferredTranslation),
    user ? getUserGroups(user.id) : Promise.resolve([]),
    listPosts({ viewer: user, tab, page }),
  ]);
  const empty = EMPTY[tab];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 md:py-14">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Gemeinschaft</h1>
          <p className="mt-2 max-w-prose text-muted-foreground">Was dich bewegt, hat hier Platz: Gedanken, Fragen, Zeugnisse und kurze Impulse.</p>
        </div>
        <nav aria-label="Weitere Bereiche" className="flex flex-wrap gap-2">
          <Link href="/zeugnisse" className={buttonClasses("outline", "sm")}>
            <Sparkles aria-hidden="true" /> Zeugnisse
          </Link>
          <Link href="/gruppen" className={buttonClasses("outline", "sm")}>
            <Users aria-hidden="true" /> Gruppen
          </Link>
        </nav>
      </header>

      <section aria-label="Etwas teilen" className="mt-8 rounded-card border border-border bg-surface p-5 shadow-soft sm:p-6">
        {user ? (
          <>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Etwas teilen</h2>
              <Link href="/gemeinschaft/neu" className="text-sm text-primary hover:underline">
                <PenLine className="mr-1 inline size-4" aria-hidden="true" />
                Ausführlich schreiben
              </Link>
            </div>
            <PostCompose action={createPost} mode="inline" groups={groups} />
          </>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">Melde dich an, um selbst zu schreiben, zu reagieren und zu kommentieren.</p>
            <div className="flex gap-2">
              <Link href="/anmelden?next=%2Fgemeinschaft" className={buttonClasses("primary", "sm")}>
                Anmelden
              </Link>
              <Link href="/registrieren" className={buttonClasses("outline", "sm")}>
                Mitmachen
              </Link>
            </div>
          </div>
        )}
      </section>

      <div className="mt-8">
        <FeedTabs active={tab} signedIn={user !== null} />
      </div>

      <section aria-label={`Beiträge: ${FEED_TAB_LABELS[tab]}`} className="mt-6">
        <PostList
          posts={items}
          viewer={user}
          translation={translation}
          canPin={isModerator(user)}
          emptyTitle={empty.title}
          emptyDescription={empty.description}
        />
        <Pagination basePath="/gemeinschaft" params={{ tab: tab === "alle" ? undefined : tab }} page={page.page} perPage={page.perPage} total={total} />
      </section>
    </main>
  );
}
