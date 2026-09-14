import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  findHostedRoute,
  getHostedIframeSrc,
  getHostedProjectIframeAllow,
  getProjectPathSegment,
  hostedApps,
  projects,
} from "@/data/projects";

type PageProps = { params: Promise<{ slug: string; path?: string[] }> };

export function generateStaticParams() {
  return [
    ...projects.map((project) => ({ slug: getProjectPathSegment(project) })),
    ...hostedApps.map((app) => ({ slug: app.slug })),
  ];
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const route = findHostedRoute(slug);
  if (!route) return {};

  return {
    title: `${route.name} | Nordlys Solutions`,
    description: route.tagline,
  };
}

export default async function HostedProjectPage({ params }: PageProps) {
  const { slug, path } = await params;
  const route = findHostedRoute(slug);
  if (!route) notFound();

  const iframeSrc = getHostedIframeSrc(route.href, path);

  return (
    <iframe
      src={iframeSrc}
      title={route.name}
      className="hosted-app-frame"
      allow={getHostedProjectIframeAllow(route.href)}
    />
  );
}
