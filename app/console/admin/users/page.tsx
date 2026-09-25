import Link from "next/link";
import { AdminShell } from "../admin-shell";
import { requireAdmin } from "../data";

export default async function AdminUsersPage() {
  const supabase = await requireAdmin();
  const { data } = await supabase.from("profiles").select("id, email, full_name, role, balance, active_investment, total_earnings, created_at").eq("role", "user").order("created_at", { ascending: false });
  const users = data || [];

  return <AdminShell active="users"><header className="admin-page-header"><div><p className="dashboard-kicker">Client accounts</p><h1>Users</h1><p>Open a user to see their full account record.</p></div></header><section className="admin-panel"><div className="admin-panel-heading"><h2>All users</h2><span>{users.length} clients</span></div><div className="admin-user-list">{users.map((user) => <Link className="admin-user-row admin-user-link" href={`/console/admin/users/${user.id}`} key={user.id}><div><strong>{user.full_name || "Unnamed user"}</strong><span>{user.email}</span></div><b>${Number(user.balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}</b><span className="admin-row-arrow">View profile ↗</span></Link>)}{users.length === 0 && <p className="admin-empty">No client profiles yet.</p>}</div></section></AdminShell>;
}
