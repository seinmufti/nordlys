import { ContactForm } from "@/components/contact-form";

export function Contact() {
  return (
    <section
      id="contact"
      className="relative scroll-mt-24 px-5 py-20 sm:px-8 sm:py-28 lg:py-32"
    >
      <div className="mx-auto grid max-w-6xl gap-8 sm:gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <div className="text-center lg:text-left">
          <p className="text-[10px] font-medium tracking-[0.28em] text-aurora-purple uppercase sm:text-xs">
            Contact
          </p>
          <h2 className="section-heading font-serif mt-2.5 tracking-tight text-white sm:mt-3">
            Tell us the problem
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted sm:mt-4 sm:text-base lg:mx-0">
            Drop a note and we will get back before the next late night.
          </p>
        </div>
        <div className="aurora-border rounded-2xl p-5 sm:p-8">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
