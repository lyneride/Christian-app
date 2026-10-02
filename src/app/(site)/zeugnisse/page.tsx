import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle, Sparkles } from "lucide-react";
import { UserLink } from "@/components/profile/user-link";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { getCurrentUser } from "@/lib/auth/dal";
import { listPosts } from "@/lib/community/queries";
import { markdownToText } from "@/lib/markdown";
import { parsePage } from "@/lib/pagination";
import { formatRelative } from "@/lib/utils";
import { postPath, verseKeyToInput } from "@/lib/validation/community";

export const metadata: Metadata = {
  title: "Zeugnisse",
  description: "Geschichten aus der Gemeinschaft: Was Gott im Leben von Menschen getan hat – ehrlich erzählt.",
};

export default async function TestimoniesPage(props: PageProps<"/zeugnisse">) {
  const sp = await props.searchParams;
  const user = await getCurrentUser();
  const page = parsePage(sp.seite, 12);
  const { items, total } = await listPosts({ viewer: user, tab: "zeugnisse", page });
  const shareHref = user ? "/gemeinschaft/neu?art=zeugnis" : "/anmelden?next=%2Fgemeinschaft%2Fneu%3Fart%3Dzeugnis";

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 md:py-14">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-wider text-accent uppercase">Gemeinschaft</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Zeugnisse</h1>
          <p className="mt-2 max-w-prose text-muted-foreground">Was Gott im Leben von Menschen getan hat – ehrlich erzählt, ohne Hochglanz.</p>
        </div>
        <Link href={shareHref} className={buttonClasses("accent")}>
          <Sparkles aria-hidden="true" /> Dein Zeugnis teilen
        </Link>
      </header>

      {items.length === 0 ? (
        <EmptyState
          className="mt-10"
          icon={<Sparkles />}
          title="Noch keine Zeugnisse"
          description="Was hat Gott in deinem Leben getan? Deine Geschichte könnte jemandem genau heute Mut machen."
          action={
            <Link href={shareHref} className={buttonClasses("primary", "sm")}>
              Dein Zeugnis teilen
            </Link>
          }
        />
      ) : (
        <ol className="mt-10 grid gap-5 sm:grid-cols-2">
          {items.map((post) => {
            const verse = verseKeyToInput(post.verseRef);
            return (
              <li key={post.id} className="relative flex flex-col rounded-card border border-border bg-surface p-6 shadow-soft transition hover:border-accent/50">
                <h2 className="font-serif text-2xl leading-snug font-semibold tracking-tight">
                  <Link href={postPath(post.id)} className="after:absolute after:inset-0 hover:underline">
                    {post.title ?? "Zeugnis"}
                  </Link>
                </h2>
                <p className="mt-3 flex-1 leading-relaxed text-foreground/85">{markdownToText(post.body, 280)}</p>
                {verse ? <p className="mt-3 text-sm text-accent-foreground dark:text-accent">{verse}</p> : null}
                <footer className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-sm text-muted-foreground">
                  <span className="relative z-10">
                    <UserLink user={post.author} size="xs" showUsername={false} />
                  </span>
                  <span className="flex items-center gap-3">
                    <time dateTime={post.createdAt.toISOString()}>{formatRelative(post.createdAt)}</time>
                    <span className="inline-flex items-center gap-1">
                      <MessageCircle className="size-4" aria-hidden="true" />
                      {post._count.comments}
                      <span className="sr-only">Kommentare</span>
                    </span>
                  </span>
                </footer>
              </li>
            );
          })}
        </ol>
      )}

      <Pagination basePath="/zeugnisse" page={page.page} perPage={page.perPage} total={total} />
    </main>
  );
}
