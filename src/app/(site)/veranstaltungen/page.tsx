import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { CalendarDays, Plus, Search, X } from "lucide-react";
import { EventCard } from "@/components/events/event-card";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { getCurrentUser } from "@/lib/auth/dal";
import { findGroupBySlug, listEvents, type EventListItem } from "@/lib/events/queries";
import { monthKey, monthLabel } from "@/lib/events/time";
import { pageHref, parsePage } from "@/lib/pagination";
import { cn } from "@/lib/utils";
import {
  EVENT_KINDS,
  EVENT_WHEN,
  KIND_LABELS,
  WHEN_LABELS,
  parseCityFilter,
  parseEventKind,
  parseEventWhen,
} from "@/lib/validation/events";

export const metadata: Metadata = {
  title: "Treffen",
  description: "Bibelabende, Gebetstreffen, Spaziergänge – online oder vor Ort.",
};

const BASE = "/veranstaltungen";
const PER_PAGE = 20;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function groupByMonth(items: EventListItem[]) {
  const months: { key: string; label: string; items: EventListItem[] }[] = [];
  for (const item of items) {
    const key = monthKey(item.startsAt);
    const last = months[months.length - 1];
    if (last && last.key === key) last.items.push(item);
    else months.push({ key, label: monthLabel(item.startsAt), items: [item] });
  }
  return months;
}

function FilterPills<T extends string>({
  label,
  options,
  labels,
  current,
  hrefFor,
}: {
  label: string;
  options: readonly T[];
  labels: Record<T, string>;
  current: T;
  hrefFor: (value: T) => string;
}) {
  return (
    <nav aria-label={label} className="flex flex-wrap gap-1 rounded-full bg-surface-muted p-1">
      {options.map((value) => {
        const active = value === current;
        return (
          <Link
            key={value}
            href={hrefFor(value)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium transition",
              active ? "bg-surface text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {labels[value]}
          </Link>
        );
      })}
    </nav>
  );
}

const chipClass =
  "inline-flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1 text-sm text-foreground hover:bg-surface-muted";

export default async function EventsPage(props: PageProps<"/veranstaltungen">) {
  const sp = await props.searchParams;
  const user = await getCurrentUser();
  const viewer = user ? { id: user.id, role: user.role } : null;

  const when = parseEventWhen(sp.zeit);
  const kind = parseEventKind(sp.art);
  const city = parseCityFilter(sp.ort);
  const groupSlug = first(sp.gruppe)?.trim();
  const group = groupSlug ? await findGroupBySlug(groupSlug) : null;
  const page = parsePage(sp.seite, PER_PAGE);

  const { items, total } = await listEvents({ viewer, when, kind, city, groupId: group?.id, page });

  const params: Record<string, string | undefined> = {
    zeit: when === "kommend" ? undefined : when,
    art: kind === "alle" ? undefined : kind,
    ort: city,
    gruppe: group?.slug,
  };
  const href = (overrides: Record<string, string | undefined>) => pageHref(BASE, { ...params, ...overrides }, 1);
  const months = groupByMonth(items);
  const newHref = user ? `${BASE}/neu` : `/anmelden?next=${encodeURIComponent(`${BASE}/neu`)}`;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 md:py-14">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Treffen</h1>
          <p className="mt-4 max-w-prose text-lg text-muted-foreground">
            Bibelabende, Gebetstreffen, Spaziergänge – online oder vor Ort.
          </p>
        </div>
        <Link href={newHref} className={buttonClasses("primary", "lg", "shrink-0")}>
          <Plus aria-hidden="true" /> Treffen planen
        </Link>
      </header>

      <div className="mt-8 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
        <FilterPills
          label="Zeitraum"
          options={EVENT_WHEN}
          labels={WHEN_LABELS}
          current={when}
          hrefFor={(v) => href({ zeit: v === "kommend" ? undefined : v })}
        />
        <FilterPills
          label="Art"
          options={EVENT_KINDS}
          labels={KIND_LABELS}
          current={kind}
          hrefFor={(v) => href({ art: v === "alle" ? undefined : v })}
        />
        <Form action={BASE} role="search" className="flex gap-2 md:ml-auto">
          {params.zeit ? <input type="hidden" name="zeit" value={params.zeit} /> : null}
          {params.art ? <input type="hidden" name="art" value={params.art} /> : null}
          {params.gruppe ? <input type="hidden" name="gruppe" value={params.gruppe} /> : null}
          <label htmlFor="ort" className="sr-only">
            Nach Stadt filtern
          </label>
          <Input id="ort" name="ort" type="search" placeholder="Stadt, z. B. Leipzig" defaultValue={city ?? ""} className="md:w-56" />
          <button type="submit" className={buttonClasses("outline", "md")} aria-label="Filtern">
            <Search aria-hidden="true" />
          </button>
        </Form>
      </div>

      {city || group ? (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>Gefiltert nach:</span>
          {group ? (
            <Link href={href({ gruppe: undefined })} className={chipClass} aria-label={`Filter Gruppe ${group.name} entfernen`}>
              Gruppe: {group.name} <X aria-hidden="true" className="size-3.5" />
            </Link>
          ) : null}
          {city ? (
            <Link href={href({ ort: undefined })} className={chipClass} aria-label={`Filter Stadt ${city} entfernen`}>
              Stadt: {city} <X aria-hidden="true" className="size-3.5" />
            </Link>
          ) : null}
        </div>
      ) : null}

      {items.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={<CalendarDays aria-hidden="true" />}
          title={when === "kommend" ? "Noch nichts geplant" : "Keine vergangenen Treffen"}
          description={
            when === "kommend"
              ? city || group
                ? "Mit diesem Filter steht gerade nichts an. Vielleicht planst du selbst etwas?"
                : "Sobald jemand ein Treffen plant, erscheint es hier. Vielleicht du?"
              : "Hier erscheinen Treffen, die schon vorbei sind."
          }
          action={
            when === "kommend" ? (
              <Link href={newHref} className={buttonClasses("primary", "md")}>
                <Plus aria-hidden="true" /> Treffen planen
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="mt-8 space-y-10">
          <p className="sr-only" aria-live="polite">
            {total === 1 ? "1 Treffen" : `${total} Treffen`}
          </p>
          {months.map((month) => (
            <section key={month.key} aria-labelledby={`monat-${month.key}`}>
              <h2 id={`monat-${month.key}`} className="mb-4 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                {month.label}
              </h2>
              <div className="space-y-4">
                {month.items.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <Pagination basePath={BASE} params={params} page={page.page} perPage={page.perPage} total={total} />
    </main>
  );
}
