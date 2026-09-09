import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  findHostedRoute,
  getHostedProjectIframeAllow,
  getProjectPathSegment,
  hostedApps,
  projects,
} from "@/data/projects";

type PageProps = { params: Promise<{ slug: string }> };

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
  const { slug } = await params;
  const route = findHostedRoute(slug);
  if (!route) notFound();

  return (
    <iframe
      src={route.href}
      title={route.name}
      className="fixed inset-0 h-full w-full border-0 bg-black"
      allow={getHostedProjectIframeAllow(route.href)}
    />
  );
}
