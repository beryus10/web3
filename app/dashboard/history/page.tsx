import { DashboardHeading, DashboardShell } from "../dashboard-shell";

const activity = [
  ["Deposit", "Bitcoin", "$2,000.00", "Pending", "Sep 21, 2026"],
  ["Withdrawal", "Ethereum", "$500.00", "Completed", "Sep 18, 2026"],
  ["Deposit", "Solana", "$1,250.00", "Completed", "Sep 12, 2026"],
];

export default function HistoryPage() {
  return <DashboardShell active="history"><DashboardHeading title="History" description="Review your deposits, withdrawals, and account activity." /><section className="dashboard-table-section history-section"><div className="history-heading"><div><p className="dashboard-kicker">Account activity</p><h2>Recent transactions</h2></div><select className="dashboard-select history-filter" aria-label="Filter transactions"><option>All activity</option><option>Deposits</option><option>Withdrawals</option></select></div><div className="dashboard-table history-table"><div><b>Type</b><b>Method</b><b>Amount</b><b>Status</b><b>Date</b></div>{activity.map(([type, method, amount, status, date]) => <div key={`${type}-${date}`}><strong>{type}</strong><span>{method}</span><strong>{amount}</strong><em className={status === "Completed" ? "completed" : ""}>{status}</em><span>{date}</span></div>)}</div></section></DashboardShell>;
}
