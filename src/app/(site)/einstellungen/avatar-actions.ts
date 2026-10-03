"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getUserOrThrow, UnauthorizedError } from "@/lib/auth/dal";
import { failure, success, type ActionState } from "@/lib/action-state";
import { AvatarError, deleteAvatar, storeAvatar } from "@/lib/uploads/avatar";

function revalidate(username: string) {
  revalidatePath("/einstellungen/profil");
  revalidatePath(`/profil/${username}`);
  revalidatePath("/", "layout");
}

export async function uploadAvatar(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const user = await getUserOrThrow();
    const file = formData.get("avatar");
    if (!(file instanceof File)) return failure("Bitte eine Bilddatei auswählen.");
    const url = await storeAvatar(user.id, file);
    if (user.avatarUrl && user.avatarUrl !== url) await deleteAvatar(user.avatarUrl);
    await prisma.user.update({ where: { id: user.id }, data: { avatarUrl: url } });
    revalidate(user.username);
    return success("Profilbild aktualisiert.", { data: { url } });
  } catch (e) {
    if (e instanceof UnauthorizedError) return failure("Bitte melde dich an.");
    if (e instanceof AvatarError) return failure(e.message);
    console.error(e);
    return failure("Das Bild konnte nicht gespeichert werden. Bitte versuch es noch einmal.");
  }
}

export async function removeAvatar(): Promise<ActionState> {
  try {
    const user = await getUserOrThrow();
    await deleteAvatar(user.avatarUrl);
    await prisma.user.update({ where: { id: user.id }, data: { avatarUrl: null } });
    revalidate(user.username);
    return success("Profilbild entfernt.");
  } catch (e) {
    if (e instanceof UnauthorizedError) return failure("Bitte melde dich an.");
    console.error(e);
    return failure("Das Bild konnte nicht entfernt werden.");
  }
}
