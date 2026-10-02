import type { PostKind } from "@/generated/prisma/enums";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { POST_KIND_LABELS } from "@/lib/validation/community";

const VARIANTS: Record<PostKind, BadgeVariant> = {
  POST: "default",
  QUESTION: "primary",
  TESTIMONY: "accent",
  IMPULSE: "success",
};

/** Small label for the post kind (Beitrag / Frage / Zeugnis / Impuls). Plain posts render nothing. */
export function KindBadge({ kind, className }: { kind: PostKind; className?: string }) {
  if (kind === "POST") return null;
  return (
    <Badge variant={VARIANTS[kind]} className={className}>
      {POST_KIND_LABELS[kind].label}
    </Badge>
  );
}
