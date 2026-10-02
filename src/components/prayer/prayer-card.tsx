import Link from "next/link";
import { MessageCircle, Users } from "lucide-react";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { markdownToText } from "@/lib/markdown";
import { supportSummary } from "@/lib/prayer/format";
import type { PrayerRequestListItem } from "@/lib/prayer/queries";
import { formatRelative } from "@/lib/utils";
import { CATEGORY_LABELS, isPrayerCategory, PRAYER_STATUS_LABELS } from "@/lib/validation/prayer";
import type { Viewer } from "@/lib/visibility";
import { AuthorLine } from "./author-line";
import { PrayButton } from "./pray-button";

export function categoryLabel(category: string): string {
  return CATEGORY_LABELS[isPrayerCategory(category) ? category : "allgemein"].label;
}

const statusVariant: Record<PrayerRequestListItem["status"], BadgeVariant | null> = {
  OPEN: null,
  ANSWERED: "success",
  CLOSED: "outline",
};

export function StatusBadge({ status }: { status: PrayerRequestListItem["status"] }) {
  const variant = statusVariant[status];
  if (!variant) return null;
  return <Badge variant={variant}>{PRAYER_STATUS_LABELS[status]}</Badge>;
}

export function canRevealAuthor(viewer: Viewer | null, authorId: string): boolean {
  return !!viewer && (viewer.id === authorId || viewer.role === "MODERATOR" || viewer.role === "ADMIN");
}

export function PrayerCard({ item, viewer }: { item: PrayerRequestListItem; viewer: Viewer | null }) {
  const href = `/gebet/${item.id}`;
  const comments = item._count.comments;

  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="primary">{categoryLabel(item.category)}</Badge>
          <StatusBadge status={item.status} />
          {item.visibility === "GROUP" ? (
            <Badge variant="outline">
              <Users aria-hidden="true" className="size-3" /> Nur Gruppe
            </Badge>
          ) : null}
        </div>

        <h2 className="text-lg font-semibold tracking-tight">
          <Link href={href} className="hover:underline">
            {item.title}
          </Link>
        </h2>
        <p className="text-muted-foreground text-sm">{markdownToText(item.body, 180)}</p>

        <AuthorLine
          author={item.author}
          isAnonymous={item.isAnonymous}
          reveal={canRevealAuthor(viewer, item.authorId)}
          size="xs"
          meta={<time dateTime={item.createdAt.toISOString()}>{formatRelative(item.createdAt)}</time>}
        />

        <div className="border-border flex flex-wrap items-center justify-between gap-3 border-t pt-3">
          <p className="text-muted-foreground text-sm">
            {supportSummary({ total: item.supporters, today: item.today })}
          </p>
          <div className="flex items-center gap-3">
            <Link
              href={`${href}#ermutigungen`}
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
              aria-label={`${comments} ${comments === 1 ? "Ermutigung" : "Ermutigungen"}`}
            >
              <MessageCircle aria-hidden="true" className="size-4" />
              {comments}
            </Link>
            <PrayButton requestId={item.id} prayed={item.prayedToday} signedIn={viewer !== null} nextPath="/gebet" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
