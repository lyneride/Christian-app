"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getUserOrThrow, UnauthorizedError } from "@/lib/auth/dal";
import { failure, fieldErrors, stringValues, type ActionState } from "@/lib/action-state";
import { buildCustomPlan, MAX_DAYS, MAX_RANGES } from "@/lib/plans/custom";
import { startSharedPlan, subscribeToPlan } from "@/lib/plans/start-shared";
import { slugify } from "@/lib/utils";

const schema = z.object({
  mode: z.enum(["custom", "template"]).default("custom"),
  title: z.string().trim().max(80, { error: "Höchstens 80 Zeichen." }).optional().default(""),
  days: z.coerce.number().int({ error: "Bitte eine ganze Zahl." }).min(1, { error: "Mindestens 1 Tag." }).max(MAX_DAYS, { error: `Höchstens ${MAX_DAYS} Tage.` }).optional(),
  templateSlug: z.string().optional().default(""),
  name: z.string().trim().max(80, { error: "Höchstens 80 Zeichen." }).optional().default(""),
  groupId: z.string().optional().transform((v) => (v ? v : null)),
});

function numbers(formData: FormData, key: string): number[] {
  return formData.getAll(key).map((v) => Number(String(v)));
}

/**
 * Creates a self-made plan ("these chapters in N days") or takes a ready-made
 * one, subscribes the user and – when friends or a group are chosen – starts
 * reading together right away.
 */
export async function createCustomPlan(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let user;
  try {
    user = await getUserOrThrow();
  } catch (e) {
    if (e instanceof UnauthorizedError) return failure("Bitte melde dich an.");
    throw e;
  }
  const values = stringValues(formData);
  const parsed = schema.safeParse(values);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), values };
  const input = parsed.data;

  let plan: { id: string; slug: string; title: string };
  if (input.mode === "template") {
    const found = await prisma.readingPlan.findFirst({
      where: { slug: input.templateSlug, OR: [{ isSystem: true }, { authorId: user.id }] },
      select: { id: true, slug: true, title: true },
    });
    if (!found) return failure("Bitte einen Leseplan auswählen.", { values });
    plan = found;
  } else {
    const books = numbers(formData, "book");
    const froms = numbers(formData, "from");
    const tos = numbers(formData, "to");
    const ranges = books.slice(0, MAX_RANGES).map((book, i) => ({ book, from: froms[i], to: tos[i] }));
    const built = buildCustomPlan({ ranges, days: input.days ?? 0 });
    if (!built) return failure("Wähle mindestens ein Buch oder einen Kapitelbereich.", { values });
    if (!input.days) return { ok: false, errors: { days: ["In wie vielen Tagen wollt ihr lesen?"] }, values };
    const title = input.title || built.preview.title;
    const slug = `${slugify(title, 40) || "plan"}-${randomBytes(3).toString("hex")}`;
    const created = await prisma.readingPlan.create({
      data: {
        slug,
        title,
        description: built.preview.description,
        category: "eigen",
        minutesPerDay: built.preview.minutesPerDay,
        dayCount: built.days.length,
        isSystem: false,
        authorId: user.id,
        days: { createMany: { data: built.days.map((readings, i) => ({ day: i + 1, readings: JSON.stringify(readings) })) } },
      },
      select: { id: true, slug: true, title: true },
    });
    plan = created;
  }

  await subscribeToPlan(user.id, plan.id);
  revalidatePath("/leseplaene");
  revalidatePath("/leseplaene/meine");

  const friends = formData.getAll("friends").map(String).filter(Boolean);
  if (friends.length > 0 || input.groupId) {
    const result = await startSharedPlan({ user, plan, name: input.name || `${plan.title} – gemeinsam`, groupId: input.groupId, friends });
    if (!result.ok) return failure(result.message, { values });
    redirect(result.href);
  }
  redirect(`/leseplaene/${plan.slug}`);
}
