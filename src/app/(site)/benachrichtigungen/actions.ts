"use server";

import { revalidatePath } from "next/cache";
import { getUserOrThrow, UnauthorizedError } from "@/lib/auth/dal";
import { failure, success, type ActionState } from "@/lib/action-state";
import { markAllRead } from "@/lib/notifications";

/** Marks every notification of the current user as read. */
export async function markAllNotificationsRead(_prev: ActionState, _formData: FormData): Promise<ActionState> {
  let userId: string;
  try {
    userId = (await getUserOrThrow()).id;
  } catch (err) {
    if (err instanceof UnauthorizedError) return failure("Bitte melde dich an.");
    throw err;
  }

  try {
    await markAllRead(userId);
  } catch (err) {
    console.error("[benachrichtigungen] Konnte nicht als gelesen markieren:", err);
    return failure("Das hat leider nicht geklappt. Bitte versuche es später noch einmal.");
  }

  revalidatePath("/benachrichtigungen");
  return success("Alles gelesen.");
}
