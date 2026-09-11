"use client";

import dynamic from "next/dynamic";

function ProjectsCarouselPlaceholder() {
  return (
    <div
      className="projects-carousel-shell projects-carousel-shell--placeholder"
      aria-hidden="true"
    />
  );
}

const ProjectsCarousel = dynamic(
  () =>
    import("@/components/projects-carousel").then((mod) => mod.ProjectsCarousel),
  {
    ssr: false,
    loading: () => <ProjectsCarouselPlaceholder />,
  },
);

export function Projects() {
  return (
    <div className="projects-section-layout">
      <div className="projects-section-cards">
        <ProjectsCarousel />
      </div>
    </div>
  );
}
