export function Footer() {
  return (
    <footer className="safe-bottom border-t border-white/10 px-5 pt-8 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 text-center text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:text-left">
        <div className="flex flex-col items-center gap-1 sm:flex-row sm:gap-5">
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
        <p className="text-xs sm:text-sm">
          © {new Date().getFullYear()} Nordlys Solutions
        </p>
      </div>
    </footer>
  );
}
