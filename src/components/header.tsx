import Image from "next/image";

export function Header() {
  // The bar's background matches the logo PNG's black plate so its edges vanish.
  return (
    <header className="sticky top-0 z-30 w-full min-w-0 border-b border-white/10 bg-background">
      <div className="safe-top flex items-center justify-between px-4 pb-3">
        <a
          href="#top"
          className="flex shrink-0 items-center"
          aria-label="Nordlys Solutions home"
        >
          <Image
            src="/logo.png"
            alt="Nordlys Solutions"
            width={280}
            height={280}
            priority
            className="h-12 w-auto object-contain"
          />
        </a>
        <nav
          aria-label="Primary"
          className="-mr-2 flex items-center text-[11px] tracking-[0.18em] text-zinc-300 uppercase"
        >
          <a
            href="#about"
            className="flex min-h-11 items-center px-3 transition-colors hover:text-white"
          >
            About
          </a>
          <a
            href="#projects"
            className="flex min-h-11 items-center px-3 transition-colors hover:text-white"
          >
            Projects
          </a>
          <a
            href="#contact"
            className="flex min-h-11 items-center px-3 transition-colors hover:text-white"
          >
            Contact
          </a>
        </nav>
      </div>
    </header>
  );
}
