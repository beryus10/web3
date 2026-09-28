"use client";

import Link from "next/link";
import { useState } from "react";
import { DashboardHeading, DashboardIcon, DashboardShell, useDashboardProfile } from "./dashboard-shell";
import { MarketChart } from "./market-chart";

export default function DashboardPage() {
  const profile = useDashboardProfile();
  const activeInvestment = profile?.active_investment ?? 0;
  const profitToday = profile?.profit_today ?? 0;
  const totalFunds = profile?.balance ?? 0;
  const [inviteCopied, setInviteCopied] = useState(false);

  const inviteUrl = typeof window !== "undefined" && profile
    ? `${window.location.origin}/login?mode=signup&invitedby=${encodeURIComponent(profile.id)}`
    : "";

  const copyInviteLink = async () => {
    if (!profile) return;
    const url = `${window.location.origin}/login?mode=signup&invitedby=${encodeURIComponent(profile.id)}`;
    await navigator.clipboard.writeText(url);
    setInviteCopied(true);
    window.setTimeout(() => setInviteCopied(false), 2000);
  };

  return (
    <DashboardShell active="dashboard">
      <DashboardHeading
        eyebrow="Personal wallet"
        title="Dashboard"
        description="A clear view of your money and the market."
        customBalance={totalFunds}
        customLabel="Total funds"
      />
      <div className="dashboard-stat-grid">
        <article>
          <span>Total funds</span>
          <strong>${totalFunds.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong>
          <small>Available account balance</small>
        </article>
        <article>
          <span>Active investment</span>
          <strong>${activeInvestment.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong>
          <small>Current allocation</small>
        </article>
        <article>
          <span>Profit Today</span>
          <strong>${profitToday.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong>
        </article>
      </div>

      <section className="dashboard-chat-box">
        <div className="dashboard-chat-box-content">
          <div className="dashboard-chat-box-icon" aria-hidden="true">💬</div>
          <div>
            <p className="dashboard-kicker">Live Support 24/7</p>
            <h2>Chat with our support team instantly for quick resolution of your queries</h2>
            <p>Need assistance with deposits, withdrawals, or account questions? Our specialists are online.</p>
          </div>
        </div>
        <Link className="dashboard-primary-button chat-start-btn" href="/dashboard/support">
          Start chat <span>↗</span>
        </Link>
      </section>

      <MarketChart />

      <div className="dashboard-quick-actions">
        <Link href="/dashboard/withdraw"><span><DashboardIcon name="withdraw" /></span><b>Send</b></Link>
        <Link href="/dashboard/fund"><span><DashboardIcon name="deposit" /></span><b>Deposit</b></Link>
        <Link href="/dashboard/history"><span><DashboardIcon name="history" /></span><b>History</b></Link>
        <Link href="/dashboard/profile"><span><DashboardIcon name="profile" /></span><b>Profile</b></Link>
      </div>

      <section className="dashboard-invite">
        <div>
          <p className="dashboard-kicker">Invite &amp; earn</p>
          <h2>Share alphainfortrading with your network.</h2>
          <p>Earn rewards when friends join and fund their accounts. Share your invite link below:</p>
          <div className="invite-share-box">
            <input
              aria-label="Your personal invite link"
              className="invite-share-input"
              readOnly
              value={inviteUrl}
            />
            <button disabled={!profile} onClick={copyInviteLink} type="button">
              {inviteCopied ? "Link copied ✓" : "Copy invite link"}
            </button>
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}
