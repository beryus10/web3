"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandMark } from "./brand-mark";
import { TeamSection } from "./components/team-section";
import { SiteFooter } from "./components/site-footer";
import { faqItems } from "./faq-content";
import { investmentPlans } from "./plan-content";

const services = [
  [
    "01",
    "Consulting",
    "Clear guidance for building a digital asset strategy that fits your goals.",
    "↗",
    "lv-service-green",
  ],
  [
    "02",
    "Digital wallet",
    "Move, store, and manage your tokens from one secure, simple place.",
    "↗",
    "lv-service-blue",
  ],
  [
    "03",
    "Token exchange",
    "Convert between 100+ assets with transparent pricing and fast settlement.",
    "↗",
    "lv-service-purple",
  ],
  [
    "04",
    "Smart saving",
    "Put your assets to work with flexible saving tools built for everyday users.",
    "↗",
    "lv-service-orange",
  ],
  [
    "05",
    "Automation",
    "Set recurring buys and rules that keep your strategy moving for you.",
    "↗",
    "lv-service-red",
  ],
  [
    "06",
    "Global transfers",
    "Send money across borders in seconds, without waiting for bank hours.",
    "↗",
    "lv-service-indigo",
  ],
];

const activityNotices = [
  ["Someone from UAE just invested", "$24,382"],
  ["Someone from Singapore just converted", "$8,940"],
  ["Someone from Canada just sent", "$3,200"],
  ["Someone from the UK just saved", "$12,500"],
] as const;

export default function Home() {
  const [noticeIndex, setNoticeIndex] = useState(0);
  const [noticeVisible, setNoticeVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => {
    if (!noticeVisible) return;
    const interval = window.setInterval(() => {
      setNoticeIndex((current) => (current + 1) % activityNotices.length);
    }, 4200);
    return () => window.clearInterval(interval);
  }, [noticeVisible]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 32);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isNavOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isNavOpen]);

  const [noticeText, noticeAmount] = activityNotices[noticeIndex];

  return (
    <main className="lv-site">
      <section className="lv-hero">
        <div className="lv-container">
          <nav
            className={`lv-nav ${isScrolled ? "lv-nav-scrolled" : ""}`}
            aria-label="Main navigation"
          >
            <Link className="lv-brand" href="/">
              <BrandMark className="lv-logo" />
              <span>alphainfortrading</span>
            </Link>
            <div
              className={`lv-nav-menu ${isNavOpen ? "is-open" : ""}`}
              id="mobile-navigation"
            >
              <div className="lv-nav-links">
                <Link href="/about" onClick={() => setIsNavOpen(false)}>
                  About
                </Link>
                <a href="#services" onClick={() => setIsNavOpen(false)}>
                  Services
                </a>
                <a href="#plans" onClick={() => setIsNavOpen(false)}>
                  Plans
                </a>
                <Link href="/faq" onClick={() => setIsNavOpen(false)}>
                  FAQ
                </Link>
                <Link href="/contact" onClick={() => setIsNavOpen(false)}>
                  Contact
                </Link>
              </div>
              <div className="lv-nav-actions">
                <Link href="/login" onClick={() => setIsNavOpen(false)}>
                  Login
                </Link>
                <Link
                  className="lv-button lv-button-small"
                  href="/login?mode=signup"
                  onClick={() => setIsNavOpen(false)}
                >
                  Get started <span>↗</span>
                </Link>
              </div>
            </div>
            <button
              aria-controls="mobile-navigation"
              aria-expanded={isNavOpen}
              aria-label={isNavOpen ? "Close navigation" : "Open navigation"}
              className="lv-menu-toggle"
              onClick={() => setIsNavOpen((open) => !open)}
              type="button"
            >
              {isNavOpen ? "×" : "☰"}
            </button>
          </nav>
          <div className="lv-hero-copy">
            <p className="lv-kicker">
              <span>✦</span> The future of digital finance is here
            </p>
            <h1>
              Move money with
              <br />
              <strong>alphainfortrading</strong>
            </h1>
            <p>
              Experience a trusted digital finance platform designed for
              clarity, control, and growth. Convert tokens, save smarter, and
              send value anywhere.
            </p>
            <div className="lv-hero-actions">
              <Link className="lv-button" href="/login?mode=signup">
                Get started <span>↗</span>
              </Link>
              <a className="lv-ghost-button" href="#how-it-works">
                How it works <span>↓</span>
              </a>
            </div>
          </div>
          <div className="lv-stats">
            <div>
              <strong>12+</strong>
              <span>Years of experience</span>
            </div>
            <div>
              <strong>57K+</strong>
              <span>Active users</span>
            </div>
            <div>
              <strong>$100M+</strong>
              <span>Value moved</span>
            </div>
            <div>
              <strong>32+</strong>
              <span>Countries served</span>
            </div>
          </div>
        </div>
        <div className="lv-hero-grid" aria-hidden="true" />
        {noticeVisible && (
          <div className="lv-notice" role="status">
            <span>↗</span>
            <div>
              {noticeText} <b>{noticeAmount}</b>
              <small>Just now</small>
            </div>
            <button
              type="button"
              aria-label="Close activity notification"
              onClick={() => setNoticeVisible(false)}
            >
              ×
            </button>
          </div>
        )}
      </section>

      <section className="lv-process" id="how-it-works">
        <div className="lv-container">
          <div className="lv-section-heading">
            <p className="lv-label">Simple process</p>
            <h2>How it works</h2>
            <p>
              Start building your digital finance journey in four clear steps.
            </p>
          </div>
          <div className="lv-process-grid">
            <article>
              <span className="lv-step-icon lv-icon-green">♙</span>
              <b>01</b>
              <h3>Create an account</h3>
              <p>Sign up in minutes with your basic details.</p>
            </article>
            <article>
              <span className="lv-step-icon lv-icon-blue">▣</span>
              <b>02</b>
              <h3>Verify &amp; fund</h3>
              <p>Verify your identity and fund your secure wallet.</p>
            </article>
            <article className="lv-process-featured">
              <span className="lv-step-icon lv-icon-purple">◔</span>
              <b>03</b>
              <h3>Choose a service</h3>
              <p>Pick the tools that match your financial goals.</p>
            </article>
            <article>
              <span className="lv-step-icon lv-icon-orange">▰</span>
              <b>04</b>
              <h3>Move &amp; grow</h3>
              <p>Convert, save, send, and track everything in one place.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="lv-services" id="services">
        <div className="lv-container">
          <div className="lv-section-heading">
            <p className="lv-label">What we offer</p>
            <h2>Our premium services</h2>
            <p>Thoughtful tools for every part of your financial life.</p>
          </div>
          <div className="lv-service-grid">
            {services.map(([number, title, description, arrow, color]) => (
              <article className="lv-service-card" key={title}>
                <span className={`lv-service-icon ${color}`}>
                  {number === "01"
                    ? "♢"
                    : number === "02"
                      ? "⌘"
                      : number === "03"
                        ? "≡"
                        : number === "04"
                          ? "◉"
                          : number === "05"
                            ? "✹"
                            : "➜"}
                </span>
                <small>{number}</small>
                <h3>{title}</h3>
                <p>{description}</p>
                <a href="#plans">
                  Learn more <span>{arrow}</span>
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="lv-plans" id="plans">
        <div className="lv-container">
          <div className="lv-section-heading">
            <p className="lv-label">Flexible by design</p>
            <h2>Plans for your next move</h2>
            <p>
              Start at your pace, with transparent access to the tools you need.
            </p>
          </div>
          <div className="lv-plan-grid">
            {investmentPlans.map(({ name, description, minimum, maximum, benefit }, index) => (
              <article
                className={`lv-plan-card ${index === 1 ? "lv-plan-featured" : ""}`}
                key={name}
              >
                {index === 1 && (
                  <span className="lv-popular">Most popular</span>
                )}
                <h3>{name}</h3>
                <p>{description}</p>
                <div className="lv-plan-range">
                  <strong>{minimum}</strong>
                  <span>to</span>
                  <strong>{maximum}</strong>
                </div>
                <ul>
                  <li>Fast token conversion</li>
                  <li>Secure wallet access</li>
                  <li>{benefit}</li>
                </ul>
                <Link className="lv-plan-button" href="/login?mode=signup">
                  Choose plan <span>↗</span>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="lv-faq" id="faq">
        <div className="lv-container">
          <div className="lv-section-heading">
            <p className="lv-label">Support</p>
            <h2>Frequently asked questions</h2>
          </div>
          <div className="lv-faq-list">
            {faqItems.map(({ question, answer }) => (
              <details key={question}>
                <summary>
                  {question}<span>⌄</span>
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <TeamSection id="about" />

      <section className="lv-cta">
        <div className="lv-container">
          <p className="lv-label">Ready when you are</p>
          <h2>
            Make your next move
            <br />a brighter one.
          </h2>
          <p>
            Join thousands of people using alphainfortrading to move and manage
            digital value with confidence.
          </p>
          <Link className="lv-light-button" href="/login?mode=signup">
            Create free account <span>↗</span>
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
