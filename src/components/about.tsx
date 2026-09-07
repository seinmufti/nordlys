"use client";

function DownArrow({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 5v14M6 13l6 6 6-6" />
    </svg>
  );
}

function scrollToProjects() {
  document
    .getElementById("projects")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function About() {
  return (
    <section
      id="about"
      className="about-section relative w-full min-w-0 scroll-mt-24"
    >
      <div className="about-section-inner flex min-h-0 flex-1 flex-col px-5">
        <div className="about-section-copy text-center">
          <div className="about-section-main flex min-h-0 flex-1 flex-col justify-center">
            <div className="about-section-body mx-auto max-w-2xl text-center">
              <p>
                Custom Invoice makers,
                <br />
                Engineering plan designers,
                <br />
                scheduling apps..
                <span className="about-section-tagline about-section-tagline-inline whitespace-nowrap text-white">
                  You name it, we create it.
                </span>
              </p>
            </div>
          </div>

          <div className="about-section-cta flex shrink-0 flex-col items-center text-center">
            <p className="font-serif text-2xl italic text-white">
              Ready to be impressed?
            </p>
            <button
              type="button"
              onClick={scrollToProjects}
              className="about-scroll-arrow mt-[2vh] flex h-14 w-14 items-center justify-center rounded-full border border-white text-white transition-colors hover:text-aurora-cyan"
              aria-label="Scroll to projects"
            >
              <DownArrow className="h-8 w-8" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
