import type { Rewrite } from "next/dist/lib/load-custom-routes";
import { hostedRoutes } from "./hosted-routes";

function destinationBase(href: string): string {
  const url = new URL(href.endsWith("/") ? href : `${href}/`);
  const path = url.pathname.replace(/\/$/, "");
  return `${url.origin}${path}`;
}

/** next.config beforeFiles rules — proxy slug paths to each hosted app origin. */
export function buildHostedRewrites(): Rewrite[] {
  const rewrites: Rewrite[] = [];

  for (const { slug, href } of hostedRoutes) {
    const dest = destinationBase(href);
    rewrites.push(
      { source: `/${slug}`, destination: dest },
      { source: `/${slug}/`, destination: `${dest}/` },
      { source: `/${slug}/:path*`, destination: `${dest}/:path*` },
    );
  }

  return rewrites;
}
