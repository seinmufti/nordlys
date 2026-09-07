import type { StaticImageData } from "next/image";
import actualTennisImage from "@/assets/projects/actual-tennis.jpg";
import drKaniImage from "@/assets/projects/dr-kani.png";
import jardImage from "@/assets/projects/jard.jpg";
import waslImage from "@/assets/projects/wasl.jpg";

export type ProjectDevice = "mobile" | "desktop";

export type Project = {
  name: string;
  tag: string;
  tagline: string;
  description?: {
    paragraphs: string[];
  };
  /** Platform icons shown under the category on carousel cards. */
  devices?: ProjectDevice[];
  /** Bottom bar fill on carousel cards. */
  accent: string;
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
    tag: "CAD program",
    tagline: "Window frame builder",
    description: {
      paragraphs: [
        "Webapp used for designing aluminum frames on the go.",
        "Featuring a drag and drop pallete which contians 11 parts including: T-rods, windows, doors, etc..\n\nWhich can be used after to export in PDF or high res image for client, plan the build, and calculate costs.",
      ],
    },
    accent: "#14532d",
    href: "https://jard-plum.vercel.app/jardCAD/",
    image: jardImage,
    devices: ["mobile"],
  },
  {
    name: "Actual Tennis",
    tag: "Sports booking",
    tagline: "Match play, scored live",
    description: {
      paragraphs: [
        "Mobile Web app for booking courts for Tennis online.",
        "Shows bookings available AM through PM for the whole day.",
        "Choosing between available courts",
        "Display of rules and prices/offers",
      ],
    },
    accent: "#9db82a",
    href: "https://actualtennis.vercel.app",
    image: actualTennisImage,
    devices: ["mobile"],
  },
  {
    name: "Wasl",
    tag: "Finances",
    tagline: "Invoices on this device",
    description: {
      paragraphs: [
        "Webapp for creating quick and elegant invoices on the go.",
        "Exchange rate fetching from local market via API",
        "Allows to export in A4 format and high res image, either download or share.",
        "3 languages support for creating the invoices for target audience. Generated on the spot.",
      ],
    },
    accent: "#2563eb",
    href: "https://wasl-seinmuftis-projects.vercel.app",
    image: waslImage,
    devices: ["mobile"],
  },
  {
    name: "Dr. Kani",
    tag: "Dentist landing page",
    tagline: "Renowned dental care",
    description: {
      paragraphs: [
        "Elegant landing page for a renowned dentist",
        "Added sliders to reveal before and after images.",
        "A section to hang all the certifications and achievements for display.",
        "Pateints can book an appointment in contact section",
      ],
    },
    accent: "#52525b",
    href: "https://drkani.vercel.app",
    image: drKaniImage,
    devices: ["mobile"],
  },
];
