import { ContactForm } from "@/components/contact-form";
import { Footer } from "@/components/footer";
import { SectionLine } from "@/components/section-line";

export function Contact() {
  return (
    <section
      id="contact"
      className="landing-screen landing-screen--contact relative isolate flex w-full min-w-0 scroll-mt-24 flex-col items-center bg-black"
    >
      <div className="contact-section-panel">
        <div className="contact-section-inner">
          <div className="contact-section-header">
            <SectionLine label="contact beg" />
            <p className="contact-section-eyebrow">Contact</p>
            <h2 className="section-heading contact-section-title font-serif tracking-tight text-white">
              Tell us the problem
            </h2>
            <p className="contact-section-lead">
              Drop a note and we will get back before the next late night.
            </p>
          </div>
          <div className="contact-section-form">
            <div className="aurora-border contact-section-form-card rounded-2xl p-4">
              <ContactForm />
            </div>
          </div>
        </div>
        <SectionLine label="contact end" />
      </div>

      <div className="contact-section-footer">
        <SectionLine label="footer beg" />
        <Footer />
      </div>
    </section>
  );
}
