export type BillingPlan = "free" | "paid";

export interface BillingProfile {
  userId: string;
  plan: BillingPlan;
  botLimit: number;
  monthlyTokenLimit: number;
  billingPeriodStart: string;
  billingPeriodEnd: string;
}

export interface BillingSummary {
  profile: BillingProfile;
  activeBotCount: number;
  createdBotCount: number;
  monthlyTokensUsed: number;
  monthlyTokensRemaining: number;
  botLimitReached: boolean;
  botCreationLimitReached: boolean;
  tokenLimitReached: boolean;
}