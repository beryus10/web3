import Link from "next/link";
import { AdminShell } from "./admin-shell";
import { requireAdmin } from "./data";

export default async function AdminPage() {
  const supabase = await requireAdmin();
  const [{ data: profiles }, { data: deposits }, { data: withdrawals }] = await Promise.all([
    supabase.from("profiles").select("id, email, full_name, role, balance, created_at").order("created_at", { ascending: false }),
    supabase.from("deposit_requests").select("id, user_id, amount, network, status, created_at").eq("status", "pending"),
    supabase.from("withdrawal_requests").select("id, user_id, amount, network, currency, status, created_at").eq("status", "pending"),
  ]);

  const users = (profiles || []).filter((profile) => profile.role === "user");
  const managedBalance = users.reduce((total, user) => total + Number(user.balance), 0);

  return (
    <AdminShell active="overview">
      <header className="admin-page-header"><div><p className="dashboard-kicker">Operations</p><h1>Admin overview</h1><p>Keep the platform moving from one clear command center.</p></div></header>
      <section className="admin-summary-grid">
        <article><span>Total users</span><strong>{users.length}</strong><Link href="/console/admin/users">View users ↗</Link></article>
        <article><span>Pending deposits</span><strong>{deposits?.length || 0}</strong><Link href="/console/admin/deposits">Review deposits ↗</Link></article>
        <article><span>Pending withdrawals</span><strong>{withdrawals?.length || 0}</strong><Link href="/console/admin/withdrawals">Review withdrawals ↗</Link></article>
        <article><span>Managed balance</span><strong>${managedBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong><small>Across client accounts</small></article>
      </section>
      <section className="admin-overview-grid">
        <article className="admin-overview-card"><p className="dashboard-kicker">Client accounts</p><h2>Manage users</h2><p>Open a complete user record to review balances, deposits, withdrawals, and activity.</p><Link className="admin-primary-button" href="/console/admin/users">Open users</Link></article>
        <article className="admin-overview-card"><p className="dashboard-kicker">Queue</p><h2>Review requests</h2><p>Deposits and withdrawals are separated into their own review queues for faster processing.</p><div className="admin-overview-actions"><Link className="admin-secondary-button" href="/console/admin/deposits">Deposits</Link><Link className="admin-secondary-button" href="/console/admin/withdrawals">Withdrawals</Link></div></article>
      </section>
    </AdminShell>
  );
}
