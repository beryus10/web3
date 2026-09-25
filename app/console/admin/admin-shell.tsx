import Link from "next/link";
import { signOutAdmin } from "./actions";

export function AdminShell({
  active,
  children,
}: {
  active: "overview" | "users" | "deposits" | "withdrawals";
  children: React.ReactNode;
}) {
  const navigation = [
    ["overview", "Overview", "/console/admin"],
    ["users", "Users", "/console/admin/users"],
    ["deposits", "Deposit requests", "/console/admin/deposits"],
    ["withdrawals", "Withdrawal requests", "/console/admin/withdrawals"],
  ] as const;

  return (
    <main className="admin-console">
      <aside className="admin-sidebar">
        <Link className="admin-brand" href="/">
          <span className="dashboard-brand-mark">↗</span>
          <span>alphainfortrading</span>
        </Link>
        <div className="admin-sidebar-label">Operations</div>
        <nav className="admin-navigation" aria-label="Admin navigation">
          {navigation.map(([id, label, href]) => (
            <Link className={active === id ? "active" : ""} href={href} key={id}>
              <span>{id === "overview" ? "⌂" : id === "users" ? "●" : id === "deposits" ? "↓" : "↗"}</span>
              {label}
            </Link>
          ))}
        </nav>
        <form action={signOutAdmin} className="admin-signout">
          <button type="submit">↪ Sign out</button>
        </form>
      </aside>
      <section className="admin-console-content">{children}</section>
    </main>
  );
}
