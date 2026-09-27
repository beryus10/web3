import { DashboardProvider } from "./dashboard-context";
import "./dashboard-shell.css";

export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return <DashboardProvider>{children}</DashboardProvider>;
}
