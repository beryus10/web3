"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

const supabase = createClient();
type SupportMessage = Database["public"]["Tables"]["support_messages"]["Row"];
type SupportProfile = { id: string; full_name: string; email: string };

export function SupportInbox() {
  const searchParams = useSearchParams();
  const requestedUserId = searchParams.get("user") || "";
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [profiles, setProfiles] = useState<SupportProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const messageEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    const loadInbox = async () => {
      const [{ data: messageData, error: messageError }, { data: profileData }] = await Promise.all([
        supabase.from("support_messages").select("*").order("created_at", { ascending: true }),
        supabase.from("profiles").select("id, full_name, email").eq("role", "user"),
      ]);
      if (!active) return;
      if (messageError) setError(messageError.message);
      if (messageData) setMessages(messageData);
      if (profileData) setProfiles(profileData);
      setLoading(false);
    };

    void loadInbox();
    const timer = window.setInterval(() => void loadInbox(), 4000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  const conversations = useMemo(() => {
    const latest = new Map<string, SupportMessage>();
    for (const message of messages) latest.set(message.user_id, message);
    return [...latest.values()].sort((a, b) => b.created_at.localeCompare(a.created_at));
  }, [messages]);

  const activeUserId = selectedUser || requestedUserId;
  const selectedProfile = profiles.find((profile) => profile.id === activeUserId);
  const thread = messages.filter((message) => message.user_id === activeUserId);

  useEffect(() => {
    messageEnd.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [thread.length]);

  const sendReply = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = draft.trim();
    if (!activeUserId || !body || sending) return;
    setSending(true);
    setError("");
    const { error: insertError } = await supabase.from("support_messages").insert({
      user_id: activeUserId,
      sender_role: "admin",
      body,
    });
    setSending(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setDraft("");
    const { data } = await supabase.from("support_messages").select("*").order("created_at", { ascending: true });
    if (data) setMessages(data);
  };

  return (
    <div className="admin-support-page">
      <header className="admin-page-header">
        <div>
          <p className="dashboard-kicker">Client care</p>
          <h1>Support inbox</h1>
          <p>Reply to client conversations. New messages refresh automatically.</p>
        </div>
      </header>
      <section className="admin-support-layout">
        <aside className="admin-support-list">
          <div className="admin-panel-heading">
            <h2>Client Conversations</h2>
            <span>{conversations.length}</span>
          </div>
          <div className="admin-conversations-scroll">
            {loading && <p className="admin-empty">Loading conversations...</p>}
            {conversations.map((message) => {
              const profile = profiles.find((item) => item.id === message.user_id);
              const name = profile?.full_name || profile?.email || "Client";
              const initial = name.trim()[0].toUpperCase();
              const isSelected = activeUserId === message.user_id;
              return (
                <div
                  className={`admin-support-conversation ${isSelected ? "active" : ""}`}
                  key={message.user_id}
                  onClick={() => setSelectedUser(message.user_id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="admin-conv-avatar" aria-hidden="true">{initial}</div>
                  <div className="admin-conv-info">
                    <div className="admin-conv-info-top">
                      <strong>{name}</strong>
                      <time>{new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
                    </div>
                    <small>{message.body}</small>
                    <button
                      className="admin-start-chat-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedUser(message.user_id);
                      }}
                      type="button"
                    >
                      {isSelected ? "Chatting ✓" : "Start chat ↗"}
                    </button>
                  </div>
                </div>
              );
            })}
            {!loading && !conversations.length && <p className="admin-empty">No client conversations yet.</p>}
          </div>
        </aside>

        <section className="admin-support-thread">
          {!activeUserId ? (
            <div className="admin-chat-placeholder">
              <div className="admin-chat-placeholder-icon" aria-hidden="true">💬</div>
              <h2>Select a client to start chatting</h2>
              <p>Click &quot;Start chat&quot; on any client conversation from the list to view their messages and reply.</p>
            </div>
          ) : (
            <>
              <header className="admin-thread-header">
                <div className="admin-thread-header-user">
                  <div className="admin-thread-avatar" aria-hidden="true">
                    {(selectedProfile?.full_name || selectedProfile?.email || "C").trim()[0].toUpperCase()}
                  </div>
                  <div>
                    <h2>{selectedProfile?.full_name || selectedProfile?.email || "Client Conversation"}</h2>
                    <span>{selectedProfile?.email || "Active User"}</span>
                  </div>
                </div>
                <div className="admin-thread-badge">
                  <i aria-hidden="true" /> Live chat
                </div>
              </header>

              <div className="support-message-list" aria-live="polite" role="log">
                {thread.map((message) => {
                  const isClient = message.sender_role === "user";
                  return (
                    <article
                      className={`support-message ${isClient ? "admin-msg-client" : "admin-msg-admin"}`}
                      key={message.id}
                    >
                      <span className="msg-sender">{isClient ? (selectedProfile?.full_name || "Client") : "You (Support)"}</span>
                      <p>{message.body}</p>
                      <time>
                        {new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} • {new Date(message.created_at).toLocaleDateString()}
                      </time>
                    </article>
                  );
                })}
                {thread.length === 0 && <p className="support-empty">No messages in this conversation.</p>}
                <div ref={messageEnd} />
              </div>

              <form className="support-compose" onSubmit={sendReply}>
                <label className="sr-only" htmlFor="admin-support-reply">Reply to client</label>
                <textarea
                  id="admin-support-reply"
                  maxLength={4000}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder={`Write a reply to ${selectedProfile?.full_name || "client"}...`}
                  value={draft}
                />
                <button
                  className="admin-primary-button"
                  disabled={!draft.trim() || sending}
                  type="submit"
                >
                  {sending ? "Sending..." : "Send reply"}
                </button>
              </form>
            </>
          )}
          {error && <p className="auth-error" role="alert" style={{ margin: "10px 20px" }}>{error}</p>}
        </section>
      </section>
    </div>
  );
}
