import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-full w-full min-w-0 flex-col items-center justify-center px-6 py-16 text-center">
      <Link href="/" aria-label="Nordlys Solutions home">
        <Image
          src="/logo.png"
          alt=""
          width={280}
          height={280}
          className="mx-auto h-14 w-auto object-contain opacity-90"
        />
      </Link>
      <p className="text-aurora-cyan mt-10 text-xs tracking-[0.22em] uppercase">
        404
      </p>
      <h1 className="mt-4 font-serif text-3xl text-white sm:text-4xl">
        Page not found
      </h1>
      <p className="text-muted mt-3 max-w-sm text-sm leading-relaxed">
        This path doesn&apos;t exist on Nordlys Solutions.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex min-h-11 items-center rounded-full border border-white/15 bg-white/5 px-6 text-sm tracking-wide text-white transition-colors hover:bg-white/10"
      >
        Back to home
      </Link>
    </div>
  );
}
