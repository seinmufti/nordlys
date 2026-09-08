import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  findProjectBySlug,
  getProjectPathSegment,
  projects,
} from "@/data/projects";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((project) => ({ slug: getProjectPathSegment(project) }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = findProjectBySlug(slug);
  if (!project) return {};

  return {
    title: `${project.name} | Nordlys Solutions`,
    description: project.tagline,
  };
}

export default async function HostedProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = findProjectBySlug(slug);
  if (!project) notFound();

  return (
    <iframe
      src={project.href}
      title={project.name}
      className="fixed inset-0 h-full w-full border-0 bg-black"
      allow="fullscreen"
    />
  );
}
