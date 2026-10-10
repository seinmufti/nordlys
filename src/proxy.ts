import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BAIT_ORIGIN = "https://baitalwakalat.vercel.app";
const DRNIVEEN_ORIGIN = "https://drniveensalayi.vercel.app";
const JARD_CAD_ORIGIN = "https://jard-plum.vercel.app";
const JARD_SORT_ORIGIN = "https://jardsort.vercel.app";
const CATALOGUE_PLUS_ORIGIN = "https://catalogueplus.vercel.app";
const RERAW_ORIGIN = "https://reraw.vercel.app";

/** Nordlys-owned paths that must never be proxied to Bait Al-Wakalat. */
const NORDLYS_PREFIXES = [
  "/api/",
  "/wasl",
  "/drkani",
  "/drniveen",
  "/jardCAD",
  "/jardSORT",
  "/catalogueplus",
  "/reraw",
  "/ActualTennis",
  "/actualtennis",
  "/pr-logger",
];

/** Public paths that only Dr. Niveen uses on this domain (root-relative build). */
const DRNIVEEN_PUBLIC_PREFIXES = ["/images/", "/videos/"];

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
  "/sr-promo.mp4",
  "/sr-promo-mobile.mp4",
  "/sr-promo-web.mp4",
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

function isDrniveenReferer(referer: string) {
  return /\/drniveen(?:\/|$|\?|#)/.test(referer);
}

function isJardCadReferer(referer: string) {
  return /\/jardCAD(?:\/|$|\?|#)/.test(referer);
}

function isJardSortReferer(referer: string) {
  return /\/jardSORT(?:\/|$|\?|#)/.test(referer);
}

function isCataloguePlusReferer(referer: string) {
  return /\/catalogueplus(?:\/|$|\?|#)/.test(referer);
}

function isRerawReferer(referer: string) {
  return /\/reraw(?:\/|$|\?|#)/.test(referer);
}

function viteAppAssetOrigin(referer: string): string | null {
  if (isCataloguePlusReferer(referer)) return CATALOGUE_PLUS_ORIGIN;
  if (isRerawReferer(referer)) return RERAW_ORIGIN;
  if (isJardSortReferer(referer)) return JARD_SORT_ORIGIN;
  if (isJardCadReferer(referer)) return JARD_CAD_ORIGIN;
  return null;
}

function shouldProxyToViteAppAssets(pathname: string, referer: string) {
  const origin = viteAppAssetOrigin(referer);
  if (!origin) return null;
  if (pathname.startsWith("/assets/")) return origin;
  if (pathname === "/favicon.svg") return origin;
  return null;
}

function isBaitImageRequest(pathname: string, search: string) {
  if (pathname !== "/_next/image") return false;

  const url = new URLSearchParams(search).get("url");
  if (!url) return false;

  const decoded = decodeURIComponent(url);
  return /^\/(brands|salons|nordlys\.png)(\/|$)/.test(decoded);
}

function isDrniveenImageRequest(pathname: string, search: string) {
  if (pathname !== "/_next/image") return false;

  const url = new URLSearchParams(search).get("url");
  if (!url) return false;

  const decoded = decodeURIComponent(url);
  return /^\/images\//.test(decoded);
}

function shouldProxyToDrniveen(pathname: string, search: string, referer: string) {
  if (!isDrniveenReferer(referer)) return false;
  if (pathname.startsWith("/_next/")) return true;
  if (isDrniveenImageRequest(pathname, search)) return true;
  if (DRNIVEEN_PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return true;
  }
  return pathname === "/favicon.ico";
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

  if (shouldProxyToDrniveen(pathname, search, referer)) {
    return NextResponse.rewrite(new URL(`${pathname}${search}`, DRNIVEEN_ORIGIN));
  }

  const viteOrigin = shouldProxyToViteAppAssets(pathname, referer);
  if (viteOrigin) {
    return NextResponse.rewrite(new URL(`${pathname}${search}`, viteOrigin));
  }

  if (isRerawReferer(referer) && pathname.startsWith("/api/")) {
    return NextResponse.rewrite(new URL(`${pathname}${search}`, RERAW_ORIGIN));
  }

  if (!shouldProxyToBait(pathname, search, referer)) {
    return NextResponse.next();
  }

  return NextResponse.rewrite(new URL(`${pathname}${search}`, BAIT_ORIGIN));
}

export const config = {
  matcher: [
    "/_next/:path*",
    "/assets/:path*",
    "/images/:path*",
    "/videos/:path*",
    "/favicon.ico",
    "/favicon.svg",
    "/api/:path*",
    "/brands/:path*",
    "/salons/:path*",
    "/social/:path*",
    "/flags/:path*",
    "/reels/:path*",
    "/sr-promo.mp4",
    "/sr-promo-mobile.mp4",
    "/sr-promo-web.mp4",
    "/sr-promo-poster.jpg",
    "/iraq-outline.svg",
    "/iraq-adm1.geojson",
    "/nordlys.png",
    "/logo.png",
  ],
};
