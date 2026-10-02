import type { Metadata } from "next";
import Form from "next/form";
import { Search, Users } from "lucide-react";
import { UserRow } from "@/components/admin/user-row";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, Select } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { requireRole } from "@/lib/auth/dal";
import { listUsers } from "@/lib/moderation/queries";
import { parsePage } from "@/lib/pagination";
import { pluralize } from "@/lib/utils";
import {
  ROLE_LABELS,
  SEARCH_MAX,
  USER_ROLES,
  USER_STATUS_FILTERS,
  USER_STATUS_LABELS,
  parseRoleFilter,
  parseSearchQuery,
  parseStatusFilter,
} from "@/lib/validation/admin";

export const metadata: Metadata = { title: "Mitglieder" };

const PER_PAGE = 25;

export default async function MembersPage(props: PageProps<"/admin/mitglieder">) {
  await requireRole("MODERATOR", "/admin/mitglieder");
  const sp = await props.searchParams;
  const q = parseSearchQuery(sp.q);
  const role = parseRoleFilter(sp.rolle);
  const status = parseStatusFilter(sp.status);
  const page = parsePage(sp.seite, PER_PAGE);

  const { items, total } = await listUsers({ q, role, status, page });
  const filtered = q !== "" || role !== undefined || status !== undefined;

  return (
    <section aria-labelledby="members-heading">
      <h1 id="members-heading" className="text-2xl font-semibold tracking-tight">
        Mitglieder
      </h1>
      <p className="text-muted-foreground mt-1 text-sm">Suche nach Name, Benutzername oder E-Mail-Adresse.</p>

      <Form
        action="/admin/mitglieder"
        role="search"
        className="mt-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_10rem_10rem_auto] sm:items-end"
      >
        <div>
          <label htmlFor="q" className="block text-sm font-medium">
            Suche
          </label>
          <Input
            id="q"
            name="q"
            type="search"
            defaultValue={q}
            maxLength={SEARCH_MAX}
            autoComplete="off"
            className="mt-1.5"
          />
        </div>
        <div>
          <label htmlFor="rolle" className="block text-sm font-medium">
            Rolle
          </label>
          <Select id="rolle" name="rolle" defaultValue={role ?? ""} className="mt-1.5">
            <option value="">Alle Rollen</option>
            {USER_ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium">
            Status
          </label>
          <Select id="status" name="status" defaultValue={status ?? ""} className="mt-1.5">
            <option value="">Alle Status</option>
            {USER_STATUS_FILTERS.map((s) => (
              <option key={s} value={s}>
                {USER_STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
        </div>
        <Button type="submit" variant="secondary">
          <Search aria-hidden="true" />
          Filtern
        </Button>
      </Form>

      <p className="text-muted-foreground mt-5 text-sm">
        {pluralize(total, "Mitglied", "Mitglieder")}
        {filtered ? " gefunden" : ""}
      </p>

      {items.length === 0 ? (
        <EmptyState
          icon={<Users />}
          title="Keine Mitglieder gefunden"
          description={
            filtered
              ? "Versuche einen anderen Suchbegriff oder setze die Filter zurück."
              : "Es gibt noch keine Mitglieder."
          }
          className="mt-4"
        />
      ) : (
        <div className="rounded-card border-border bg-surface shadow-soft mt-3 overflow-x-auto border">
          <table className="w-full min-w-[44rem] text-left">
            <thead className="text-muted-foreground text-xs uppercase">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">
                  Mitglied
                </th>
                <th scope="col" className="py-3 pr-4 font-medium">
                  Rolle
                </th>
                <th scope="col" className="py-3 pr-4 font-medium">
                  Status
                </th>
                <th scope="col" className="py-3 pr-4 font-medium">
                  Dabei seit
                </th>
                <th scope="col" className="py-3 pr-4 font-medium">
                  Zuletzt aktiv
                </th>
              </tr>
            </thead>
            <tbody className="[&_td:first-child]:pl-4 [&_td:last-child]:pr-4">
              {items.map((user) => (
                <UserRow key={user.id} user={user} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        basePath="/admin/mitglieder"
        params={{ q: q || undefined, rolle: role, status }}
        page={page.page}
        perPage={page.perPage}
        total={total}
      />
    </section>
  );
}
