import { Contact } from "@/components/contact";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";

export default function Home() {
  return (
    <div className="flex min-h-full w-full min-w-0 flex-col">
      <Header />
      <main className="w-full min-w-0">
        <Hero />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
