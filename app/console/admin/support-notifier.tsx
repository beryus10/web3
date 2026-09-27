"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
type IncomingMessage = { id: string; user_id: string; body: string; created_at: string };

function playNotificationChime() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // Ignore audio autoplay restrictions
  }
}

export function SupportNotifier() {
  const [notice, setNotice] = useState<(IncomingMessage & { clientName: string }) | null>(null);

  useEffect(() => {
    let active = true;
    let initialized = false;
    let isAdmin = false;
    const seen = new Set<string>();

    const handleNewMessage = async (msg: IncomingMessage) => {
      if (!active || seen.has(msg.id)) return;
      seen.add(msg.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", msg.user_id)
        .single();
      if (!active) return;

      const clientName = profile?.full_name || profile?.email || "A client";
      playNotificationChime();
      setNotice({ ...msg, clientName });

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(`New support chat from ${clientName}`, { body: msg.body });
      }
    };

    const checkForMessages = async () => {
      if (!isAdmin) {
        const { data: authData } = await supabase.auth.getUser();
        if (!authData.user) return;
        const { data: currentProfile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", authData.user.id)
          .single();
        isAdmin = currentProfile?.role === "admin";
        if (!isAdmin || !active) return;
      }

      const { data } = await supabase
        .from("support_messages")
        .select("id, user_id, body, created_at")
        .eq("sender_role", "user")
        .order("created_at", { ascending: false })
        .limit(30);

      if (!active || !data) return;

      if (!initialized) {
        data.forEach((message) => seen.add(message.id));
        initialized = true;
        return;
      }

      const newMessages = data.filter((message) => !seen.has(message.id));
      for (const msg of newMessages.reverse()) {
        await handleNewMessage(msg);
      }
    };

    void checkForMessages();
    const timer = window.setInterval(() => void checkForMessages(), 3500);

    const channel = supabase
      .channel("admin-support-listener")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "support_messages" },
        async (payload) => {
          const newMsg = payload.new as { id: string; user_id: string; sender_role: string; body: string; created_at: string };
          if (newMsg && newMsg.sender_role === "user" && !seen.has(newMsg.id)) {
            await handleNewMessage(newMsg);
          }
        }
      )
      .subscribe();

    return () => {
      active = false;
      window.clearInterval(timer);
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 14000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  if (!notice) return null;

  return (
    <aside aria-live="assertive" className="admin-support-toast" role="status">
      <span className="admin-support-toast-icon" aria-hidden="true">✉</span>
      <div>
        <strong>New incoming support chat</strong>
        <p><b>{notice.clientName}:</b> {notice.body}</p>
        <Link href={`/console/admin/support?user=${encodeURIComponent(notice.user_id)}`} onClick={() => setNotice(null)}>
          Open conversation &amp; reply ↗
        </Link>
      </div>
      <button aria-label="Dismiss notification" onClick={() => setNotice(null)} type="button">×</button>
    </aside>
  );
}
