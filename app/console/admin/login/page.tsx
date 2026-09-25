"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !data.user) {
      setError(signInError?.message || "Unable to sign in");
      setIsSubmitting(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profile?.role !== "admin") {
      await supabase.auth.signOut();
      setError("This account does not have admin access.");
      setIsSubmitting(false);
      return;
    }

    router.push("/console/admin");
    router.refresh();
  };

  return (
    <main className="login-page">
      <section className="login-panel admin-login-panel" aria-labelledby="admin-auth-title">
        <div className="auth-box">
          <p className="dashboard-kicker">Private console</p>
          <h2 id="admin-auth-title">Admin sign in</h2>
          <p className="auth-subtitle">Review users, balances, and funding requests.</p>
          <form onSubmit={handleSubmit}>
            <label className="field-label" htmlFor="admin-email">Email address</label>
            <input className="auth-input" id="admin-email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
            <label className="field-label" htmlFor="admin-password">Password</label>
            <input className="auth-input" id="admin-password" onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className="auth-submit" disabled={isSubmitting} type="submit">{isSubmitting ? "Checking..." : "Enter console ↗"}</button>
          </form>
        </div>
      </section>
    </main>
  );
}
