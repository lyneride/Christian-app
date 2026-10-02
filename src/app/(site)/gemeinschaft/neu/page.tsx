import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PostCompose } from "@/components/community/post-compose";
import { requireUser } from "@/lib/auth/dal";
import { getUserGroups } from "@/lib/groups/queries";
import { POST_KIND_LABELS, parseKindParam } from "@/lib/validation/community";
import { createPost } from "../actions";

export const metadata: Metadata = { title: "Neuer Beitrag" };

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

const INTRO = {
  POST: "Ein Gedanke, eine Erfahrung, ein Hinweis – alles, was andere ermutigen oder zum Nachdenken bringen kann.",
  QUESTION: "Stell deine Frage so konkret wie möglich. Es gibt keine dummen Fragen – nur ungestellte.",
  TESTIMONY: "Erzähl, was Gott in deinem Leben getan hat. Ehrlich, in deinen Worten, so lang oder kurz du magst.",
  IMPULSE: "Ein kurzer Gedanke zum Mitnehmen – gern mit einer Bibelstelle, die dich gerade trägt.",
} as const;

export default async function NewPostPage(props: PageProps<"/gemeinschaft/neu">) {
  const sp = await props.searchParams;
  const kind = parseKindParam(sp.art) ?? "POST";
  const groupSlug = first(sp.gruppe);
  const user = await requireUser(`/gemeinschaft/neu${groupSlug ? `?gruppe=${encodeURIComponent(groupSlug)}` : kind !== "POST" ? `?art=${first(sp.art)}` : ""}`);
  const groups = await getUserGroups(user.id);
  const presetGroup = groupSlug ? groups.find((g) => g.slug === groupSlug) : undefined;

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 md:py-14">
      <Link href={presetGroup ? `/gruppen/${presetGroup.slug}` : "/gemeinschaft"} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" /> Zurück
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">{kind === "POST" ? "Neuer Beitrag" : `${POST_KIND_LABELS[kind].label} teilen`}</h1>
      <p className="mt-2 text-muted-foreground">{INTRO[kind]}</p>
      <div className="mt-8">
        <PostCompose
          action={createPost}
          mode="full"
          groups={groups.map((g) => ({ id: g.id, name: g.name }))}
          defaults={presetGroup ? { kind, visibility: "GROUP", groupId: presetGroup.id } : { kind }}
          cancelHref={presetGroup ? `/gruppen/${presetGroup.slug}` : "/gemeinschaft"}
        />
      </div>
    </main>
  );
}
