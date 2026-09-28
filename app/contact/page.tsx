import type { Metadata } from "next";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { ContactForm } from "./contact-form";
import styles from "./contact.module.css";

export const metadata: Metadata = {
  title: "Contact Us | alphainfortrading",
  description:
    "Get in touch with alphainfortrading for questions about our services or account support.",
};

export default function ContactPage() {
  return (
    <main className={styles.page}>
      <SiteHeader currentPage="contact" />
      <section aria-labelledby="contact-title" className={styles.intro}>
        <div className={styles.introContent}>
          <h1 id="contact-title">Contact Us</h1>
          <p>We&apos;re here to help. Reach out to us for any inquiries or support.</p>
        </div>
      </section>

      <section aria-labelledby="contact-details-title" className={styles.details}>
        <div className={styles.detailsInner}>
          <div className={styles.message}>
            <p className={styles.kicker}>Get in touch</p>
            <h2 id="contact-details-title">We&apos;d Love to Hear From You</h2>
            <p className={styles.description}>
              Whether you have a question about our services, need assistance
              with your account, or just want to say hello, our team is ready to
              answer your questions.
            </p>
            <div className={styles.contactItem}>
              <span aria-hidden="true" className={styles.contactIcon}>
                @
              </span>
              <div>
                <h3>Email Us</h3>
                <a href="mailto:hello@alphainfortrading.com">
                  hello@alphainfortrading.com
                </a>
              </div>
            </div>
          </div>
          <div className={styles.location}>
            <span aria-hidden="true" className={styles.locationIcon}>
              ⌖
            </span>
            <div>
              <h3>Visit Us</h3>
              <p>Texas Business Brokers</p>
              <p>Austin, TX</p>
            </div>
          </div>
        </div>
      </section>

      <ContactForm />
      <SiteFooter />
    </main>
  );
}