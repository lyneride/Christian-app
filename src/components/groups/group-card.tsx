import Link from "next/link";
import { Globe, Lock, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { GroupListItem } from "@/lib/groups/queries";
import { markdownToText } from "@/lib/markdown";
import { cn, pluralize } from "@/lib/utils";
import { groupPath } from "@/lib/validation/community";
import { GROUP_KIND_LABELS } from "@/lib/validation/groups";

/** Online / Vor Ort badge with the city for local groups. */
export function GroupKindBadge({ kind, city }: { kind: GroupListItem["kind"]; city: string | null }) {
  const Icon = kind === "LOCAL" ? MapPin : Globe;
  return (
    <Badge variant={kind === "LOCAL" ? "accent" : "primary"}>
      <Icon className="size-3" aria-hidden="true" />
      {kind === "LOCAL" && city ? city : GROUP_KIND_LABELS[kind].label}
    </Badge>
  );
}

/** Group teaser for the overview grid. */
export function GroupCard({ group, className }: { group: GroupListItem; className?: string }) {
  const href = groupPath(group.slug);
  return (
    <article className={cn("flex flex-col overflow-hidden rounded-card border border-border bg-surface shadow-soft transition hover:border-primary/40", className)}>
      {group.imageUrl ? (
        <div aria-hidden="true" className="h-32 w-full bg-surface-muted bg-cover bg-center" style={{ backgroundImage: `url("${group.imageUrl}")` }} />
      ) : null}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-1.5">
          <GroupKindBadge kind={group.kind} city={group.city} />
          {group.visibility === "PRIVATE" ? (
            <Badge variant="outline">
              <Lock className="size-3" aria-hidden="true" /> Geschlossen
            </Badge>
          ) : null}
        </div>
        <h2 className="text-lg font-semibold tracking-tight">
          <Link href={href} className="after:absolute after:inset-0 hover:underline">
            {group.name}
          </Link>
        </h2>
        <p className="line-clamp-3 text-sm text-muted-foreground">{markdownToText(group.description, 180)}</p>
        <p className="mt-auto flex items-center gap-1.5 pt-1 text-sm text-muted-foreground">
          <Users className="size-4" aria-hidden="true" />
          {pluralize(group._count.members, "Mitglied", "Mitglieder")}
        </p>
      </div>
    </article>
  );
}
