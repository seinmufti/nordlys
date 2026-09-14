import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BAIT_ORIGIN = "https://baitalwakalat.vercel.app";

function baitUrl(pathname: string, search: string) {
  const destPath =
    pathname === "/baitalwakalat" || pathname === "/baitalwakalat/"
      ? "/"
      : pathname.replace(/^\/baitalwakalat/, "") || "/";
  return new URL(`${destPath}${search}`, BAIT_ORIGIN);
}

function withAbsoluteAssets(html: string) {
  return html
    .replaceAll('"/_next/', `"${BAIT_ORIGIN}/_next/`)
    .replaceAll("'/_next/", `'${BAIT_ORIGIN}/_next/`);
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (pathname !== "/baitalwakalat" && !pathname.startsWith("/baitalwakalat/")) {
    return NextResponse.next();
  }

  const upstream = await fetch(baitUrl(pathname, search), {
    headers: {
      accept: request.headers.get("accept") ?? "*/*",
      "user-agent": request.headers.get("user-agent") ?? "",
    },
  });

  const contentType = upstream.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) {
    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: {
        "content-type": contentType,
      },
    });
  }

  const html = withAbsoluteAssets(await upstream.text());
  return new NextResponse(html, {
    status: upstream.status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store, must-revalidate",
    },
  });
}

export const config = {
  matcher: ["/baitalwakalat", "/baitalwakalat/:path*"],
};
