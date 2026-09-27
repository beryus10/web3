"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { DashboardHeading, DashboardShell } from "../dashboard-shell";
import { useDashboardProfileContext } from "../dashboard-context";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

const supabase = createClient();
type SupportMessage = Database["public"]["Tables"]["support_messages"]["Row"];

export default function SupportPage() {
  const { profile } = useDashboardProfileContext();
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [chatStarted, setChatStarted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const messageEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profile?.id) return;
    let active = true;

    const loadMessages = async () => {
      const { data, error: queryError } = await supabase
        .from("support_messages")
        .select("*")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: true });
      if (!active) return;
      if (queryError) setError(queryError.message);
      if (data) {
        setMessages(data);
      }
      setLoading(false);
    };

    void loadMessages();
    const timer = window.setInterval(() => void loadMessages(), 5000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [profile?.id]);

  useEffect(() => {
    messageEnd.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = draft.trim();
    if (!profile?.id || !body || sending) return;

    setSending(true);
    setError("");
    const { error: insertError } = await supabase.from("support_messages").insert({
      user_id: profile.id,
      sender_role: "user",
      body,
    });
    setSending(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setDraft("");
    setChatStarted(true);
    const { data } = await supabase
      .from("support_messages")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: true });
    if (data) setMessages(data);
  };

  return (
    <DashboardShell active="support">
      <DashboardHeading title="Support" description="Talk with our team or email us directly." />
      <div className="support-contact-strip">
        <div><span className="support-contact-icon">@</span><div><small>Email support</small><a href="mailto:hello@alphainfortrading.com">hello@alphainfortrading.com</a></div></div>
        <div><span className="support-contact-icon">⌖</span><div><small>Office</small><strong>Texas Business Brokers - Austin Office - Austin, TX</strong></div></div>
      </div>
      {!chatStarted && <section className="dashboard-panel support-start-card"><div className="support-start-icon" aria-hidden="true">💬</div><div><p className="dashboard-kicker">Quick assistance</p><h2>Chat with our support team instantly for quick resolution of your queries.</h2><p>Our team will respond here. You can leave the conversation and return later to see replies.</p></div><button className="dashboard-primary-button" onClick={() => setChatStarted(true)} type="button">Start chat <span>↗</span></button></section>}
      {chatStarted && <section className="dashboard-panel support-chat-panel">
        <header className="support-chat-heading"><div><p className="dashboard-kicker">Live chat</p><h2>Message support</h2></div><span className="support-online"><i /> Replies refresh automatically</span></header>
        <div aria-live="polite" className="support-message-list" role="log">
          {loading && <p className="support-empty">Loading conversation...</p>}
          {!loading && messages.length === 0 && <p className="support-empty">Send us a message to start a conversation. Our support team will reply here.</p>}
          {messages.map((message) => <article className={`support-message ${message.sender_role === "user" ? "from-user" : "from-admin"}`} key={message.id}><span>{message.sender_role === "user" ? "You" : "Support"}</span><p>{message.body}</p><time>{new Date(message.created_at).toLocaleString()}</time></article>)}
          <div ref={messageEnd} />
        </div>
        <form className="support-compose" onSubmit={sendMessage}><label className="sr-only" htmlFor="support-message">Your message</label><textarea id="support-message" maxLength={4000} onChange={(event) => setDraft(event.target.value)} placeholder="Write a message to support..." value={draft} /><button className="dashboard-primary-button" disabled={!draft.trim() || sending} type="submit">{sending ? "Sending..." : "Send message"} <span>↗</span></button></form>
        {error && <p className="auth-error" role="alert">{error}</p>}
      </section>}
    </DashboardShell>
  );
}
