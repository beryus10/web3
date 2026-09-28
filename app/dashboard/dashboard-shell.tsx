"use client";

import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ChartNoAxesCombined,
  Clock3,
  House,
  LogOut,
  MessageCircle,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useDashboardProfileContext } from "./dashboard-context";
import { LanguageSelector } from "./language-selector";
import { BrandMark } from "../brand-mark";

export type DashboardNav = "dashboard" | "plans" | "fund" | "withdraw" | "history" | "profile" | "support";

const supabase = createClient();

export function useDashboardProfile() {
  return useDashboardProfileContext().profile;
}

type DashboardIconName = "home" | "plans" | "deposit" | "withdraw" | "history" | "profile" | "support";

const navigation: { id: DashboardNav; label: string; href: string; icon: DashboardIconName }[] = [
  { id: "dashboard", label: "Home", href: "/dashboard", icon: "home" },
  { id: "plans", label: "Investment Plans", href: "/dashboard/plans", icon: "plans" },
  { id: "fund", label: "Deposit", href: "/dashboard/fund", icon: "deposit" },
  { id: "withdraw", label: "Withdraw", href: "/dashboard/withdraw", icon: "withdraw" },
  { id: "history", label: "History", href: "/dashboard/history", icon: "history" },
  { id: "profile", label: "Profile", href: "/dashboard/profile", icon: "profile" },
  { id: "support", label: "Support", href: "/dashboard/support", icon: "support" },
];

const bottomNavigation = [
  { id: "send", label: "Send", href: "/dashboard/withdraw", icon: "withdraw" },
  { id: "fund", label: "Deposit", href: "/dashboard/fund", icon: "deposit" },
  { id: "dashboard", label: "Home", href: "/dashboard", icon: "home" },
  { id: "profile", label: "Profile", href: "/dashboard/profile", icon: "profile" },
  { id: "support", label: "Support", href: "/dashboard/support", icon: "support" },
] as const;

import { DashboardChatBox } from "./components/DashboardChatBox";

const dashboardIcons: Record<DashboardIconName, LucideIcon> = {
  home: House,
  plans: ChartNoAxesCombined,
  deposit: ArrowDownToLine,
  withdraw: ArrowUpFromLine,
  history: Clock3,
  profile: UserRound,
  support: MessageCircle,
};

export function DashboardIcon({ name }: { name: DashboardIconName }) {
  const Icon = dashboardIcons[name];
  return <Icon aria-hidden="true" size={20} strokeWidth={1.8} />;
}

export function DashboardShell({ active, children }: { active: DashboardNav; children: React.ReactNode }) {
  const profile = useDashboardProfile();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  useEffect(() => {
    if (!drawerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [drawerOpen]);
  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()
    : "--";

  const firstLetter = profile?.full_name?.trim()
    ? profile.full_name.trim()[0].toUpperCase()
    : profile?.email?.trim()
    ? profile.email.trim()[0].toUpperCase()
    : "U";

  return (
    <main className="dashboard-page">
      {drawerOpen && <button aria-label="Close navigation" className="dashboard-drawer-backdrop" onClick={() => setDrawerOpen(false)} type="button" />}
      <aside aria-hidden={!drawerOpen} className={`dashboard-sidebar ${drawerOpen ? "is-open" : ""}`}>
        <div className="dashboard-drawer-heading">
          <Link className="dashboard-brand" href="/" onClick={() => setDrawerOpen(false)}><BrandMark className="dashboard-brand-mark" /><span>alphainfortrading</span></Link>
          <button aria-label="Close navigation" className="dashboard-drawer-close" onClick={() => setDrawerOpen(false)} type="button">×</button>
        </div>
        <div className="dashboard-account"><span className="dashboard-avatar">{initials}</span><span><b>{profile?.full_name || "Your account"}</b><small>{profile?.email || "Loading profile..."}</small></span></div>
        <nav className="dashboard-sidebar-nav" aria-label="Dashboard navigation">
          {navigation.map((item) => <Link aria-current={active === item.id ? "page" : undefined} className={active === item.id ? "active" : ""} href={item.href} key={item.id} onClick={() => setDrawerOpen(false)}><span><DashboardIcon name={item.icon} /></span>{item.label}</Link>)}
        </nav>
        <button className="dashboard-logout" onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }} type="button"><span><LogOut aria-hidden="true" size={18} /></span>Log out</button>
      </aside>
      <header className="dashboard-topbar">
        <div className="dashboard-topbar-start">
          <button aria-expanded={drawerOpen} aria-label="Open navigation" className="dashboard-menu-button" onClick={() => setDrawerOpen(true)} type="button"><span /><span /><span /></button>
        <Link className="dashboard-mobile-brand" href="/">
          <BrandMark className="dashboard-brand-mark" />
          <span>alphainfortrading</span>
        </Link>
        </div>
        <div className="dashboard-topbar-content">
          <span className="dashboard-topbar-welcome">Welcome back, <b>{profile?.full_name || "there"}</b></span>
          <LanguageSelector />
          <Link aria-label="Open profile" className="dashboard-user-button" href="/dashboard/profile"><span className="dashboard-avatar">{initials}</span></Link>
        </div>
      </header>
      <section className="dashboard-main">
        <DashboardChatBox />
        {children}
      </section>
      <nav className="dashboard-mobile-dock" aria-label="Dashboard navigation">
        {bottomNavigation.map((item) => {
          const isHome = item.id === "dashboard";
          const isProfile = item.id === "profile";
          const isActive = item.id === "send" ? active === "withdraw" : active === item.id;
          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={`${isActive ? "active" : ""} ${isHome ? "home" : ""} ${isProfile ? "dock-profile" : ""}`}
              href={item.href}
              key={item.id}
            >
              {isProfile ? (
                <span className="dashboard-dock-avatar-circle" aria-hidden="true">{firstLetter}</span>
              ) : (
                <span className="dashboard-dock-icon"><DashboardIcon name={item.icon} /></span>
              )}
              <small>{item.label}</small>
            </Link>
          );
        })}
      </nav>
    </main>
  );
}

export function DashboardHeading({
  eyebrow,
  title,
  description,
  customBalance,
  customLabel,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  customBalance?: number;
  customLabel?: string;
}) {
  const profile = useDashboardProfile();
  const balance = customBalance !== undefined ? customBalance : (profile?.balance ?? 0);
  const label = customLabel || "Total balance";
  return (
    <div className="dashboard-heading">
      <div>
        {eyebrow && <p className="dashboard-kicker">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      <div className="dashboard-balance">
        <span>{label}</span>
        <strong>${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong>
        <small><b>Live</b> account balance</small>
      </div>
    </div>
  );
}

export const networks = [
  { name: "Ethereum", symbol: "ETH", color: "#627eea", detail: "Ethereum Mainnet", address: "0xB1ABE07cFE7FDb28A3833EF319711A175572f769", qrImage: "/images/eth.jpeg" },
  { name: "Bitcoin", symbol: "BTC", color: "#f7931a", detail: "Bitcoin Network", address: "bc1qkmnxzrvlkelwvc9y8j29lpaj2xl8xxvu7n990j", qrImage: "/images/btc.jpeg" },
  { name: "Solana", symbol: "SOL", color: "#6857f5", detail: "Solana Mainnet", address: "6ek33B9N9NqwiYeYP52QFwHChFKsUqNszhTN2iAXaMRD", qrImage: "/images/sol.jpeg" },
];
