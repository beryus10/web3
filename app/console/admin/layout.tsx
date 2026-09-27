import { SupportNotifier } from "./support-notifier";

export default function AdminLayout({ children }: LayoutProps<"/console/admin">) {
  return <>{children}<SupportNotifier /></>;
}
