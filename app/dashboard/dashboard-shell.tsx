"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useDashboardProfileContext } from "./dashboard-context";
import { LanguageSelector } from "./language-selector";

export type DashboardNav = "dashboard" | "fund" | "withdraw" | "history" | "profile";

const supabase = createClient();

export function useDashboardProfile() {
  return useDashboardProfileContext().profile;
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
      <header className="dashboard-topbar">
        <Link className="dashboard-mobile-brand" href="/">
          <span className="dashboard-brand-mark">↗</span>
          <span>alphainfortrading</span>
        </Link>
        <div className="dashboard-topbar-content">
          <span className="dashboard-topbar-welcome">Welcome back, <b>{profile?.full_name || "there"}</b></span>
          <LanguageSelector />
          <span className="dashboard-avatar">{initials}</span>
        </div>
      </header>
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
  { name: "Ethereum", symbol: "ETH", color: "#627eea", detail: "Ethereum Mainnet", address: "0xB1ABE07cFE7FDb28A3833EF319711A175572f769", qrImage: "/images/eth.jpeg" },
  { name: "Bitcoin", symbol: "BTC", color: "#f7931a", detail: "Bitcoin Network", address: "bc1qkmnxzrvlkelwvc9y8j29lpaj2xl8xxvu7n990j", qrImage: "/images/btc.jpeg" },
  { name: "Solana", symbol: "SOL", color: "#6857f5", detail: "Solana Mainnet", address: "6ek33B9N9NqwiYeYP52QFwHChFKsUqNszhTN2iAXaMRD", qrImage: "/images/sol.jpeg" },
];
