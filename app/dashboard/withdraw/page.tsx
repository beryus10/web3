"use client";

import { useState } from "react";
import { DashboardHeading, DashboardShell, networks } from "../dashboard-shell";

export default function WithdrawPage() {
  const [submitted, setSubmitted] = useState(false);
  return <DashboardShell active="withdraw">
    <DashboardHeading title="Withdraw funds" description="Send available funds to an external wallet." />
    <section className="dashboard-panel narrow-panel"><div className="panel-heading"><div><p className="dashboard-kicker">Send assets</p><h2>Withdrawal details</h2></div><span className="panel-step">01 <i>/</i> 02</span></div><label className="dashboard-field-label" htmlFor="withdraw-network">Network</label><select className="dashboard-select" id="withdraw-network">{networks.map((network) => <option key={network.name}>{network.name}</option>)}</select><label className="dashboard-field-label" htmlFor="withdraw-address">Recipient address</label><input className="dashboard-input" id="withdraw-address" placeholder="Paste wallet address" /><div className="amount-fields"><div><label className="dashboard-field-label" htmlFor="withdraw-amount">Amount</label><input className="dashboard-input" id="withdraw-amount" placeholder="0.00" /></div><div><label className="dashboard-field-label" htmlFor="withdraw-currency">Currency</label><select className="dashboard-select" id="withdraw-currency"><option>USD</option><option>USDC</option></select></div></div><button className="dashboard-primary-button" onClick={() => setSubmitted(true)} type="button">{submitted ? "Withdrawal submitted ✓" : "Review withdrawal"}<span>↗</span></button></section>
  </DashboardShell>;
}
