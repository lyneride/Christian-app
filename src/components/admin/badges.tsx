import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { REPORT_REASON_LABELS, REPORT_TARGET_LABELS } from "@/lib/validation/report";
import {
  REPORT_STATUS_LABELS,
  ROLE_LABELS,
  USER_STATUS_LABELS,
  type UserRoleValue,
  type UserStatusFilter,
} from "@/lib/validation/admin";

/** Small, consistent labels for roles, statuses and report metadata in the moderation area. */

const roleVariants: Record<UserRoleValue, BadgeVariant> = { USER: "outline", MODERATOR: "primary", ADMIN: "accent" };

export function RoleBadge({ role }: { role: UserRoleValue }) {
  return <Badge variant={roleVariants[role]}>{ROLE_LABELS[role]}</Badge>;
}

const statusVariants: Record<UserStatusFilter, BadgeVariant> = {
  ACTIVE: "success",
  SUSPENDED: "danger",
  DELETED: "default",
};

export function UserStatusBadge({ status }: { status: UserStatusFilter }) {
  return <Badge variant={statusVariants[status]}>{USER_STATUS_LABELS[status]}</Badge>;
}

const reportStatusVariants: Record<keyof typeof REPORT_STATUS_LABELS, BadgeVariant> = {
  OPEN: "warning",
  RESOLVED: "success",
  DISMISSED: "default",
};

export function ReportStatusBadge({ status }: { status: keyof typeof REPORT_STATUS_LABELS }) {
  return <Badge variant={reportStatusVariants[status]}>{REPORT_STATUS_LABELS[status]}</Badge>;
}

const reasonVariants: Record<string, BadgeVariant> = {
  spam: "default",
  beleidigung: "danger",
  falschlehre: "warning",
  "persoenliche-daten": "danger",
  anderes: "outline",
};

export function reasonLabel(reason: string): string {
  return (REPORT_REASON_LABELS as Record<string, string>)[reason] ?? reason;
}

export function ReasonBadge({ reason }: { reason: string }) {
  return <Badge variant={reasonVariants[reason] ?? "outline"}>{reasonLabel(reason)}</Badge>;
}

export function targetTypeLabel(type: string): string {
  return (REPORT_TARGET_LABELS as Record<string, string>)[type] ?? type;
}

export function TargetTypeBadge({ type }: { type: string }) {
  return <Badge variant="outline">{targetTypeLabel(type)}</Badge>;
}
