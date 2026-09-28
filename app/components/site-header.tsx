import Link from "next/link";
import { BrandMark } from "../brand-mark";
import styles from "./site-header.module.css";

type SiteHeaderProps = {
  currentPage: "about" | "contact" | "faq";
};

export function SiteHeader({ currentPage }: SiteHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.navbar}>
        <Link className={styles.brand} href="/">
          <BrandMark className="lv-logo" />
          <span>alphainfortrading</span>
        </Link>
        <nav aria-label="Main navigation" className={styles.navLinks}>
          <Link href="/">Home</Link>
          <Link aria-current={currentPage === "about" ? "page" : undefined} href="/about">
            About
          </Link>
          <Link href="/#services">Services</Link>
          <Link href="/#plans">Plans</Link>
          <Link aria-current={currentPage === "faq" ? "page" : undefined} href="/faq">
            FAQ
          </Link>
          <Link aria-current={currentPage === "contact" ? "page" : undefined} href="/contact">
            Contact
          </Link>
        </nav>
        <div className={styles.actions}>
          <Link href="/login">Login</Link>
          <Link className={styles.getStarted} href="/login?mode=signup">
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}