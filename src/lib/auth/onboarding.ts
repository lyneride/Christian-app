import "server-only";
import { cookies } from "next/headers";

/**
 * Rebi's tours start by themselves only for brand-new accounts: registration
 * sets this cookie (on the device used to register) for two weeks. A normal
 * sign-in never sets it, so returning members are not shown the tutorial again.
 */
export const ONBOARDING_COOKIE = "bleibe_onboarding";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 14;

export async function startOnboarding(userId: string): Promise<void> {
  (await cookies()).set(ONBOARDING_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

/** True while the signed-in user is still in their first two weeks on the device they registered with. */
export async function isOnboarding(userId: string): Promise<boolean> {
  return (await cookies()).get(ONBOARDING_COOKIE)?.value === userId;
}
