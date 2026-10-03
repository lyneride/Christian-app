import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/dal";
import { prisma } from "@/lib/db";
import { listFriends } from "@/lib/friends/queries";
import { CreatePlanGroupForm } from "./create-form";

export const metadata: Metadata = { title: "Gemeinsam lesen" };

export default async function NeuGemeinsamPage(props: PageProps<"/leseplaene/gemeinsam/neu">) {
  const searchParams = await props.searchParams;
  const slug = typeof searchParams.plan === "string" ? searchParams.plan : "";
  const user = await requireUser(`/leseplaene/gemeinsam/neu?plan=${encodeURIComponent(slug)}`);
  const plan = slug ? await prisma.readingPlan.findUnique({ where: { slug }, select: { id: true, title: true, dayCount: true, slug: true } }) : null;
  if (!plan) notFound();
  const [friends, groups] = await Promise.all([
    listFriends(user.id),
    prisma.groupMember.findMany({ where: { userId: user.id, status: "ACTIVE" }, select: { group: { select: { id: true, name: true } } }, orderBy: { group: { name: "asc" } } }),
  ]);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <Link href={`/leseplaene/${plan.slug}`} className="text-sm text-muted-foreground hover:text-primary">
        ← {plan.title}
      </Link>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Gemeinsam lesen</h1>
      <p className="mt-2 text-muted-foreground">
        Lade Freunde oder eine Gruppe ein. Jede Person liest in ihrem Tempo – und ihr seht, wo die anderen gerade sind, was sie
        markieren und welche Notizen sie teilen.
      </p>
      <div className="mt-8">
        <CreatePlanGroupForm plan={plan} friends={friends} groups={groups.map((g) => g.group)} />
      </div>
    </main>
  );
}
