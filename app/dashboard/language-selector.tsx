"use client";

import { useEffect, useState } from "react";

type GoogleTranslateElementOptions = {
  pageLanguage: string;
  includedLanguages: string;
  autoDisplay: boolean;
};

declare global {
  interface Window {
    google?: {
      translate?: {
        TranslateElement: new (options: GoogleTranslateElementOptions, elementId: string) => unknown;
      };
    };
    googleTranslateElementInit?: () => void;
  }
}

const languages = [
  ["en", "English"],
  ["es", "Español"],
  ["fr", "Français"],
  ["de", "Deutsch"],
  ["pt", "Português"],
  ["ar", "العربية"],
  ["hi", "हिन्दी"],
  ["ja", "日本語"],
  ["zh-CN", "中文"],
  ["yo", "Yorùbá"],
] as const;

export function LanguageSelector() {
  const [ready, setReady] = useState(false);
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    let mounted = true;
    const savedLanguage = document.cookie.match(/(?:^|;\s*)googtrans=\/en\/([^;]+)/)?.[1];
    if (savedLanguage && languages.some(([code]) => code === savedLanguage)) {
      setLanguage(savedLanguage);
    }

    const initialize = () => {
      const TranslateElement = window.google?.translate?.TranslateElement;
      if (!TranslateElement) return;
      new TranslateElement(
        { pageLanguage: "en", includedLanguages: languages.map(([code]) => code).join(","), autoDisplay: false },
        "google_translate_element",
      );
      if (mounted) setReady(true);
    };

    window.googleTranslateElementInit = initialize;
    if (window.google?.translate?.TranslateElement) {
      initialize();
    } else if (!document.querySelector("script[data-google-translate]")) {
      const script = document.createElement("script");
      script.dataset.googleTranslate = "true";
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      script.onerror = () => {
        if (mounted) setReady(false);
      };
      document.head.appendChild(script);
    }

    return () => {
      mounted = false;
      delete window.googleTranslateElementInit;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = language;
    const translateSelect = document.querySelector<HTMLSelectElement>(".goog-te-combo");
    if (!translateSelect) return;
    const targetLanguage = language === "en" ? "" : language;
    if (translateSelect.value !== targetLanguage) {
      translateSelect.value = targetLanguage;
      translateSelect.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }, [language, ready]);

  const changeLanguage = (nextLanguage: string) => {
    setLanguage(nextLanguage);
  };

  return (
    <>
      <label className="dashboard-language-control">
        <span className="sr-only">Page language</span>
        <select aria-label="Choose page language" disabled={!ready} onChange={(event) => changeLanguage(event.target.value)} value={language}>
          {languages.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
        </select>
      </label>
      <div aria-hidden="true" className="google-translate-container" id="google_translate_element" />
    </>
  );
}
