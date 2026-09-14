/**
 * Slug → deployment URL for next.config rewrites.
 * Keep href values in sync with projects.ts; safe to import here (no image imports).
 */
export type HostedRoute = {
  slug: string;
  href: string;
};

export const hostedRoutes: HostedRoute[] = [
  { slug: "jardCAD", href: "https://jard-plum.vercel.app/jardCAD/" },
  { slug: "ActualTennis", href: "https://actualtennis.vercel.app" },
  // Vite base is lowercase; HTML requests /actualtennis/assets/...
  { slug: "actualtennis", href: "https://actualtennis.vercel.app/actualtennis/" },
  { slug: "wasl", href: "https://wasl-pi.vercel.app/wasl/" },
  { slug: "drkani", href: "https://drkani-seven.vercel.app/drkani/" },
  { slug: "pr-logger", href: "https://pr-logger-railway.vercel.app/" },
];
