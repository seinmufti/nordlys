import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { projects } from "@/data/projects";

type PageProps = { params: Promise<{ slug: string }> };

function findHostedProject(slug: string) {
  return projects.find(
    (project) =>
      project.path &&
      project.path.slice(1).toLowerCase() === slug.toLowerCase(),
  );
}

export function generateStaticParams() {
  return projects
    .filter((project) => project.path)
    .map((project) => ({ slug: project.path!.slice(1) }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = findHostedProject(slug);
  if (!project) return {};

  return {
    title: `${project.name} | Nordlys Solutions`,
    description: project.tagline,
  };
}

export default async function HostedProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = findHostedProject(slug);
  if (!project?.path) notFound();

  return (
    <iframe
      src={project.href}
      title={project.name}
      className="fixed inset-0 h-full w-full border-0 bg-black"
      allow="fullscreen"
    />
  );
}
