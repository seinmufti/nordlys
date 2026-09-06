import { Contact } from "@/components/contact";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <main>
        <Hero />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
