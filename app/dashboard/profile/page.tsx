"use client";

import { useEffect, useState } from "react";
import { DashboardHeading, DashboardShell, useDashboardProfile } from "../dashboard-shell";
import { useDashboardProfileContext } from "../dashboard-context";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export default function ProfilePage() {
  const profile = useDashboardProfile();
  const { refreshProfile } = useDashboardProfileContext();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saved, setSaved] = useState(false);

  const [inviteCopied, setInviteCopied] = useState(false);

  useEffect(() => {
    if (profile) {
      setName((prev) => (prev ? prev : profile.full_name));
      setPhone((prev) => (prev ? prev : profile.phone || ""));
    }
  }, [profile]);

  const copyInviteLink = async () => {
    if (!profile) return;
    const url = `${window.location.origin}/login?mode=signup&invitedby=${encodeURIComponent(profile.id)}`;
    await navigator.clipboard.writeText(url);
    setInviteCopied(true);
    window.setTimeout(() => setInviteCopied(false), 2000);
  };

  const saveProfile = async () => {
    if (!profile) return;
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: name.trim() || profile.full_name, phone: phone.trim() })
      .eq("id", profile.id);
    if (!error) {
      await refreshProfile();
      setSaved(true);
    } else {
      setSaved(false);
    }
  };

  const inviteUrl = typeof window !== "undefined" && profile
    ? `${window.location.origin}/login?mode=signup&invitedby=${encodeURIComponent(profile.id)}`
    : "";

  const initials = name ? name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() : "--";
  return (
    <DashboardShell active="profile">
      <DashboardHeading title="Profile" description="Manage your personal details and account preferences." />
      <section className="dashboard-panel profile-edit-panel">
        <div className="profile-edit-heading">
          <div className="profile-large-avatar">{initials}</div>
          <div>
            <p className="dashboard-kicker">Account owner</p>
            <h2>{profile?.full_name || "Loading profile..."}</h2>
            <p className="panel-description">{profile?.role === "admin" ? "Administrator" : "Client account"}</p>
          </div>
        </div>
        <div className="profile-form">
          <div><label className="dashboard-field-label" htmlFor="profile-name">Full name</label><input className="dashboard-input" id="profile-name" value={name} onChange={(event) => { setName(event.target.value); setSaved(false); }} /></div>
          <div><label className="dashboard-field-label" htmlFor="profile-email">Email address</label><input className="dashboard-input" id="profile-email" type="email" value={profile?.email || ""} readOnly /></div>
          <div><label className="dashboard-field-label" htmlFor="profile-phone">Phone number</label><input className="dashboard-input" id="profile-phone" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Add phone number" /></div>
          <div><label className="dashboard-field-label" htmlFor="profile-role">Account role</label><input className="dashboard-input" id="profile-role" value={profile?.role || "user"} readOnly /></div>
        </div>
        <button className="dashboard-primary-button" disabled={!profile} onClick={saveProfile} type="button">{saved ? "Details saved ✓" : "Save changes"}</button>
      </section>

      <section className="dashboard-panel profile-edit-panel" style={{ marginTop: "24px" }}>
        <div className="panel-heading">
          <div>
            <p className="dashboard-kicker">Invite &amp; Earn</p>
            <h2>Your personal invite link</h2>
            <p className="panel-description">Share your unique invite link with friends. No referral code needed; invitations are automatically credited when they sign up.</p>
          </div>
        </div>
        <div className="invite-share-box">
          <input
            aria-label="Your personal invite link"
            className="invite-share-input"
            readOnly
            value={inviteUrl}
          />
          <button className="dashboard-primary-button" disabled={!profile} onClick={copyInviteLink} type="button">
            {inviteCopied ? "Link copied ✓" : "Copy invite link"}
          </button>
        </div>
      </section>
    </DashboardShell>
  );
}
