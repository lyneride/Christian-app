import type { Metadata } from "next";
import Link from "next/link";
import { HandHeart, Plus } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/dal";
import { pageHref, parsePage } from "@/lib/pagination";
import { listPrayerRequests } from "@/lib/prayer/queries";
import { cn } from "@/lib/utils";
import {
  CATEGORY_LABELS,
  FILTER_LABELS,
  MEMBER_ONLY_FILTERS,
  PRAYER_CATEGORIES,
  PRAYER_FILTERS,
  parsePrayerCategory,
  parsePrayerFilter,
  type PrayerCategory,
  type PrayerFilter,
} from "@/lib/validation/prayer";
import { PrayerCard } from "@/components/prayer/prayer-card";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";

export const metadata: Metadata = {
  title: "Gebet",
  description: "Teile, was dich bewegt – andere beten mit.",
};

const PER_PAGE = 20;

function emptyCopy(filter: PrayerFilter, category: PrayerCategory | undefined, signedIn: boolean) {
  if (category) {
    return {
      title: `Noch nichts unter „${CATEGORY_LABELS[category].label}“`,
      description:
        "In dieser Kategorie gibt es gerade keine Anliegen. Schau bei den anderen vorbei oder teile selbst eines.",
    };
  }
  switch (filter) {
    case "erhoert":
      return {
        title: "Noch kein erhörtes Anliegen",
        description: "Sobald jemand ein Anliegen als erhört markiert, erscheint es hier – zum Mitfreuen.",
      };
    case "meine":
      return {
        title: "Du hast noch kein Anliegen geteilt",
        description: "Wenn du magst, schreib auf, was dich gerade bewegt. Andere beten mit.",
      };
    case "gebetet":
      return {
        title: "Du hast noch bei keinem Anliegen mitgebetet",
        description: "Wenn du bei einem Anliegen auf „Ich bete mit“ klickst, findest du es hier wieder.",
      };
    default:
      return {
        title: "Hier ist es noch still",
        description: signedIn
          ? "Teile, was dich bewegt – wenn du magst. Andere beten mit."
          : "Melde dich an, um Anliegen zu sehen, die nur für Mitglieder sichtbar sind, oder teile selbst eines.",
      };
  }
}

export default async function GebetPage(props: PageProps<"/gebet">) {
  const searchParams = await props.searchParams;
  const user = await getCurrentUser();
  const viewer = user ? { id: user.id, role: user.role } : null;

  const filter = parsePrayerFilter(searchParams.filter, viewer !== null);
  const category = parsePrayerCategory(searchParams.kategorie);
  const page = parsePage(searchParams.seite, PER_PAGE);
  const { items, total } = await listPrayerRequests({ viewer, filter, category, page });

  const params = { filter: filter === "alle" ? undefined : filter, kategorie: category };
  const filters = PRAYER_FILTERS.filter((f) => viewer !== null || !MEMBER_ONLY_FILTERS.includes(f));
  const newHref = viewer ? "/gebet/neu" : `/anmelden?next=${encodeURIComponent("/gebet/neu")}`;
  const empty = emptyCopy(filter, category, viewer !== null);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Gebet</h1>
          <p className="text-muted-foreground mt-2">Teile, was dich bewegt – andere beten mit.</p>
        </div>
        <Link href={newHref} className={buttonClasses("primary", "md", "shrink-0")}>
          <Plus aria-hidden="true" />
          Anliegen teilen
        </Link>
      </header>

      <nav aria-label="Filter" className="bg-surface-muted mt-6 flex w-fit max-w-full flex-wrap gap-1 rounded-full p-1">
        {filters.map((f) => {
          const active = f === filter;
          return (
            <Link
              key={f}
              href={pageHref("/gebet", { ...params, filter: f === "alle" ? undefined : f }, 1)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                active ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {FILTER_LABELS[f]}
            </Link>
          );
        })}
      </nav>

      <nav className="mt-3 flex flex-wrap gap-2" aria-label="Kategorien">
        <CategoryChip href={pageHref("/gebet", { ...params, kategorie: undefined }, 1)} active={!category}>
          Alle Kategorien
        </CategoryChip>
        {PRAYER_CATEGORIES.map((c) => (
          <CategoryChip key={c} href={pageHref("/gebet", { ...params, kategorie: c }, 1)} active={category === c}>
            {CATEGORY_LABELS[c].label}
          </CategoryChip>
        ))}
      </nav>

      {items.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={<HandHeart />}
          title={empty.title}
          description={empty.description}
          action={
            <Link href={newHref} className={buttonClasses("primary", "sm")}>
              Anliegen teilen
            </Link>
          }
        />
      ) : (
        <ul className="mt-6 space-y-4">
          {items.map((item) => (
            <li key={item.id}>
              <PrayerCard item={item} viewer={viewer} />
            </li>
          ))}
        </ul>
      )}

      <Pagination basePath="/gebet" params={params} page={page.page} perPage={page.perPage} total={total} />
    </main>
  );
}

function CategoryChip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primary-soft text-primary"
          : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}
