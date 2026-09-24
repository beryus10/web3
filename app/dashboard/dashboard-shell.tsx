import Link from "next/link";

export type DashboardNav = "dashboard" | "fund" | "withdraw" | "history" | "profile";

const navigation: { id: DashboardNav; label: string; href: string; icon: string }[] = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: "⌂" },
  { id: "fund", label: "Fund Account", href: "/dashboard/fund", icon: "▣" },
  { id: "withdraw", label: "Withdraw", href: "/dashboard/withdraw", icon: "↗" },
  { id: "history", label: "History", href: "/dashboard/history", icon: "↶" },
  { id: "profile", label: "Profile", href: "/dashboard/profile", icon: "●" },
];

export function DashboardShell({ active, children }: { active: DashboardNav; children: React.ReactNode }) {
  return (
    <main className="dashboard-page">
      <aside className="dashboard-sidebar">
        <Link className="dashboard-brand" href="/"><span className="dashboard-brand-mark">↗</span><span>alphainfortrading</span></Link>
        <div className="dashboard-account"><span className="dashboard-avatar">BJ</span><span><b>Brian Jordan Ellis</b><small>brian@alphainfortrading.com</small></span></div>
        <nav className="dashboard-sidebar-nav" aria-label="Dashboard navigation">
          {navigation.map((item) => <Link className={active === item.id ? "active" : ""} href={item.href} key={item.id}><span>{item.icon}</span>{item.label}</Link>)}
        </nav>
        <Link className="dashboard-logout" href="/login"><span>↪</span>Log out</Link>
      </aside>
      <header className="dashboard-topbar"><span>Welcome back, <b>Brian Jordan Ellis</b></span><span className="dashboard-avatar">BJ</span></header>
      <section className="dashboard-main">{children}</section>
      <nav className="dashboard-mobile-dock" aria-label="Dashboard navigation">{navigation.map((item) => <Link className={active === item.id ? "active" : ""} href={item.href} key={item.id} aria-label={item.label}><span>{item.icon}</span></Link>)}</nav>
    </main>
  );
}

export function DashboardHeading({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return <div className="dashboard-heading"><div>{eyebrow && <p className="dashboard-kicker">{eyebrow}</p>}<h1>{title}</h1>{description && <p>{description}</p>}</div><div className="dashboard-balance"><span>Total balance</span><strong>$24,580.00</strong><small><b>+8.24%</b> this month</small></div></div>;
}

export const networks = [
  { name: "Ethereum", symbol: "ETH", color: "#627eea", detail: "Ethereum Mainnet" },
  { name: "Bitcoin", symbol: "BTC", color: "#f7931a", detail: "Bitcoin Network" },
  { name: "Solana", symbol: "SOL", color: "#6857f5", detail: "Solana Mainnet" },
];
