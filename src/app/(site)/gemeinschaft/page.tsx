import type { Metadata } from "next";
import Link from "next/link";
import { PenLine, Plus } from "lucide-react";
import { Rebi } from "@/components/rebi/rebi";
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
  freunde: { title: "Noch nichts von deinen Freunden", description: "Füge Freunde hinzu – dann erscheinen ihre Beiträge hier." },
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
    <main className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6 sm:py-8">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-[30px] leading-tight sm:text-4xl">Gemeinschaft</h1>
          <p className="mt-1.5 max-w-prose text-[15px] text-muted-foreground sm:text-base">Gedanken, Fragen, Zeugnisse und kurze Impulse – hier hat alles Platz.</p>
        </div>
        <Rebi pose="wave" size={88} className="-my-2" priority />
      </header>

      <section aria-label="Etwas teilen" className="mt-5">
        {user ? (
          <details className="group rounded-card bg-surface shadow-soft open:p-5 sm:open:p-6" data-tour="post-compose">
            <summary
              className={`${buttonClasses("primary", "md", "w-full")} cursor-pointer list-none group-open:mb-4 group-open:hidden [&::-webkit-details-marker]:hidden`}
            >
              <Plus aria-hidden="true" /> Beitrag schreiben
            </summary>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg">Etwas teilen</h2>
              <Link href="/gemeinschaft/neu" className="inline-flex items-center gap-1 font-display text-sm font-extrabold text-primary hover:underline">
                <PenLine className="size-4" aria-hidden="true" />
                Ausführlich schreiben
              </Link>
            </div>
            <PostCompose action={createPost} mode="inline" groups={groups} />
          </details>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-card bg-surface p-5 shadow-soft">
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

      <div className="mt-6">
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
