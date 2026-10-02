import { NextResponse, type NextRequest } from "next/server";
import { destroySession } from "@/lib/auth/session";

/**
 * Logout endpoint for plain HTML forms: `<form method="post" action="/abmelden">`.
 * Responds with 303 so the browser follows up with a GET (a 307 would re-POST).
 * The session cookie is SameSite=Lax, so cross-site POSTs carry no session.
 */
export async function POST(request: NextRequest) {
  await destroySession();
  return NextResponse.redirect(new URL("/?nachricht=abgemeldet", request.url), 303);
}

/** A GET (typed URL, prefetch) must not log anyone out; just go home. */
export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL("/", request.url), 303);
}
