import { Contact } from "@/components/contact";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { SectionBraid } from "@/components/section-braid";

export default function Home() {
  return (
    <div className="flex min-h-full w-full min-w-0 flex-col">
      <Header />
      <main className="w-full min-w-0">
        <Hero />
        <SectionBraid />
        <Contact />
      </main>
    </div>
  );
}
