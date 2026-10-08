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

export async function updateUserFinancials(formData: FormData) {
  const supabase = await requireAdmin();
  const userId = String(formData.get("user_id") || "");
  const balance = Number(formData.get("balance"));
  const activeInvestment = Number(formData.get("active_investment"));
  const profitToday = Number(formData.get("profit_today"));

  if (!userId || !Number.isFinite(balance) || balance < 0 || !Number.isFinite(activeInvestment) || activeInvestment < 0 || !Number.isFinite(profitToday) || profitToday < 0) {
    throw new Error("Enter valid non-negative balance, investment, and profit values");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ balance, active_investment: activeInvestment, profit_today: profitToday })
    .eq("id", userId)
    .eq("role", "user");
  if (error) throw new Error(error.message);

  revalidatePath(`/console/admin/users/${userId}`);
  revalidatePath("/console/admin/users");
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
  revalidatePath("/console/admin/deposits");
  revalidatePath("/dashboard");
}

export async function rejectDeposit(formData: FormData) {
  const supabase = await requireAdmin();
  const requestId = String(formData.get("request_id") || "");
  if (!requestId) throw new Error("Deposit request is required");

  const { error } = await supabase.rpc("reject_deposit", { request_id: requestId });
  if (error) {
    // If the reject_deposit RPC function has not been created yet in the database, update directly
    const { error: directError } = await supabase
      .from("deposit_requests")
      .update({ status: "rejected", reviewed_at: new Date().toISOString() })
      .eq("id", requestId)
      .eq("status", "pending");

    if (directError) {
      throw new Error(directError.message || error.message);
    }
  }

  revalidatePath("/console/admin");
  revalidatePath("/console/admin/deposits");
  revalidatePath("/dashboard");
}

export async function reviewWithdrawal(formData: FormData) {
  const supabase = await requireAdmin();
  const requestId = String(formData.get("request_id") || "");
  const decisionValue = formData.get("decision");
  if (!requestId || (decisionValue !== "approved" && decisionValue !== "rejected")) {
    throw new Error("A valid withdrawal decision is required");
  }
  const decision: "approved" | "rejected" = decisionValue;

  const { error } = await supabase.rpc("review_withdrawal", {
    request_id: requestId,
    decision,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/console/admin/withdrawals");
  revalidatePath("/console/admin/users");
  revalidatePath("/dashboard");
}
