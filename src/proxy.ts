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

const RERAW_HOSTED_COOKIE = "nordlys-hosted-reraw";

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

function isRerawHosted(request: NextRequest, referer: string) {
  if (isRerawReferer(referer)) return true;
  return request.cookies.get(RERAW_HOSTED_COOKIE)?.value === "1";
}

function viteAppAssetOrigin(request: NextRequest, referer: string): string | null {
  if (isCataloguePlusReferer(referer)) return CATALOGUE_PLUS_ORIGIN;
  if (isRerawHosted(request, referer)) return RERAW_ORIGIN;
  if (isJardSortReferer(referer)) return JARD_SORT_ORIGIN;
  if (isJardCadReferer(referer)) return JARD_CAD_ORIGIN;
  return null;
}

function shouldProxyToViteAppAssets(
  request: NextRequest,
  pathname: string,
  referer: string,
) {
  const origin = viteAppAssetOrigin(request, referer);
  if (!origin) return null;
  if (pathname.startsWith("/assets/")) return origin;
  if (pathname === "/favicon.svg") return origin;
  if (origin === RERAW_ORIGIN) {
    if (pathname.endsWith(".geojson")) return origin;
    if (pathname === "/nordlys-logo.png") return origin;
  }
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

function rerawUpstreamUrl(pathname: string, search: string) {
  let subpath = pathname.slice("/reraw".length);
  if (subpath === "") subpath = "/";
  else if (!subpath.startsWith("/")) subpath = `/${subpath}`;

  const url = new URL(subpath, RERAW_ORIGIN);
  if (search) url.search = search;
  return url;
}

function withRerawHostedCookie(
  request: NextRequest,
  response: NextResponse,
): NextResponse {
  if (!request.nextUrl.pathname.startsWith("/reraw")) {
    return response;
  }

  response.cookies.set(RERAW_HOSTED_COOKIE, "1", {
    path: "/",
    maxAge: 60 * 60 * 24,
    sameSite: "lax",
  });
  return response;
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const referer = request.headers.get("referer") ?? "";

  if (pathname === "/reraw" || pathname.startsWith("/reraw/")) {
    return withRerawHostedCookie(
      request,
      NextResponse.rewrite(rerawUpstreamUrl(pathname, search)),
    );
  }

  if (shouldProxyToDrniveen(pathname, search, referer)) {
    return NextResponse.rewrite(new URL(`${pathname}${search}`, DRNIVEEN_ORIGIN));
  }

  const viteOrigin = shouldProxyToViteAppAssets(request, pathname, referer);
  if (viteOrigin) {
    return NextResponse.rewrite(new URL(`${pathname}${search}`, viteOrigin));
  }

  if (isRerawHosted(request, referer) && pathname.startsWith("/api/")) {
    return NextResponse.rewrite(new URL(`${pathname}${search}`, RERAW_ORIGIN));
  }

  if (!shouldProxyToBait(pathname, search, referer)) {
    return NextResponse.next();
  }

  return NextResponse.rewrite(new URL(`${pathname}${search}`, BAIT_ORIGIN));
}

export const config = {
  matcher: [
    "/reraw",
    "/reraw/:path*",
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
