import { ContactForm } from "@/components/contact-form";
import { SectionLine } from "@/components/section-line";

export function Contact() {
  return (
    <section
      id="contact"
      className="relative scroll-mt-24 px-5 py-16"
    >
      <div className="mx-auto flex max-w-full flex-col gap-8">
        <div className="text-center">
          <SectionLine label="contact beg" />
          <p className="mt-3 text-[10px] font-medium tracking-[0.28em] text-aurora-purple uppercase">
            Contact
          </p>
          <h2 className="section-heading font-serif mt-2.5 tracking-tight text-white">
            Tell us the problem
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted">
            Drop a note and we will get back before the next late night.
          </p>
        </div>
        <div>
          <div className="aurora-border rounded-2xl p-5">
            <ContactForm />
          </div>
          <SectionLine label="contact end" />
        </div>
      </div>
    </section>
  );
}
