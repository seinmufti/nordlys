import { ProjectsCarousel } from "@/components/projects-carousel";
import { SectionLine } from "@/components/section-line";
import { SectionStarfield } from "@/components/section-starfield";

export function Projects() {
  return (
    <div className="projects-section-layout">
      <div className="projects-section-title">
        <SectionLine label="projects beg" />
        <div className="projects-section-heading-wrap">
          <SectionStarfield
            idPrefix="projects"
            className="projects-section-stars"
            density="dense"
          />
          <h2 className="section-heading projects-section-heading relative z-10 font-sans text-white">
            Proud Creations
          </h2>
        </div>
      </div>
      <div className="projects-section-cards">
        <ProjectsCarousel />
      </div>
    </div>
  );
}
