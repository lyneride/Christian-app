import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { GroupCard } from "@/components/groups/group-card";
import { GroupFilters } from "@/components/groups/group-filters";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { getCurrentUser } from "@/lib/auth/dal";
import { listGroups } from "@/lib/groups/queries";
import { parsePage } from "@/lib/pagination";
import { filterToKind, parseGroupFilter, parseTextFilter } from "@/lib/validation/groups";

export const metadata: Metadata = {
  title: "Gruppen",
  description: "Hauskreise, Gebetsgruppen und Themenkreise – online oder vor Ort. Finde eine Gruppe oder gründe deine eigene.",
};

export default async function GroupsPage(props: PageProps<"/gruppen">) {
  const sp = await props.searchParams;
  const user = await getCurrentUser();
  const filter = parseGroupFilter(sp.art);
  const city = parseTextFilter(sp.stadt);
  const q = parseTextFilter(sp.q);
  const page = parsePage(sp.seite, 18);
  const { items, total } = await listGroups({ viewer: user, kind: filterToKind(filter), city: city || undefined, q: q || undefined, page });
  const filtered = filter !== "alle" || city || q;
  const createHref = user ? "/gruppen/neu" : "/anmelden?next=%2Fgruppen%2Fneu";

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 md:py-14">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Gruppen</h1>
          <p className="mt-2 max-w-prose text-muted-foreground">Glaube wächst in Gemeinschaft. Finde einen Hauskreis, eine Gebetsgruppe oder einen Themenkreis – online oder bei dir vor Ort.</p>
        </div>
        <Link href={createHref} className={buttonClasses("primary")}>
          <Plus aria-hidden="true" /> Gruppe gründen
        </Link>
      </header>

      <div className="mt-8">
        <GroupFilters filter={filter} city={city} q={q} />
      </div>

      {items.length === 0 ? (
        <EmptyState
          className="mt-10"
          icon={<Users />}
          title={filtered ? "Keine passende Gruppe gefunden" : "Noch keine Gruppen"}
          description={filtered ? "Versuch es mit einem anderen Filter – oder gründe selbst eine Gruppe." : "Die erste Gruppe könnte deine sein."}
          action={
            <div className="flex flex-wrap justify-center gap-2">
              {filtered ? (
                <Link href="/gruppen" className={buttonClasses("outline", "sm")}>
                  Filter zurücksetzen
                </Link>
              ) : null}
              <Link href={createHref} className={buttonClasses("primary", "sm")}>
                Gruppe gründen
              </Link>
            </div>
          }
        />
      ) : (
        <>
          <p className="mt-8 text-sm text-muted-foreground">{total === 1 ? "1 Gruppe" : `${total} Gruppen`}</p>
          <ul className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((group) => (
              <li key={group.id} className="relative">
                <GroupCard group={group} className="h-full" />
              </li>
            ))}
          </ul>
        </>
      )}

      <Pagination
        basePath="/gruppen"
        params={{ art: filter === "alle" ? undefined : filter, stadt: city || undefined, q: q || undefined }}
        page={page.page}
        perPage={page.perPage}
        total={total}
      />
    </main>
  );
}
