import { AdminShell } from "../admin-shell";
import { requireAdmin } from "../data";
import { SupportInbox } from "./support-inbox";
import "./support.css";

export default async function AdminSupportPage() {
  await requireAdmin();
  return <AdminShell active="support"><SupportInbox /></AdminShell>;
}
