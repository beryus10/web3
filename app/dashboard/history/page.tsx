"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardHeading, DashboardShell } from "../dashboard-shell";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

type Activity = {
  id: string;
  type: "Deposit" | "Withdrawal";
  method: string;
  amount: number;
  status: string;
  date: string;
};

export default function HistoryPage() {
  const [activity, setActivity] = useState<Activity[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    let active = true;

    async function loadActivity() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const [{ data: deposits }, { data: withdrawals }, { data: transactions }] = await Promise.all([
        supabase
          .from("deposit_requests")
          .select("id, amount, network, status, created_at")
          .eq("user_id", userData.user.id),
        supabase
          .from("withdrawal_requests")
          .select("id, amount, network, currency, status, created_at")
          .eq("user_id", userData.user.id),
        supabase
          .from("balance_transactions")
          .select("id, type, amount, status, description, created_at")
          .eq("user_id", userData.user.id),
      ]);

      const depositActivity: Activity[] = (deposits || []).map((deposit) => ({
        id: deposit.id,
        type: "Deposit",
        method: deposit.network,
        amount: Number(deposit.amount),
        status: deposit.status,
        date: deposit.created_at,
      }));
      const withdrawalActivity: Activity[] = (withdrawals || []).map((withdrawal) => ({
        id: withdrawal.id,
        type: "Withdrawal",
        method: `${withdrawal.network} (${withdrawal.currency})`,
        amount: Number(withdrawal.amount),
        status: withdrawal.status,
        date: withdrawal.created_at,
      }));
      const transactionActivity: Activity[] = (transactions || [])
        .filter(
          (transaction) =>
            transaction.type !== "adjustment" &&
            !transaction.description.toLowerCase().includes("deposit approved"),
        )
        .map((transaction) => ({
          id: transaction.id,
          type: "Withdrawal",
          method: transaction.description || transaction.type,
          amount: Number(transaction.amount),
          status: transaction.status,
          date: transaction.created_at,
        }));

      if (active)
        setActivity(
          [...depositActivity, ...withdrawalActivity, ...transactionActivity].sort((a, b) =>
            b.date.localeCompare(a.date),
          ),
        );
    }

    void loadActivity();
    return () => {
      active = false;
    };
  }, []);

  const filteredActivity = useMemo(
    () =>
      activity.filter(
        (item) => filter === "all" || item.type.toLowerCase() === filter,
      ),
    [activity, filter],
  );

  return (
    <DashboardShell active="history">
      <DashboardHeading
        title="History"
        description="Review your deposits, withdrawals, and account activity."
      />
      <section className="dashboard-table-section history-section">
        <div className="history-heading">
          <div>
            <p className="dashboard-kicker">Account activity</p>
            <h2>Recent transactions</h2>
          </div>
          <select
            className="dashboard-select history-filter"
            aria-label="Filter transactions"
            onChange={(event) => setFilter(event.target.value)}
            value={filter}
          >
            <option value="all">All activity</option>
            <option value="deposit">Deposits</option>
            <option value="withdrawal">Withdrawals</option>
          </select>
        </div>
        <div className="dashboard-table history-table">
          <div>
            <b>Type</b>
            <b>Method</b>
            <b>Amount</b>
            <b>Status</b>
            <b>Date</b>
          </div>
          {filteredActivity.map((item) => (
            <div key={item.id}>
              <strong>{item.type}</strong>
              <span>{item.method}</span>
              <strong>
                $
                {item.amount.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </strong>
              <em
                className={
                  item.status === "approved" || item.status === "completed"
                    ? "completed"
                    : ""
                }
              >
                {item.status}
              </em>
              <span>{new Date(item.date).toLocaleDateString()}</span>
            </div>
          ))}
          {filteredActivity.length === 0 && (
            <p className="admin-empty text-center">No account activity yet.</p>
          )}
        </div>
      </section>
    </DashboardShell>
  );
}
