import type { Metadata } from "next";
import { faqItems } from "../faq-content";
import { SiteHeader } from "../components/site-header";
import styles from "./faq.module.css";

export const metadata: Metadata = {
  title: "FAQ | alphainfortrading",
  description: "Answers to common questions about alphainfortrading.",
};

export default function FAQPage() {
  return (
    <main className={styles.page}>
      <SiteHeader currentPage="faq" />
      <section aria-labelledby="faq-title" className={styles.intro}>
        <h1 id="faq-title">Frequently Asked Questions</h1>
        <p>Find answers to common questions about our services.</p>
      </section>
      <section aria-label="Frequently asked questions" className={styles.faqSection}>
        <div className={styles.faqInner}>
          <div className={styles.heading}>
            <p>Support</p>
            <h2>How can we help?</h2>
          </div>
          <div className={styles.faqList}>
            {faqItems.map(({ question, answer }) => (
              <details className={styles.faqItem} key={question}>
                <summary>
                  {question}
                  <span aria-hidden="true">⌄</span>
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}