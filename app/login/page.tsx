"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function LoginContent() {
  const [signupOverride, setSignupOverride] = useState<boolean | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSignup = signupOverride ?? searchParams.get("mode") === "signup";

  const handleSubmit = () => {
    if (isSignup) router.push("/dashboard");
  };

  return (
    <main className="login-page">
      <aside className="login-aside">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden="true">
            <span />
          </span>
          <span>alphainfortrading</span>
        </Link>
        <div>
          <p className="eyebrow">A calmer way forward</p>
          <h1>
            Make every
            <br />
            move <em>matter.</em>
          </h1>
          <p>
            Your financial life, finally in sync. One secure home for the money
            you move and keep.
          </p>
        </div>
        <div className="aside-footer">alphainfortrading / 2026</div>
      </aside>
      <section className="login-panel" aria-labelledby="auth-title">
        <div className="auth-box">
          <h2 id="auth-title">
            {isSignup ? "Create your account" : "Welcome back"}
          </h2>
          <p className="auth-subtitle">
            {isSignup
              ? "Start moving money brighter today."
              : "New to alphainfortrading? "}
            <button
              className="auth-switch"
              onClick={() => setSignupOverride(!isSignup)}
            >
              {isSignup ? "Log in" : "Create an account"}
            </button>
          </p>
          {isSignup && (
            <>
              <label className="field-label" htmlFor="name">
                Your name
              </label>
              <input
                className="auth-input"
                id="name"
                type="text"
                placeholder="Brian Jordan Ellis"
              />
            </>
          )}
          <label className="field-label" htmlFor="email">
            Email address
          </label>
          <input
            className="auth-input"
            id="email"
            type="email"
            placeholder="you@example.com"
          />
          <label className="field-label" htmlFor="password">
            Password
          </label>
          <input
            className="auth-input"
            id="password"
            type="password"
            placeholder="8+ characters"
          />
          <button className="auth-submit" onClick={handleSubmit} type="button">
            {isSignup ? "Create account  ↗" : "Log in  ↗"}
          </button>
          <p className="terms">
            By continuing, you agree to alphainfortrading&apos;s{" "}
            <a href="#terms">Terms</a> and <a href="#privacy">Privacy Policy</a>
            .
          </p>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
