import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/server/auth";

const publicPaths = ["/login", "/api/auth/login", "/api/auth/logout"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon") || pathname === "/") {
    const isLoggedIn = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!isLoggedIn && !publicPaths.includes(pathname)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (isLoggedIn && pathname === "/login") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    if (pathname.startsWith("/api/auth")) return NextResponse.next();
    const session = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!session) {
      return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
    }
    return NextResponse.next();
  }

  const isLoggedIn = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
