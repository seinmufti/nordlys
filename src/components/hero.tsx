import Image from "next/image";
import { Projects } from "@/components/projects";
import heroImage from "@/assets/hero.jpg";

export function Hero() {
  return (
    <section
      id="top"
      className="relative isolate flex w-full min-w-0 flex-col items-center bg-black"
    >
      <div className="hero-banner w-full max-w-none overflow-hidden">
        <div className="hero-banner-image" aria-hidden="true">
          <Image
            src={heroImage}
            alt=""
            fill
            priority
            sizes="100vw"
            unoptimized
            className="object-cover object-center"
          />
        </div>

        <h1 className="hero-brand flex flex-col items-center justify-center text-center font-sans font-black uppercase">
          <span className="hero-brand-name block text-white">Nordlys</span>
          <span className="hero-brand-solutions mt-1 block text-white sm:mt-2">
            Solutions
          </span>
        </h1>

        <p className="hero-motto relative z-10 w-full shrink-0 whitespace-nowrap text-center font-serif italic text-white">
          -- One more problem before sleep --
        </p>
      </div>

      <Projects />
    </section>
  );
}
