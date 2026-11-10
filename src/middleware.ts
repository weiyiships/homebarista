import { NextResponse, type NextRequest } from "next/server";
import { hasBaristaSession } from "@/lib/auth/baristaSession";

/**
 * Barista routes require the shared-passcode session (FR-3, PRD §9).
 * Route handlers re-check the session; this is the first line of defense.
 */

const LOGIN_PAGE = "/barista/login";
const LOGIN_API = "/api/barista/session";
const ORDER_STATUS_API = /^\/api\/orders\/[^/]+\/status\/?$/;

function isProtectedApi(pathname: string) {
  return (
    (pathname.startsWith("/api/barista/") && pathname !== LOGIN_API) ||
    ORDER_STATUS_API.test(pathname)
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authed = await hasBaristaSession(request);

  if (pathname === LOGIN_PAGE) {
    return authed
      ? NextResponse.redirect(new URL("/barista", request.url))
      : NextResponse.next();
  }

  if (authed) return NextResponse.next();

  if (isProtectedApi(pathname)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (pathname === "/barista" || pathname.startsWith("/barista/")) {
    const loginUrl = new URL(LOGIN_PAGE, request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/barista/:path*", "/api/barista/:path*", "/api/orders/:id/status"],
};
