import type { StaticImageData } from "next/image";
import actualTennisImage from "@/assets/projects/actual-tennis.jpg";
import jardImage from "@/assets/projects/jard.jpg";
import waslImage from "@/assets/projects/wasl.jpg";

export type Project = {
  name: string;
  tag: string;
  tagline: string;
  /** External app URL, embedded in the hosted project page iframe. */
  href: string;
  image?: StaticImageData;
};

/** URL segment from project name, e.g. "Actual Tennis" -> "ActualTennis". */
export function getProjectSlug(name: string): string {
  return name.replace(/\s+/g, "");
}

export function getProjectPath(project: Project): string {
  return `/${getProjectSlug(project.name)}`;
}

export function getProjectLink(project: Project): string {
  return getProjectPath(project);
}

export function findProjectBySlug(slug: string): Project | undefined {
  return projects.find(
    (project) =>
      getProjectSlug(project.name).toLowerCase() === slug.toLowerCase(),
  );
}

export const projects: Project[] = [
  {
    name: "jardCAD",
    tag: "CAD",
    tagline: "Window frame builder",
    href: "https://jard-plum.vercel.app/jardCAD/",
    image: jardImage,
  },
  {
    name: "Actual Tennis",
    tag: "Sports",
    tagline: "Match play, scored live",
    href: "https://actualtennis.vercel.app",
    image: actualTennisImage,
  },
  {
    name: "Wasl",
    tag: "Finance",
    tagline: "Invoices on this device",
    href: "https://wasl-seinmuftis-projects.vercel.app",
    image: waslImage,
  },
  {
    name: "Dr. Kani",
    tag: "Health",
    tagline: "Dental clinic site",
    href: "https://drkani.vercel.app",
  },
  {
    name: "Twakkal",
    tag: "Mobility",
    tagline: "Passenger and driver apps",
    href: "https://twakkal.vercel.app",
  },
  {
    name: "Maarm",
    tag: "Property",
    tagline: "Real estate management",
    href: "https://github.com/seinmufti",
  },
];
