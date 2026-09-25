import { AdminShell } from "../admin-shell";
import { requireAdmin } from "../data";
import { reviewWithdrawal } from "../actions";

export default async function AdminWithdrawalsPage() {
  const supabase = await requireAdmin();
  const [{ data: withdrawals }, { data: profiles }] = await Promise.all([
    supabase.from("withdrawal_requests").select("id, user_id, amount, network, currency, recipient_address, status, created_at").eq("status", "pending").order("created_at", { ascending: true }),
    supabase.from("profiles").select("id, email, full_name"),
  ]);
  const users = new Map((profiles || []).map((profile) => [profile.id, profile]));

  return <AdminShell active="withdrawals"><header className="admin-page-header"><div><p className="dashboard-kicker">Payout queue</p><h1>Withdrawal requests</h1><p>Review client payout destinations and requested amounts.</p></div></header><section className="admin-panel"><div className="admin-panel-heading"><h2>Pending withdrawals</h2><span>{withdrawals?.length || 0} awaiting review</span></div><div className="admin-user-list">{(withdrawals || []).map((withdrawal) => { const user = users.get(withdrawal.user_id); return <article className="admin-user-row admin-withdrawal-row" key={withdrawal.id}><div><strong>{user?.full_name || user?.email || "Unknown user"}</strong><span>{withdrawal.network} · {withdrawal.currency} · {new Date(withdrawal.created_at).toLocaleString()}</span><small>Recipient address: {withdrawal.recipient_address}</small></div><b>${Number(withdrawal.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</b><div className="admin-review-actions"><span className="admin-status pending">Pending</span><form action={reviewWithdrawal}><input name="request_id" type="hidden" value={withdrawal.id} /><input name="decision" type="hidden" value="approved" /><button className="admin-primary-button" type="submit">Confirm withdrawal</button></form><form action={reviewWithdrawal}><input name="request_id" type="hidden" value={withdrawal.id} /><input name="decision" type="hidden" value="rejected" /><button className="admin-danger-button" type="submit">Cancel</button></form></div></article>; })}{(!withdrawals || withdrawals.length === 0) && <p className="admin-empty">No pending withdrawals.</p>}</div></section></AdminShell>;
}
