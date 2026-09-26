"use client";

import Link from "next/link";
import { DashboardHeading, DashboardShell, useDashboardProfile } from "./dashboard-shell";
import { MarketChart } from "./market-chart";

export default function DashboardPage() {
  const profile = useDashboardProfile();
  const balance = profile?.balance ?? 0;
  const activeInvestment = profile?.active_investment ?? 0;
  const totalEarnings = profile?.total_earnings ?? 0;

  return <DashboardShell active="dashboard">
    <DashboardHeading eyebrow="Personal wallet" title="Dashboard" description="A clear view of your money and the market." />
    <div className="dashboard-stat-grid"><article><span>Total balance</span><strong>${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong><small>Live account balance</small></article><article><span>Active investment</span><strong>${activeInvestment.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong><small>Current allocation</small></article><article><span>Total earnings</span><strong>${totalEarnings.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong><small>Recorded earnings</small></article></div>
    <MarketChart />
    <div className="dashboard-quick-actions"><Link href="/dashboard/fund"><span>+</span><b>Deposit</b></Link><Link href="/dashboard/withdraw"><span>↓</span><b>Withdraw</b></Link><Link href="/dashboard/history"><span>↶</span><b>History</b></Link><Link href="/dashboard/profile"><span>●</span><b>Profile</b></Link></div>
    <section className="dashboard-invite"><div><p className="dashboard-kicker">Invite &amp; earn</p><h2>Share alphainfortrading with your network.</h2><p>Earn rewards when friends join and fund their accounts.</p></div><button type="button">Copy referral link</button></section>
  </DashboardShell>;
}
