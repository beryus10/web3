"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/types";

const supabase = createClient();
const DashboardProfileContext = createContext<{
  profile: Profile | null;
  refreshProfile: () => Promise<void>;
} | null>(null);
const cacheKey = "alphainfortrading:profile:";

function profileFromAuth(user: {
  id: string;
  email?: string;
  user_metadata: Record<string, unknown>;
  created_at: string;
}): Profile {
  return {
    id: user.id,
    email: user.email || "",
    full_name: typeof user.user_metadata.full_name === "string" ? user.user_metadata.full_name : "Your account",
    phone: typeof user.user_metadata.phone === "string" ? user.user_metadata.phone : "",
    referred_by: null,
    role: "user",
    balance: 0,
    active_investment: 0,
    total_earnings: 0,
    created_at: user.created_at,
  };
}

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const currentUserId = useRef<string | null>(null);

  const loadProfile = useCallback(async (userId?: string) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const sessionUser = sessionData.session?.user;
    const user = sessionUser && (!userId || sessionUser.id === userId) ? sessionUser : null;

    if (!user) {
      if (currentUserId.current) localStorage.removeItem(`${cacheKey}${currentUserId.current}`);
      currentUserId.current = null;
      setProfile(null);
      return;
    }

    currentUserId.current = user.id;
    const key = `${cacheKey}${user.id}`;
    try {
      const cached = localStorage.getItem(key);
      if (cached) {
        const cachedProfile = JSON.parse(cached) as Profile;
        if (cachedProfile.id === user.id) setProfile(cachedProfile);
      }
    } catch {
      localStorage.removeItem(key);
    }

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    const nextProfile = data || profileFromAuth(user);
    setProfile(nextProfile);
    localStorage.setItem(key, JSON.stringify(nextProfile));
  }, []);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      if (!active) return;
      await loadProfile();
    };
    const handleFocus = () => void refresh();

    void refresh();
    window.addEventListener("focus", handleFocus);
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION") return;
      if (!session?.user) {
        if (currentUserId.current) localStorage.removeItem(`${cacheKey}${currentUserId.current}`);
        currentUserId.current = null;
        setProfile(null);
        return;
      }
      queueMicrotask(() => {
        if (active) void loadProfile(session.user.id);
      });
    });

    return () => {
      active = false;
      window.removeEventListener("focus", handleFocus);
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const refreshProfile = useCallback(() => loadProfile(), [loadProfile]);
  const value = useMemo(() => ({ profile, refreshProfile }), [profile, refreshProfile]);

  return <DashboardProfileContext.Provider value={value}>{children}</DashboardProfileContext.Provider>;
}

export function useDashboardProfileContext() {
  const context = useContext(DashboardProfileContext);
  if (!context) throw new Error("Dashboard profile context is missing its provider.");
  return context;
}
