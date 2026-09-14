import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BAIT_ORIGIN = "https://baitalwakalat.vercel.app";

const NORDLYS_PATHS = [
  "/api/",
  "/wasl",
  "/drkani",
  "/jardCAD",
  "/ActualTennis",
  "/pr-logger",
];

function isNordlysPath(pathname: string) {
  if (pathname === "/" || pathname === "/favicon.ico") return true;
  return NORDLYS_PATHS.some((prefix) => pathname.startsWith(prefix));
}

function baitUrl(pathname: string, search: string) {
  const destPath =
    pathname === "/baitalwakalat" || pathname === "/baitalwakalat/"
      ? "/"
      : pathname.replace(/^\/baitalwakalat/, "") || "/";
  return new URL(`${destPath}${search}`, BAIT_ORIGIN);
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const referer = request.headers.get("referer") ?? "";
  const fromBait = /\/baitalwakalat(?:\/|$|\?)/.test(referer);

  if (pathname === "/baitalwakalat" || pathname.startsWith("/baitalwakalat/")) {
    return NextResponse.rewrite(baitUrl(pathname, search));
  }

  if (fromBait && !isNordlysPath(pathname)) {
    return NextResponse.rewrite(new URL(`${pathname}${search}`, BAIT_ORIGIN));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/baitalwakalat",
    "/baitalwakalat/:path*",
    {
      source: "/_next/:path*",
      has: [{ type: "header", key: "referer", value: ".*\\/baitalwakalat.*" }],
    },
    {
      source: "/:path*",
      has: [{ type: "header", key: "referer", value: ".*\\/baitalwakalat.*" }],
    },
  ],
};
