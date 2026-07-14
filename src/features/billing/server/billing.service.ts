import type { BillingSummary } from "@/features/billing/types/billing";

import {
  createDefaultBillingProfile,
  getBillingProfile,
  getTokenUsageForPeriod,
} from "./billing.repository";

import {
  countActiveBotsByOwner,
  countBotsByOwner,
  countOtherActiveBotsByOwner,
  pauseOlderActiveBotsForOwner,
} from "@/features/bots/server/bot.repository";

console.log("[SERVICE] billing.service.ts loaded");

export class BillingLimitError extends Error {
  code: string;
  status: number;

  constructor(message: string, code = "BILLING_LIMIT_REACHED") {
    super(message);
    this.name = "BillingLimitError";
    this.code = code;
    this.status = 403;
  }
}

export async function getOrCreateBillingProfile(userId: string) {
  const existing = await getBillingProfile(userId);

  if (existing) {
    return existing;
  }

  return createDefaultBillingProfile(userId);
}

export async function getBillingSummary(
  userId: string,
): Promise<BillingSummary> {
  console.log("[SERVICE] getBillingSummary called:", { userId });

  const profile = await getOrCreateBillingProfile(userId);

  const [activeBotCount, createdBotCount, monthlyTokensUsed] =
    await Promise.all([
      countActiveBotsByOwner(userId),
      countBotsByOwner(userId),
      getTokenUsageForPeriod({
        userId,
        periodStart: profile.billingPeriodStart,
        periodEnd: profile.billingPeriodEnd,
      }),
    ]);

  const monthlyTokensRemaining = Math.max(
    profile.monthlyTokenLimit - monthlyTokensUsed,
    0,
  );

  return {
    profile,
    activeBotCount,
    createdBotCount,
    monthlyTokensUsed,
    monthlyTokensRemaining,
    botLimitReached: activeBotCount >= profile.botLimit,
    botCreationLimitReached:
      profile.plan !== "paid" && createdBotCount >= profile.botLimit,
    tokenLimitReached: monthlyTokensUsed >= profile.monthlyTokenLimit,
  };
}

export async function enforceActiveBotLimit(input: {
  ownerId: string;
  keepBotRef: string;
}) {
  console.log("[SERVICE] enforceActiveBotLimit called:", input);

  const profile = await getOrCreateBillingProfile(input.ownerId);

  if (profile.botLimit <= 1) {
    const result = await pauseOlderActiveBotsForOwner({
      ownerId: input.ownerId,
      keepBotRef: input.keepBotRef,
    });

    console.log("[SERVICE] enforceActiveBotLimit paused older bots:", result);

    return {
      enforced: true,
      botLimit: profile.botLimit,
      pausedCount: result.pausedCount,
    };
  }

  const activeBotCount = await countActiveBotsByOwner(input.ownerId);

  if (activeBotCount <= profile.botLimit) {
    return {
      enforced: false,
      botLimit: profile.botLimit,
      pausedCount: 0,
    };
  }

  const result = await pauseOlderActiveBotsForOwner({
    ownerId: input.ownerId,
    keepBotRef: input.keepBotRef,
  });

  return {
    enforced: true,
    botLimit: profile.botLimit,
    pausedCount: result.pausedCount,
  };
}

export async function canOwnerUseAiTokens(ownerId: string) {
  console.log("[SERVICE] canOwnerUseAiTokens called:", { ownerId });

  const summary = await getBillingSummary(ownerId);

  return {
    allowed: !summary.tokenLimitReached,
    summary,
  };
}

export async function assertCanCreateBot(ownerId: string) {
  console.log("[SERVICE] assertCanCreateBot called:", { ownerId });

  const profile = await getOrCreateBillingProfile(ownerId);

  if (profile.plan === "paid") {
    return {
      allowed: true,
      profile,
    };
  }

  const botCount = await countBotsByOwner(ownerId);

  if (botCount >= profile.botLimit) {
    throw new BillingLimitError(
      "Free plan allows only 1 chatbot. Upgrade to create more bots.",
      "BOT_LIMIT_REACHED",
    );
  }

  return {
    allowed: true,
    profile,
  };
}

export async function assertCanActivateBot(input: {
  ownerId: string;
  botRef: string;
}) {
  console.log("[SERVICE] assertCanActivateBot called:", input);

  const profile = await getOrCreateBillingProfile(input.ownerId);

  if (profile.plan === "paid") {
    return {
      allowed: true,
      profile,
    };
  }

  const otherActiveBotCount = await countOtherActiveBotsByOwner({
    ownerId: input.ownerId,
    botRef: input.botRef,
  });

  if (otherActiveBotCount >= profile.botLimit) {
    throw new BillingLimitError(
      "Free plan allows only 1 active chatbot. Pause your current active bot or upgrade to activate another.",
      "ACTIVE_BOT_LIMIT_REACHED",
    );
  }

  return {
    allowed: true,
    profile,
  };
}