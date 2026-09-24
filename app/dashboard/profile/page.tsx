"use client";

import { useState } from "react";
import { DashboardHeading, DashboardShell } from "../dashboard-shell";

export default function ProfilePage() {
  const [name, setName] = useState("Brian Jordan Ellis");
  const [email, setEmail] = useState("brian@alphainfortrading.com");
  const [phone, setPhone] = useState("+1 212 555 0184");
  const [saved, setSaved] = useState(false);

  return <DashboardShell active="profile"><DashboardHeading title="Profile" description="Manage your personal details and account preferences." /><section className="dashboard-panel profile-edit-panel"><div className="profile-edit-heading"><div className="profile-large-avatar">BJ</div><div><p className="dashboard-kicker">Account owner</p><h2>Brian Jordan Ellis</h2><p className="panel-description">CEO &amp; Founder</p></div></div><div className="profile-form"><div><label className="dashboard-field-label" htmlFor="profile-name">Full name</label><input className="dashboard-input" id="profile-name" value={name} onChange={(event) => setName(event.target.value)} /></div><div><label className="dashboard-field-label" htmlFor="profile-email">Email address</label><input className="dashboard-input" id="profile-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></div><div><label className="dashboard-field-label" htmlFor="profile-phone">Phone number</label><input className="dashboard-input" id="profile-phone" value={phone} onChange={(event) => setPhone(event.target.value)} /></div><div><label className="dashboard-field-label" htmlFor="profile-role">Account role</label><input className="dashboard-input" id="profile-role" value="CEO & Founder" readOnly /></div></div><button className="dashboard-primary-button" onClick={() => setSaved(true)} type="button">{saved ? "Details saved ✓" : "Save changes"}</button></section></DashboardShell>;
}
