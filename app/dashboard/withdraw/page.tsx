"use client";

import { useState } from "react";
import { DashboardHeading, DashboardShell, networks } from "../dashboard-shell";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export default function WithdrawPage() {
  const [submitted, setSubmitted] = useState(false);
  const [network, setNetwork] = useState(networks[0].name);
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitWithdrawal = async () => {
    setError("");
    const numericAmount = Number(amount);
    if (!address.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Enter a recipient address and a valid amount.");
      return;
    }

    setIsSubmitting(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setError("Your session has expired. Please log in again.");
      setIsSubmitting(false);
      return;
    }

    const { error: insertError } = await supabase
      .from("withdrawal_requests")
      .insert({
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

    setSubmitted(true);
  };

  return <DashboardShell active="withdraw">
    <DashboardHeading title="Withdraw funds" description="Send available funds to an external wallet." />
    <section className="dashboard-panel narrow-panel"><div className="panel-heading"><div><p className="dashboard-kicker">Send assets</p><h2>Withdrawal details</h2></div><span className="panel-step">01 <i>/</i> 02</span></div><label className="dashboard-field-label" htmlFor="withdraw-network">Network</label><select className="dashboard-select" id="withdraw-network" onChange={(event) => setNetwork(event.target.value)} value={network}>{networks.map((item) => <option key={item.name}>{item.name}</option>)}</select><label className="dashboard-field-label" htmlFor="withdraw-address">Recipient address</label><input className="dashboard-input" id="withdraw-address" onChange={(event) => setAddress(event.target.value)} placeholder="Paste wallet address" value={address} /><div className="amount-fields"><div><label className="dashboard-field-label" htmlFor="withdraw-amount">Amount</label><input className="dashboard-input" id="withdraw-amount" onChange={(event) => setAmount(event.target.value)} placeholder="0.00" value={amount} /></div><div><label className="dashboard-field-label" htmlFor="withdraw-currency">Currency</label><select className="dashboard-select" id="withdraw-currency" onChange={(event) => setCurrency(event.target.value)} value={currency}><option>USD</option><option>USDC</option></select></div></div>{error && <p className="auth-error" role="alert">{error}</p>}<button className="dashboard-primary-button" disabled={isSubmitting || submitted} onClick={submitWithdrawal} type="button">{isSubmitting ? "Submitting..." : submitted ? "Withdrawal submitted ✓" : "Submit withdrawal"}<span>↗</span></button>{submitted && <p className="confirmation-message">Your withdrawal request is pending admin review.</p>}</section>
  </DashboardShell>;
}
