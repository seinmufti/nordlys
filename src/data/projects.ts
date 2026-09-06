import type { StaticImageData } from "next/image";
import actualTennisImage from "@/assets/projects/actual-tennis.jpg";
import jardImage from "@/assets/projects/jard.jpg";
import waslImage from "@/assets/projects/wasl.jpg";

export type Project = {
  name: string;
  tag: string;
  tagline: string;
  href: string;
  image?: StaticImageData;
};

export const projects: Project[] = [
  {
    name: "jardCAD",
    tag: "CAD",
    tagline: "Window frame builder",
    href: "https://jard-plum.vercel.app",
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
