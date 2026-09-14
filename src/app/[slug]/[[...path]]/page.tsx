import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  findHostedRoute,
  getHostedRedirectUrl,
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

  redirect(getHostedRedirectUrl(route.href, path));
}
