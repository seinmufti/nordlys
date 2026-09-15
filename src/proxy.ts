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

/** Public paths that only Bait Al-Wakalat uses on this domain. */
const BAIT_PUBLIC_PREFIXES = [
  "/brands/",
  "/salons/",
  "/social/",
  "/flags/",
  "/reels/",
];

const BAIT_PUBLIC_FILES = new Set([
  "/nordlys.png",
  "/sr-promo-poster.jpg",
  "/iraq-outline.svg",
  "/iraq-adm1.geojson",
]);

function isNordlysPath(pathname: string) {
  if (pathname === "/" || pathname === "/favicon.ico") return true;
  return NORDLYS_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isBaitalwakalatReferer(referer: string) {
  return /\/baitalwakalat(?:\/|$|\?|#)/.test(referer);
}

function isBaitImageRequest(pathname: string, search: string) {
  if (pathname !== "/_next/image") return false;

  const url = new URLSearchParams(search).get("url");
  if (!url) return false;

  const decoded = decodeURIComponent(url);
  return /^\/(brands|salons|nordlys\.png)(\/|$)/.test(decoded);
}

function shouldProxyToBait(pathname: string, search: string, referer: string) {
  if (isNordlysPath(pathname)) return false;
  if (isBaitImageRequest(pathname, search)) return true;
  if (BAIT_PUBLIC_FILES.has(pathname)) return true;
  if (BAIT_PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return true;
  }
  if (isBaitalwakalatReferer(referer)) return true;
  return false;
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const referer = request.headers.get("referer") ?? "";

  if (!shouldProxyToBait(pathname, search, referer)) {
    return NextResponse.next();
  }

  return NextResponse.rewrite(new URL(`${pathname}${search}`, BAIT_ORIGIN));
}

export const config = {
  matcher: [
    "/_next/:path*",
    "/brands/:path*",
    "/salons/:path*",
    "/social/:path*",
    "/flags/:path*",
    "/reels/:path*",
    "/sr-promo-poster.jpg",
    "/iraq-outline.svg",
    "/iraq-adm1.geojson",
    "/nordlys.png",
    "/logo.png",
  ],
};
