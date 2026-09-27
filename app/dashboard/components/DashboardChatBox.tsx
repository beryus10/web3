"use client";

import React, { useState } from "react";
import { DashboardHeading } from "../dashboard-shell";
import { useDashboardProfile } from "../dashboard-shell"; // reuse hook
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

const supabase = createClient();

type SupportMessage = Database["public"]["Tables"]["support_messages"]["Row"];

export function DashboardChatBox() {
  const profile = useDashboardProfile();
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [chatStarted, setChatStarted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // Load messages (same logic as support page)
  React.useEffect(() => {
    if (!profile?.id) return;
    let active = true;
    const load = async () => {
      const { data, error: qErr } = await supabase
        .from("support_messages")
        .select("*")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: true });
      if (!active) return;
      if (qErr) setError(qErr.message);
      if (data) setMessages(data);
      setLoading(false);
    };
    void load();
    const timer = window.setInterval(() => void load(), 5000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [profile?.id]);

  const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const body = draft.trim();
    if (!profile?.id || !body || sending) return;
    setSending(true);
    setError("");
    const { error: insErr } = await supabase.from("support_messages").insert({
      user_id: profile.id,
      sender_role: "user",
      body,
    });
    setSending(false);
    if (insErr) {
      setError(insErr.message);
      return;
    }
    setDraft("");
    setChatStarted(true);
    // refresh list
    const { data } = await supabase
      .from("support_messages")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: true });
    if (data) setMessages(data);
  };

  return (
    <section className="dashboard-panel support-start-card">
      {!chatStarted ? (
        <>
          <div className="support-start-icon" aria-hidden="true">💬</div>
          <div>
            <p className="dashboard-kicker">Quick assistance</p>
            <h2>Chat with our support team instantly for quick resolution of your queries.</h2>
            <p>Our team will respond here. You can leave the conversation and return later to see replies.</p>
          </div>
          <button className="dashboard-primary-button" onClick={() => setChatStarted(true)} type="button">
            Start chat <span>↗</span>
          </button>
        </>
      ) : (
        <section className="dashboard-panel support-chat-panel">
          <header className="support-chat-heading">
            <div>
              <p className="dashboard-kicker">Live chat</p>
              <h2>Message support</h2>
            </div>
            <span className="support-online"><i /> Replies refresh automatically</span>
          </header>
          <div aria-live="polite" className="support-message-list" role="log">
            {loading && <p className="support-empty">Loading conversation...</p>}
            {!loading && messages.length === 0 && (
              <p className="support-empty">Send us a message to start a conversation. Our support team will reply here.</p>
            )}
            {messages.map((msg) => (
              <article className={`support-message ${msg.sender_role === "user" ? "from-user" : "from-admin"}`} key={msg.id}>
                <span>{msg.sender_role === "user" ? "You" : "Support"}</span>
                <p>{msg.body}</p>
                <time>{new Date(msg.created_at).toLocaleString()}</time>
              </article>
            ))}
          </div>
          <form className="support-compose" onSubmit={sendMessage}>
            <label className="sr-only" htmlFor="support-message">Your message</label>
            <textarea
              id="support-message"
              maxLength={4000}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write a message to support..."
              value={draft}
            />
            <button className="dashboard-primary-button" disabled={!draft.trim() || sending} type="submit">
              {sending ? "Sending..." : "Send message"} <span>↗</span>
            </button>
          </form>
          {error && <p className="auth-error" role="alert">{error}</p>}
        </section>
      )}
    </section>
  );
}
