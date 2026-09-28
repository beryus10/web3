import Link from "next/link";
import { BrandMark } from "../brand-mark";

export function SiteFooter() {
  return (
    <footer className="lv-footer" id="contact">
      <div className="lv-container">
        <div className="lv-footer-grid">
          <div>
            <Link className="lv-brand" href="/">
              <BrandMark className="lv-logo" />
              <span>alphainfortrading</span>
            </Link>
            <p>
              Your trusted partner for clearer, faster digital finance. Built
              for the global economy.
            </p>
          </div>
          <div>
            <h3>Quick links</h3>
            <Link href="/about">About us</Link>
            <Link href="/#services">Services</Link>
            <Link href="/#plans">Plans</Link>
            <Link href="/faq">FAQ</Link>
          </div>
          <div>
            <h3>Account</h3>
            <Link href="/login">Login</Link>
            <Link href="/login?mode=signup">Register</Link>
            <Link href="/contact">Contact us</Link>
            <Link href="/#security">Security</Link>
          </div>
          <div>
            <h3>Contact info</h3>
            <a href="mailto:hello@alphainfortrading.com">
              ✉ hello@alphainfortrading.com
            </a>
            <span>Texas Business Brokers - Austin Office - Austin, TX</span>
          </div>
        </div>
        <div className="lv-footer-bottom">
          <span>© 2026 alphainfortrading. All rights reserved.</span>
          <span>Privacy policy &nbsp;&nbsp; Terms of service</span>
        </div>
      </div>
    </footer>
  );
}