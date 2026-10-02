"use server";

import { revalidatePath } from "next/cache";
import { type ActionState, failure, success } from "@/lib/action-state";
import { getCurrentUser } from "@/lib/auth/dal";
import { prisma } from "@/lib/db";
import { usernameSchema } from "@/lib/validation/auth";

const NOT_FOUND = "Dieses Profil gibt es nicht.";

/** Follows the member when not yet followed, otherwise unfollows. Signature fits `useActionState`. */
export async function toggleFollow(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const viewer = await getCurrentUser();
  if (!viewer) return failure("Bitte melde dich an, um Mitgliedern zu folgen.");

  const parsed = usernameSchema.safeParse(formData.get("username"));
  if (!parsed.success) return failure(NOT_FOUND);
  const username = parsed.data;

  try {
    const target = await prisma.user.findUnique({ where: { username }, select: { id: true, status: true } });
    if (!target || target.status !== "ACTIVE") return failure(NOT_FOUND);
    if (target.id === viewer.id) return failure("Dir selbst kannst du nicht folgen.");

    const key = { followerId: viewer.id, followingId: target.id };
    const existing = await prisma.follow.findUnique({ where: { followerId_followingId: key }, select: { followerId: true } });
    let following: boolean;
    if (existing) {
      await prisma.follow.deleteMany({ where: key });
      following = false;
    } else {
      try {
        await prisma.follow.create({ data: key });
      } catch (err) {
        // Created concurrently by a second click; that is the state we wanted.
        if ((err as { code?: string })?.code !== "P2002") throw err;
      }
      following = true;
    }

    revalidatePath(`/profil/${username}`);
    revalidatePath(`/profil/${viewer.username}`);
    return success(following ? "Du folgst diesem Mitglied jetzt." : "Du folgst diesem Mitglied nicht mehr.", {
      data: { following },
    });
  } catch (err) {
    console.error("[profil] Folgen fehlgeschlagen:", err);
    return failure("Das hat leider nicht geklappt. Bitte versuche es später noch einmal.");
  }
}
