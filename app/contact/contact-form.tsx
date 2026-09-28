"use client";

import { useState, type FormEvent } from "react";
import styles from "./contact.module.css";

export function ContactForm() {
  const [status, setStatus] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const subject = String(formData.get("subject") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();
    const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
    const mailto = `mailto:hello@alphainfortrading.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
    setStatus("Your email app should open with your message ready to send.");
  };

  return (
    <section aria-labelledby="message-title" className={styles.formSection}>
      <div className={styles.formInner}>
        <h2 id="message-title">Send us a Message</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.fieldGrid}>
            <label>
              Full Name
              <input
                autoComplete="name"
                maxLength={120}
                name="name"
                placeholder="John Doe"
                required
              />
            </label>
            <label>
              Email Address
              <input
                autoComplete="email"
                maxLength={254}
                name="email"
                placeholder="john@example.com"
                required
                type="email"
              />
            </label>
          </div>
          <label>
            Subject
            <input
              maxLength={160}
              name="subject"
              placeholder="How can we help?"
              required
            />
          </label>
          <label>
            Message
            <textarea
              maxLength={4000}
              name="message"
              placeholder="Your message here..."
              required
              rows={6}
            />
          </label>
          <button className={styles.submit} type="submit">
            Send Message
          </button>
          <p aria-live="polite" className={styles.status} role="status">
            {status}
          </p>
        </form>
      </div>
    </section>
  );
}