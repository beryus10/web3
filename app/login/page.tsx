"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginContent() {
  const [signupOverride, setSignupOverride] = useState<boolean | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const isSignup = signupOverride ?? searchParams.get("mode") === "signup";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    const result = isSignup
      ? await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        })
      : await supabase.auth.signInWithPassword({ email, password });

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    if (isSignup && !result.data.session) {
      setMessage("Check your email to confirm your account, then log in.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
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
          <form onSubmit={handleSubmit}>
            {isSignup && (
              <>
                <label className="field-label" htmlFor="name">
                  Your name
                </label>
                <input
                  className="auth-input"
                  id="name"
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Brian Jordan Ellis"
                  required
                  type="text"
                  value={name}
                />
              </>
            )}
            <label className="field-label" htmlFor="email">
              Email address
            </label>
            <input
              className="auth-input"
              id="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              type="email"
              value={email}
            />
            <label className="field-label" htmlFor="password">
              Password
            </label>
            <input
              className="auth-input"
              id="password"
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="8+ characters"
              required
              type="password"
              value={password}
            />
            {error && <p className="auth-error" role="alert">{error}</p>}
            {message && <p className="auth-message" role="status">{message}</p>}
            <button className="auth-submit" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Working..." : isSignup ? "Create account  ↗" : "Log in  ↗"}
            </button>
            <p className="terms">
              By continuing, you agree to alphainfortrading&apos;s{" "}
              <a href="#terms">Terms</a> and <a href="#privacy">Privacy Policy</a>
              .
            </p>
          </form>
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
