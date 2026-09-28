import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { TeamSection } from "../components/team-section";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "About Us | alphainfortrading",
  description:
    "Meet the team behind alphainfortrading and learn about our commitment to digital finance.",
};

const commitments = [
  "Secure & Encrypted Platform",
  "Lightning Fast Transactions",
  "24/7 Professional Support",
];

export default function AboutPage() {
  return (
    <main className={styles.page}>
      <SiteHeader currentPage="about" />

      <section aria-labelledby="about-title" className={styles.intro}>
        <div className={styles.introContent}>
          <h1 id="about-title">About Us</h1>
          <p>
            We are dedicated to providing the best trading environment for
            investors worldwide.
          </p>
        </div>
        <div aria-hidden="true" className={styles.chartBars}>
          {Array.from({ length: 40 }, (_, index) => (
            <span
              key={index}
              style={{ "--bar-height": `${20 + ((index * 37) % 72)}%` } as CSSProperties}
            />
          ))}
        </div>
      </section>

      <section aria-label="Our commitments" className={styles.commitments}>
        <div className={styles.commitmentsInner}>
          {commitments.map((commitment) => (
            <p key={commitment}>
              <span aria-hidden="true">✓</span>
              {commitment}
            </p>
          ))}
        </div>
      </section>

      <TeamSection id="about" />
      <SiteFooter />
    </main>
  );
}