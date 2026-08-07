import { NextResponse, type NextRequest } from "next/server";

/**
 * Session proxy (Next.js 16's rename of the "middleware" file
 * convention this vertical slice originally used) — a lightweight,
 * cookie-presence-only check.
 *
 * This is deliberately NOT where authorization is enforced. Prisma's
 * SQLite driver cannot run in the Edge runtime this proxy executes in,
 * so a full session/Role Assignment lookup happens instead in
 * `requireSessionUser()` (src/services/identity/authorization.ts),
 * called by every protected layout — that is the single, centralized,
 * authoritative enforcement point per Security Architecture's "no
 * scattered checks" rule. This middleware only improves the experience
 * for the common case (no cookie at all) by redirecting before a
 * protected page starts rendering; it is not a security boundary on its
 * own; the real check will still be run before any authorized-only data
 * would ever be read or rendered, even if a request somehow reached a
 * page with a stale or forged cookie value.
 */
const PROTECTED_PREFIXES = ["/dashboard", "/student", "/faculty", "/program-director", "/admin"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (!isProtected) {
    return NextResponse.next();
  }

  const hasSessionCookie = request.cookies.has("minara_session");
  if (!hasSessionCookie) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/student/:path*", "/faculty/:path*", "/program-director/:path*", "/admin/:path*"],
};
