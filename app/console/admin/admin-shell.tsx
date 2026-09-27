import Link from "next/link";
import { signOutAdmin } from "./actions";
import { BrandMark } from "../../brand-mark";

export function AdminShell({
  active,
  children,
}: {
  active: "overview" | "users" | "deposits" | "withdrawals" | "support";
  children: React.ReactNode;
}) {
  const navigation = [
    ["overview", "Overview", "/console/admin"],
    ["users", "Users", "/console/admin/users"],
    ["deposits", "Deposit requests", "/console/admin/deposits"],
    ["withdrawals", "Withdrawal requests", "/console/admin/withdrawals"],
    ["support", "Client support", "/console/admin/support"],
  ] as const;

  return (
    <main className="admin-console">
      <aside className="admin-sidebar">
        <Link className="admin-brand" href="/">
          <BrandMark className="dashboard-brand-mark" />
          <span>alphainfortrading</span>
        </Link>
        <div className="admin-sidebar-label">Operations</div>
        <nav className="admin-navigation" aria-label="Admin navigation">
          {navigation.map(([id, label, href]) => (
            <Link className={active === id ? "active" : ""} href={href} key={id}>
              <span>{id === "overview" ? "⌂" : id === "users" ? "●" : id === "deposits" ? "↓" : id === "withdrawals" ? "↗" : "?"}</span>
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
