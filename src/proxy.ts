import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "bleibe_session";

/** Route prefixes that require a signed-in user (optimistic check; pages re-verify via the DAL). */
const PROTECTED_PREFIXES = ["/start", "/profil/bearbeiten", "/einstellungen", "/tagebuch", "/merken", "/nachrichten", "/admin", "/benachrichtigungen"];
/** Pages that signed-in users should not see again. */
const GUEST_ONLY = ["/anmelden", "/registrieren"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  if (!hasSession && PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    const url = new URL("/anmelden", request.url);
    url.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }

  if (hasSession && GUEST_ONLY.includes(pathname)) {
    return NextResponse.redirect(new URL("/start", request.url));
  }

  const response = NextResponse.next();
  // Conservative security headers (CSP is set in next.config.ts headers()).
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon.svg|logo.svg|manifest.webmanifest|robots.txt|sitemap.xml|sw.js).*)"],
};
