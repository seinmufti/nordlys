import { SectionLine } from "@/components/section-line";

export function Footer() {
  return (
    <>
      <SectionLine label="footer beg" />
      <footer className="safe-bottom px-5 pt-8">
      <div className="mx-auto flex max-w-full flex-col items-center gap-5 text-center text-sm text-muted">
        <div className="flex flex-col items-center gap-1">
          <a
            href="mailto:hussein.mufti01@gmail.com"
            className="flex min-h-11 items-center break-all transition-colors hover:text-white"
          >
            hussein.mufti01@gmail.com
          </a>
          <a
            href="https://github.com/seinmufti"
            target="_blank"
            rel="noreferrer"
            className="flex min-h-11 items-center transition-colors hover:text-white"
          >
            GitHub
          </a>
        </div>
        <p className="text-xs">
          © {new Date().getFullYear()} Nordlys Solutions
        </p>
      </div>
    </footer>
    </>
  );
}
