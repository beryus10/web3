"use client";

import { useState } from "react";
import { DashboardHeading, DashboardShell, networks } from "../dashboard-shell";

export default function FundAccountPage() {
  const [selectedNetwork, setSelectedNetwork] = useState(networks[0]);
  const [confirmed, setConfirmed] = useState(false);

  return <DashboardShell active="fund">
    <DashboardHeading title="Fund your account" description="Choose a payment network and confirm your deposit." />
    <div className="dashboard-two-column"><section className="dashboard-panel"><div className="panel-heading"><div><p className="dashboard-kicker">Deposit assets</p><h2>Select payment method</h2></div><span className="panel-step">01 <i>/</i> 02</span></div><div className="network-grid">{networks.map((network) => <button className={`network-option ${selectedNetwork.name === network.name ? "selected" : ""}`} key={network.name} onClick={() => setSelectedNetwork(network)} type="button"><span className="network-symbol" style={{ backgroundColor: network.color }}>{network.symbol.slice(0, 1)}</span><span><b>{network.name} ({network.symbol})</b><small>{network.detail}</small></span><span className="network-check">{selectedNetwork.name === network.name ? "✓" : ""}</span></button>)}</div><label className="dashboard-field-label" htmlFor="fund-amount">Amount (USD)</label><input className="dashboard-input" id="fund-amount" placeholder="0.00" /><small className="field-hint">Minimum deposit: $2,000.00</small><button className="dashboard-primary-button payment-button" onClick={() => setConfirmed(true)} type="button">{confirmed ? "Payment confirmed ✓" : "Confirm payment"}<span>↗</span></button>{confirmed && <p className="confirmation-message">Your {selectedNetwork.name} payment request has been created. Deposit address: 0x71d8...9A4c</p>}</section><aside className="dashboard-info-card"><h3>Important information</h3><p>● Deposits are usually credited within 10-30 minutes after network confirmation.</p><p>● Ensure you are sending the correct cryptocurrency to the correct address.</p><p>● Always review the network and amount before confirming payment.</p></aside></div>
    <section className="dashboard-table-section"><h2>Recent deposits</h2><div className="dashboard-table"><div><b>Amount</b><b>Method</b><b>Status</b><b>Date</b></div><div><strong>$2,000.00</strong><span>{selectedNetwork.name}</span><em>Pending</em><span>Sep 21, 2026</span></div></div></section>
  </DashboardShell>;
}
