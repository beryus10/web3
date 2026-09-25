"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signOutAdmin() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/console/admin/login");
}

async function requireAdmin() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Authentication required");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Admin access required");
  return supabase;
}

export async function adjustUserBalance(formData: FormData) {
  const supabase = await requireAdmin();
  const targetUserId = String(formData.get("user_id") || "");
  const amountDelta = Number(formData.get("amount_delta"));
  const note = String(formData.get("note") || "Admin balance adjustment");

  if (!targetUserId || !Number.isFinite(amountDelta) || amountDelta === 0) {
    throw new Error("A valid user and non-zero amount are required");
  }

  const { error } = await supabase.rpc("adjust_user_balance", {
    target_user_id: targetUserId,
    amount_delta: amountDelta,
    note,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/console/admin");
  revalidatePath("/dashboard");
}

export async function approveDeposit(formData: FormData) {
  const supabase = await requireAdmin();
  const requestId = String(formData.get("request_id") || "");
  if (!requestId) throw new Error("Deposit request is required");

  const { error } = await supabase.rpc("approve_deposit", { request_id: requestId });
  if (error) throw new Error(error.message);

  revalidatePath("/console/admin");
  revalidatePath("/dashboard");
}

export async function reviewWithdrawal(formData: FormData) {
  const supabase = await requireAdmin();
  const requestId = String(formData.get("request_id") || "");
  const decision = String(formData.get("decision") || "");
  if (!requestId || !["approved", "rejected"].includes(decision)) {
    throw new Error("A valid withdrawal decision is required");
  }

  const { error } = await supabase.rpc("review_withdrawal", {
    request_id: requestId,
    decision,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/console/admin/withdrawals");
  revalidatePath("/console/admin/users");
  revalidatePath("/dashboard");
}
