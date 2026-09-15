import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BAIT_ORIGIN = "https://baitalwakalat.vercel.app";

/** Nordlys-owned paths that must never be proxied to Bait Al-Wakalat. */
const NORDLYS_PREFIXES = [
  "/api/",
  "/wasl",
  "/drkani",
  "/jardCAD",
  "/ActualTennis",
  "/actualtennis",
  "/pr-logger",
];

function isNordlysPath(pathname: string) {
  if (pathname === "/" || pathname === "/favicon.ico") return true;
  return NORDLYS_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isBaitalwakalatReferer(referer: string) {
  return /\/baitalwakalat(?:\/|$|\?|#)/.test(referer);
}

export function proxy(request: NextRequest) {
  const referer = request.headers.get("referer") ?? "";
  if (!isBaitalwakalatReferer(referer)) {
    return NextResponse.next();
  }

  const { pathname, search } = request.nextUrl;
  if (isNordlysPath(pathname)) {
    return NextResponse.next();
  }

  return NextResponse.rewrite(new URL(`${pathname}${search}`, BAIT_ORIGIN));
}

export const config = {
  matcher: [
    "/_next/:path*",
    "/social/:path*",
    "/flags/:path*",
    "/reels/:path*",
    "/sr-promo-poster.jpg",
    "/iraq-outline.svg",
    "/iraq-adm1.geojson",
    "/logo.png",
  ],
};
