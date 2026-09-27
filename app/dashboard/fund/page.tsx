"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { DashboardHeading, DashboardShell, networks } from "../dashboard-shell";
import { createClient } from "@/lib/supabase/client";
import type { DepositRequest } from "@/lib/supabase/types";

const supabase = createClient();

export default function FundAccountPage() {
  const [selectedNetwork, setSelectedNetwork] = useState(networks[0]);
  const [confirmed, setConfirmed] = useState(false);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);

  const loadDeposits = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data } = await supabase
      .from("deposit_requests")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false });

    if (data) setDeposits(data);
  };

  useEffect(() => {
    let ignore = false;
    async function fetchDeposits() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user || ignore) return;
      const { data } = await supabase
        .from("deposit_requests")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false });
      if (!ignore && data) setDeposits(data);
    }
    void fetchDeposits();
    return () => {
      ignore = true;
    };
  }, []);

  const copyAddress = async () => {
    await navigator.clipboard.writeText(selectedNetwork.address);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const submitDeposit = async () => {
    setError("");
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Enter a valid deposit amount.");
      return;
    }

    setIsSubmitting(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setError("Your session has expired. Please log in again.");
      setIsSubmitting(false);
      return;
    }

    const { error: insertError } = await supabase.from("deposit_requests").insert({
      user_id: userData.user.id,
      amount: numericAmount,
      network: selectedNetwork.name,
    });

    setIsSubmitting(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }

    await loadDeposits();
    setConfirmed(true);
  };

  return <DashboardShell active="fund">
    <DashboardHeading title="Fund your account" description="Choose a payment network and confirm your deposit." />
    <div className="dashboard-two-column"><section className="dashboard-panel"><div className="panel-heading"><div><p className="dashboard-kicker">Deposit assets</p><h2>Select payment method</h2></div><span className="panel-step">01 <i>/</i> 02</span></div><div className="network-grid">{networks.map((network) => <button className={`network-option ${selectedNetwork.name === network.name ? "selected" : ""}`} key={network.name} onClick={() => { setSelectedNetwork(network); setCopied(false); }} type="button"><span className="network-symbol" style={{ backgroundColor: network.color }}>{network.symbol.slice(0, 1)}</span><span><b>{network.name} ({network.symbol})</b><small>{network.detail}</small></span><span className="network-check">{selectedNetwork.name === network.name ? "✓" : ""}</span></button>)}</div><div className="address-row"><span className="address-icon">↗</span><div><small>{selectedNetwork.name} deposit address</small><b>{selectedNetwork.address}</b></div><button onClick={copyAddress} type="button">{copied ? "Copied" : "Copy"}</button></div><div className="deposit-qr-panel"><Image alt={`${selectedNetwork.name} deposit QR code`} className="deposit-qr-image" height={180} src={selectedNetwork.qrImage} width={180} /><div><strong>Scan to deposit {selectedNetwork.symbol}</strong><span>Use your wallet to scan this QR code. Confirm the selected network before sending.</span></div></div><label className="dashboard-field-label" htmlFor="fund-amount">Amount (USD)</label><input className="dashboard-input" id="fund-amount" onChange={(event) => setAmount(event.target.value)} placeholder="0.00" value={amount} /><small className="field-hint">Minimum deposit: $2,000.00</small>{error && <p className="auth-error" role="alert">{error}</p>}<button className="dashboard-primary-button payment-button" disabled={isSubmitting || confirmed} onClick={submitDeposit} type="button">{isSubmitting ? "Submitting..." : confirmed ? "Request submitted ✓" : "Submit for review"}<span>↗</span></button>{confirmed && <p className="confirmation-message">Your {selectedNetwork.name} deposit request is pending admin confirmation.</p>}</section><aside className="dashboard-info-card"><h3>Important information</h3><p>● Deposits are usually credited after admin and network confirmation.</p><p>● Ensure you are sending the correct cryptocurrency to the correct address.</p><p>● Always review the network and amount before confirming payment.</p></aside></div>
    <section className="dashboard-table-section"><h2>Deposit history</h2><div className="dashboard-table deposit-table"><div><b>Amount</b><b>Method</b><b>Status</b><b>Date</b></div>{deposits.map((deposit) => <div key={deposit.id}><strong>${Number(deposit.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong><span>{deposit.network}</span><em className={deposit.status === "approved" ? "completed" : ""}>{deposit.status}</em><span>{new Date(deposit.created_at).toLocaleDateString()}</span></div>)}{deposits.length === 0 && <p className="admin-empty text-center">No deposit history yet.</p>}</div></section>
  </DashboardShell>;
}
