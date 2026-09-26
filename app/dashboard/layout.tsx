import { DashboardProvider } from "./dashboard-context";

export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return <DashboardProvider>{children}</DashboardProvider>;
}
