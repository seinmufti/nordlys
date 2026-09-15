import type { Rewrite } from "next/dist/lib/load-custom-routes";
import { hostedRoutes } from "./hosted-routes";

const BAIT_ORIGIN = "https://baitalwakalat.vercel.app";

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

  // jardCAD is built with base `/`, so its HTML requests /assets on this origin.
  rewrites.push({
    source: "/assets/:path*",
    destination: "https://jard-plum.vercel.app/assets/:path*",
  });

  // Bait Al-Wakalat uses root-relative /public paths Nordlys does not own.
  for (const prefix of ["brands", "salons", "social", "flags", "reels"] as const) {
    rewrites.push({
      source: `/${prefix}/:path*`,
      destination: `${BAIT_ORIGIN}/${prefix}/:path*`,
    });
  }

  for (const asset of [
    "nordlys.png",
    "sr-promo-poster.jpg",
    "iraq-outline.svg",
    "iraq-adm1.geojson",
  ] as const) {
    rewrites.push({
      source: `/${asset}`,
      destination: `${BAIT_ORIGIN}/${asset}`,
    });
  }

  // Run before Nordlys' own /_next/image handler for Bait-only sources.
  for (const prefix of ["brands", "salons"] as const) {
    rewrites.push({
      source: "/_next/image",
      has: [{ type: "query", key: "url", value: `/${prefix}/.*` }],
      destination: `${BAIT_ORIGIN}/_next/image`,
    });
  }

  rewrites.push(
    {
      source: "/_next/image",
      has: [{ type: "query", key: "url", value: "/nordlys.png" }],
      destination: `${BAIT_ORIGIN}/_next/image`,
    },
    {
      source: "/_next/image",
      has: [
        { type: "query", key: "url", value: "/logo.png" },
        { type: "header", key: "referer", value: ".*\\/baitalwakalat.*" },
      ],
      destination: `${BAIT_ORIGIN}/_next/image`,
    },
  );

  return rewrites;
}
