"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/types";

export type DashboardNav = "dashboard" | "fund" | "withdraw" | "history" | "profile";

const supabase = createClient();

export function useDashboardProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.user.id)
        .single();

      if (!active) return;

      setProfile(data || {
        id: userData.user.id,
        email: userData.user.email || "",
        full_name: userData.user.user_metadata.full_name || "Your account",
        phone: userData.user.user_metadata.phone || "",
        role: "user",
        balance: 0,
        active_investment: 0,
        total_earnings: 0,
        created_at: userData.user.created_at,
      });
    }

    void loadProfile();
    return () => {
      active = false;
    };
  }, []);

  return profile;
}

const navigation: { id: DashboardNav; label: string; href: string; icon: string }[] = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: "⌂" },
  { id: "fund", label: "Fund Account", href: "/dashboard/fund", icon: "▣" },
  { id: "withdraw", label: "Withdraw", href: "/dashboard/withdraw", icon: "↗" },
  { id: "history", label: "History", href: "/dashboard/history", icon: "↶" },
  { id: "profile", label: "Profile", href: "/dashboard/profile", icon: "●" },
];

export function DashboardShell({ active, children }: { active: DashboardNav; children: React.ReactNode }) {
  const profile = useDashboardProfile();
  const router = useRouter();
  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()
    : "--";

  return (
    <main className="dashboard-page">
      <aside className="dashboard-sidebar">
        <Link className="dashboard-brand" href="/"><span className="dashboard-brand-mark">↗</span><span>alphainfortrading</span></Link>
        <div className="dashboard-account"><span className="dashboard-avatar">{initials}</span><span><b>{profile?.full_name || "Your account"}</b><small>{profile?.email || "Loading profile..."}</small></span></div>
        <nav className="dashboard-sidebar-nav" aria-label="Dashboard navigation">
          {navigation.map((item) => <Link className={active === item.id ? "active" : ""} href={item.href} key={item.id}><span>{item.icon}</span>{item.label}</Link>)}
        </nav>
        <button className="dashboard-logout" onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }} type="button"><span>↪</span>Log out</button>
      </aside>
      <header className="dashboard-topbar"><span>Welcome back, <b>{profile?.full_name || "there"}</b></span><span className="dashboard-avatar">{initials}</span></header>
      <section className="dashboard-main">{children}</section>
      <nav className="dashboard-mobile-dock" aria-label="Dashboard navigation">{navigation.map((item) => <Link className={active === item.id ? "active" : ""} href={item.href} key={item.id} aria-label={item.label}><span>{item.icon}</span></Link>)}</nav>
    </main>
  );
}

export function DashboardHeading({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  const profile = useDashboardProfile();
  const balance = profile?.balance ?? 0;
  return <div className="dashboard-heading"><div>{eyebrow && <p className="dashboard-kicker">{eyebrow}</p>}<h1>{title}</h1>{description && <p>{description}</p>}</div><div className="dashboard-balance"><span>Total balance</span><strong>${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong><small><b>Live</b> account balance</small></div></div>;
}

export const networks = [
  { name: "Ethereum", symbol: "ETH", color: "#627eea", detail: "Ethereum Mainnet", address: "0x71d8C4A2eB8c4e4a9A4c" },
  { name: "Bitcoin", symbol: "BTC", color: "#f7931a", detail: "Bitcoin Network", address: "bc1qalphainfortrading7m3n" },
  { name: "Solana", symbol: "SOL", color: "#6857f5", detail: "Solana Mainnet", address: "7AlphaInfoTrading9Solana" },
];
