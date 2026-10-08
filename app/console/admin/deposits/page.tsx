import { approveDeposit, rejectDeposit } from "../actions";
import { AdminShell } from "../admin-shell";
import { requireAdmin } from "../data";

export default async function AdminDepositsPage() {
  const supabase = await requireAdmin();
  const [{ data: pendingDeposits }, { data: historyDeposits }, { data: profiles }] = await Promise.all([
    supabase.from("deposit_requests").select("id, user_id, amount, network, status, created_at").eq("status", "pending").order("created_at", { ascending: true }),
    supabase.from("deposit_requests").select("id, user_id, amount, network, status, created_at").neq("status", "pending").order("created_at", { ascending: false }),
    supabase.from("profiles").select("id, email, full_name"),
  ]);
  const users = new Map((profiles || []).map((profile) => [profile.id, profile]));

  return <AdminShell active="deposits"><header className="admin-page-header"><div><p className="dashboard-kicker">Funding queue</p><h1>Deposit requests</h1><p>Approve deposits to update the client balance once.</p></div></header><section className="admin-panel"><div className="admin-panel-heading"><h2>Pending deposits</h2><span>{pendingDeposits?.length || 0} awaiting review</span></div><div className="admin-user-list">{(pendingDeposits || []).map((deposit) => { const user = users.get(deposit.user_id); return <article className="admin-user-row" key={deposit.id}><div><strong>{user?.full_name || user?.email || "Unknown user"}</strong><span>{deposit.network} · {new Date(deposit.created_at).toLocaleString()}</span></div><b>${Number(deposit.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</b><div className="admin-actions"><form action={approveDeposit}><input name="request_id" type="hidden" value={deposit.id} /><button className="admin-primary-button" type="submit">Apply</button></form><form action={rejectDeposit}><input name="request_id" type="hidden" value={deposit.id} /><button className="admin-secondary-button" type="submit">Cancel</button></form></div></article>; })}{(!pendingDeposits || pendingDeposits.length === 0) && <p className="admin-empty">No pending deposits.</p>}</div></section><section className="admin-panel" style={{ marginTop: "2rem" }}><div className="admin-panel-heading"><h2>Deposit History</h2></div><div className="admin-user-list">{(historyDeposits || []).map((deposit) => { const user = users.get(deposit.user_id); return <article className="admin-user-row" key={deposit.id}><div><strong>{user?.full_name || user?.email || "Unknown user"}</strong><span>{deposit.network} · {new Date(deposit.created_at).toLocaleString()}</span></div><b>${Number(deposit.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</b><span className={`status-badge ${deposit.status}`}>{deposit.status.toUpperCase()}</span></article>; })}{(!historyDeposits || historyDeposits.length === 0) && <p className="admin-empty">No deposit history available.</p>}</div></section></AdminShell>;
}
