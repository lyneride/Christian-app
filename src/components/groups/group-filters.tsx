import Form from "next/form";
import Link from "next/link";
import { Search } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GROUP_FILTERS, GROUP_FILTER_LABELS, type GroupFilter } from "@/lib/validation/groups";
import { cn } from "@/lib/utils";

interface Props {
  filter: GroupFilter;
  city: string;
  q: string;
}

function filterHref(filter: GroupFilter, city: string, q: string) {
  const params = new URLSearchParams();
  if (filter !== "alle") params.set("art", filter);
  if (city) params.set("stadt", city);
  if (q) params.set("q", q);
  const s = params.toString();
  return s ? `/gruppen?${s}` : "/gruppen";
}

/** Kind pills plus city/search inputs (GET form, works without JavaScript). */
export function GroupFilters({ filter, city, q }: Props) {
  return (
    <div className="space-y-3">
      <nav aria-label="Gruppenart" className="flex flex-wrap gap-1.5">
        {GROUP_FILTERS.map((f) => (
          <Link
            key={f}
            href={filterHref(f, city, q)}
            aria-current={f === filter ? "page" : undefined}
            className={cn(buttonClasses(f === filter ? "primary" : "outline", "sm"))}
          >
            {GROUP_FILTER_LABELS[f]}
          </Link>
        ))}
      </nav>
      <Form action="/gruppen" role="search" className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
        {filter !== "alle" ? <input type="hidden" name="art" value={filter} /> : null}
        <div>
          <label htmlFor="gruppen-q" className="sr-only">
            Gruppen durchsuchen
          </label>
          <Input id="gruppen-q" name="q" type="search" defaultValue={q} placeholder="Name oder Thema" maxLength={80} autoComplete="off" />
        </div>
        <div>
          <label htmlFor="gruppen-stadt" className="sr-only">
            Stadt
          </label>
          <Input id="gruppen-stadt" name="stadt" type="text" defaultValue={city} placeholder="Stadt" maxLength={80} autoComplete="address-level2" />
        </div>
        <button type="submit" className={buttonClasses("secondary", "md")}>
          <Search aria-hidden="true" />
          Suchen
        </button>
      </Form>
    </div>
  );
}
