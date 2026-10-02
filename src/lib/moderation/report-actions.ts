"use server";

import { prisma } from "@/lib/db";
import { getUserOrThrow, UnauthorizedError, type CurrentUser } from "@/lib/auth/dal";
import { failure, fieldErrors, success, type ActionState } from "@/lib/action-state";
import { notifyMany } from "@/lib/notifications";
import { createReportSchema, REPORT_REASON_LABELS, REPORT_TARGET_LABELS, REPORT_THANKS } from "@/lib/validation/report";

/**
 * Shared "Melden" action for every kind of user content. One open report per
 * person and target; moderators are notified about new reports.
 */

async function actionUser(): Promise<CurrentUser | null> {
  try {
    return await getUserOrThrow();
  } catch (err) {
    if (err instanceof UnauthorizedError) return null;
    throw err;
  }
}

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}

export async function createReport(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const values = { reason: str(formData, "reason"), details: str(formData, "details") };

  const user = await actionUser();
  if (!user) return failure("Bitte melde dich an.", { values });

  const parsed = createReportSchema.safeParse({
    targetType: str(formData, "targetType"),
    targetId: str(formData, "targetId"),
    reason: values.reason,
    details: values.details,
  });
  if (!parsed.success) return failure("Bitte prüfe deine Eingabe.", { errors: fieldErrors(parsed.error), values });

  const { targetType, targetId, reason, details } = parsed.data;

  try {
    const open = await prisma.report.findFirst({
      where: { reporterId: user.id, targetType, targetId, status: "OPEN" },
      select: { id: true },
    });
    if (open) return success("Du hast das schon gemeldet. Wir schauen uns das an.");

    await prisma.report.create({
      data: { reporterId: user.id, targetType, targetId, reason, details: details || null },
    });

    const moderators = await prisma.user.findMany({
      where: { role: { in: ["MODERATOR", "ADMIN"] }, status: "ACTIVE" },
      select: { id: true },
    });
    await notifyMany(
      moderators.map((m) => m.id),
      {
        type: "moderation",
        title: "Neue Meldung",
        body: `${REPORT_TARGET_LABELS[targetType]}: ${REPORT_REASON_LABELS[reason]}`,
        href: "/admin/meldungen",
        actorId: user.id,
      },
    );
  } catch (err) {
    console.error("[moderation] Meldung konnte nicht gespeichert werden:", err);
    return failure("Das hat leider nicht geklappt. Bitte versuche es später noch einmal.", { values });
  }

  return success(REPORT_THANKS);
}
