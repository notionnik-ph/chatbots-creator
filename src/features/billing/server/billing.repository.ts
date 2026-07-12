import { supabaseAdmin } from "@/lib/supabase/admin";

import type {
  BillingProfile,
  BillingPlan,
} from "@/features/billing/types/billing";

console.log("[REPOSITORY] billing.repository.ts loaded");

const TABLE = "user_billing_profiles";

function mapBillingProfile(row: {
  user_id: string;
  plan: BillingPlan;
  bot_limit: number;
  monthly_token_limit: number;
  billing_period_start: string;
  billing_period_end: string;
}): BillingProfile {
  return {
    userId: row.user_id,
    plan: row.plan,
    botLimit: row.bot_limit,
    monthlyTokenLimit: row.monthly_token_limit,
    billingPeriodStart: row.billing_period_start,
    billingPeriodEnd: row.billing_period_end,
  };
}

export async function getBillingProfile(
  userId: string,
): Promise<BillingProfile | null> {
  console.log("[REPOSITORY] getBillingProfile called:", { userId });

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select(
      `
      user_id,
      plan,
      bot_limit,
      monthly_token_limit,
      billing_period_start,
      billing_period_end
    `,
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[REPOSITORY] getBillingProfile failed:", error);
    throw new Error(error.message);
  }

  return data ? mapBillingProfile(data) : null;
}

export async function createDefaultBillingProfile(
  userId: string,
): Promise<BillingProfile> {
  console.log("[REPOSITORY] createDefaultBillingProfile called:", {
    userId,
  });

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .insert({
      user_id: userId,
      plan: "free",
      bot_limit: 1,
      monthly_token_limit: 100000,
    })
    .select(
      `
      user_id,
      plan,
      bot_limit,
      monthly_token_limit,
      billing_period_start,
      billing_period_end
    `,
    )
    .single();

  if (error) {
    console.error("[REPOSITORY] createDefaultBillingProfile failed:", error);
    throw new Error(error.message);
  }

  return mapBillingProfile(data);
}

export async function getTokenUsageForPeriod(input: {
  userId: string;
  periodStart: string;
  periodEnd: string;
}) {
  console.log("[REPOSITORY] getTokenUsageForPeriod called:", input);

  const { data, error } = await supabaseAdmin
    .from("conversation_logs")
    .select("tokens_used")
    .eq("user_id", input.userId)
    .gte("created_at", input.periodStart)
    .lt("created_at", input.periodEnd);

  if (error) {
    console.error("[REPOSITORY] getTokenUsageForPeriod failed:", error);
    throw new Error(error.message);
  }

  const total = (data ?? []).reduce(
    (sum, row) => sum + Number(row.tokens_used ?? 0),
    0,
  );

  console.log("[REPOSITORY] getTokenUsageForPeriod total:", {
    userId: input.userId,
    total,
  });

  return total;
}