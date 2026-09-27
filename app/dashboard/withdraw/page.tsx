"use client";

import { useEffect, useState } from "react";
import { DashboardHeading, DashboardShell, networks, useDashboardProfile } from "../dashboard-shell";
import { createClient } from "@/lib/supabase/client";
import type { WithdrawalRequest } from "@/lib/supabase/types";

const supabase = createClient();

export default function WithdrawPage() {
  const profile = useDashboardProfile();
  const balance = Number(profile?.balance ?? 0);
  const [network, setNetwork] = useState(networks[0].name);
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);

  const loadWithdrawals = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const { data } = await supabase
      .from("withdrawal_requests")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false });
    if (data) setWithdrawals(data);
  };

  useEffect(() => {
    let ignore = false;
    async function fetchWithdrawals() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user || ignore) return;
      const { data } = await supabase
        .from("withdrawal_requests")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false });
      if (!ignore && data) setWithdrawals(data);
    }
    void fetchWithdrawals();
    return () => {
      ignore = true;
    };
  }, []);

  const submitWithdrawal = async () => {
    setError("");
    const numericAmount = Number(amount);
    if (balance <= 0) {
      setError("Insufficient funds. You do not have any funds available for withdrawal.");
      return;
    }
    if (!address.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Enter a recipient address and a valid amount.");
      return;
    }
    if (numericAmount > balance) {
      setError("The requested amount exceeds your available balance.");
      return;
    }

    setIsSubmitting(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setError("Your session has expired. Please log in again.");
      setIsSubmitting(false);
      return;
    }

    const { error: insertError } = await supabase.from("withdrawal_requests").insert({
      user_id: userData.user.id,
      amount: numericAmount,
      network,
      recipient_address: address.trim(),
      currency,
    });

    setIsSubmitting(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }

    setAmount("");
    setAddress("");
    await loadWithdrawals();
  };

  return (
    <DashboardShell active="withdraw">
      <DashboardHeading title="Withdraw funds" description="Send available funds to an external wallet." />
      <section className="dashboard-panel narrow-panel">
        <div className="panel-heading"><div><p className="dashboard-kicker">Send assets</p><h2>Withdrawal details</h2></div><span className="panel-step">01 <i>/</i> 02</span></div>
        <div className="withdraw-available"><span>Available balance</span><strong>${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong></div>
        {!profile ? (
          <p className="support-empty">Loading your available balance...</p>
        ) : balance <= 0 ? (
          <div className="withdraw-insufficient" role="status">
            <span className="withdraw-insufficient-icon" aria-hidden="true">⚠️</span>
            <div>
              <strong>Insufficient funds</strong>
              <p>You do not have any funds available for withdrawal.</p>
            </div>
          </div>
        ) : (
          <>
            <label className="dashboard-field-label" htmlFor="withdraw-network">Network</label>
            <select className="dashboard-select" id="withdraw-network" onChange={(event) => setNetwork(event.target.value)} value={network}>{networks.map((item) => <option key={item.name}>{item.name}</option>)}</select>
            <label className="dashboard-field-label" htmlFor="withdraw-address">Recipient address</label>
            <input className="dashboard-input" id="withdraw-address" onChange={(event) => setAddress(event.target.value)} placeholder="Paste wallet address" value={address} />
            <div className="amount-fields"><div><label className="dashboard-field-label" htmlFor="withdraw-amount">Amount</label><input className="dashboard-input" id="withdraw-amount" max={balance} min="0.01" onChange={(event) => setAmount(event.target.value)} placeholder="0.00" step="0.01" value={amount} /></div><div><label className="dashboard-field-label" htmlFor="withdraw-currency">Currency</label><select className="dashboard-select" id="withdraw-currency" onChange={(event) => setCurrency(event.target.value)} value={currency}><option>USD</option><option>USDC</option></select></div></div>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className="dashboard-primary-button" disabled={isSubmitting} onClick={submitWithdrawal} type="button">{isSubmitting ? "Submitting..." : "Submit withdrawal"}<span>↗</span></button>
          </>
        )}
      </section>
      <section className="dashboard-table-section withdrawal-history">
        <h2>Withdrawal history</h2>
        <div className="dashboard-table withdraw-table">
          <div><b>Amount</b><b>Network</b><b>Destination</b><b>Status</b><b>Date</b></div>
          {withdrawals.map((request) => (
            <div key={request.id}>
              <strong>${Number(request.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })} {request.currency}</strong>
              <span>{request.network}</span>
              <span className="withdraw-history-address" title={request.recipient_address}>{request.recipient_address}</span>
              <em className={request.status === "approved" ? "completed" : ""}>{request.status}</em>
              <span>{new Date(request.created_at).toLocaleDateString()}</span>
            </div>
          ))}
          {withdrawals.length === 0 && <p className="admin-empty text-center">No withdrawal history yet.</p>}
        </div>
      </section>
    </DashboardShell>
  );
}
