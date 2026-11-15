import type { Metadata } from "next";
import Link from "next/link";
import { HandHeart, Plus } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/dal";
import { pageHref, parsePage } from "@/lib/pagination";
import { listPrayerRequests } from "@/lib/prayer/queries";
import { Rebi } from "@/components/rebi/rebi";
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
    <main className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6 sm:py-8">
      <header>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-[30px] leading-tight sm:text-4xl">Gebet</h1>
            <p className="mt-1.5 text-[15px] text-muted-foreground sm:text-base">Teile, was dich bewegt – andere beten mit.</p>
          </div>
          <Rebi pose="heart" size={88} className="-my-2" priority />
        </div>
        <Link href={newHref} className={buttonClasses("primary", "md", "mt-4 w-full sm:w-auto")} data-tour="prayer-new">
          <Plus aria-hidden="true" />
          Anliegen teilen
        </Link>
      </header>

      <div data-tour="prayer-filter" className="mt-5">
      <nav aria-label="Filter" className="scrollbar-none flex w-full gap-1 overflow-x-auto rounded-full bg-surface-muted p-1 sm:w-fit">
        {filters.map((f) => {
          const active = f === filter;
          return (
            <Link
              key={f}
              href={pageHref("/gebet", { ...params, filter: f === "alle" ? undefined : f }, 1)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 font-display text-sm font-black transition-colors",
                active ? "bg-surface text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {FILTER_LABELS[f]}
            </Link>
          );
        })}
      </nav>

      <nav className="scrollbar-none -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" aria-label="Kategorien">
        <CategoryChip href={pageHref("/gebet", { ...params, kategorie: undefined }, 1)} active={!category}>
          Alle Kategorien
        </CategoryChip>
        {PRAYER_CATEGORIES.map((c) => (
          <CategoryChip key={c} href={pageHref("/gebet", { ...params, kategorie: c }, 1)} active={category === c}>
            {CATEGORY_LABELS[c].label}
          </CategoryChip>
        ))}
      </nav>
      </div>

      {items.length === 0 ? (
        <EmptyState
          className="mt-8"
          pose="heart"
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
        "inline-flex h-9 shrink-0 items-center rounded-full border-2 px-3.5 text-[13px] font-bold whitespace-nowrap transition-colors",
        active ? "border-foreground bg-foreground text-background" : "border-border bg-surface text-foreground hover:border-foreground/30",
      )}
    >
      {children}
    </Link>
  );
}
