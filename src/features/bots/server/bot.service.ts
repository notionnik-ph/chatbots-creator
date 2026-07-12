import { mapBotRow } from "@/features/bots/mappers/bot.mapper";
import type { BotPatchInput } from "@/features/bots/schemas/bot.schema";
import type { BotFormData } from "@/features/bots/types/bot-config";

import * as repository from "./bot.repository";

import { invalidateBotKnowledgeCache } from "./knowledge/cache.service";
import { chunkBotKnowledge } from "./knowledge/chunker.service";
import { generateGeneratedFaqsForBot } from "./knowledge/faq-generation.service";
import { syncOriginalChunksForBot } from "./knowledge/knowledge-chunk-index.service";
import { enforceActiveBotLimit } from "@/features/billing/server/billing.service";
import {
  assertCanActivateBot,
  assertCanCreateBot,
} from "@/features/billing/server/billing.service";

console.log("[SERVICE] bot.service.ts loaded");

function botRef() {
  const ref = crypto.randomUUID().replace(/-/g, "").slice(0, 12);

  console.log("[SERVICE] botRef generated:", ref);

  return ref;
}

function createPayload(ownerId: string, input: BotFormData) {
  console.log("[SERVICE] createPayload called with:", {
    ownerId,
    input,
  });

  const payload = {
    ref_id: botRef(),
    owner_id: ownerId,
    bot_name: input.name,
    description: input.description,
    knowledge_base: input.knowledgeBase,
    welcome_message: input.welcomeMessage,
    primary_color: input.primaryColor,
    text_color: input.textColor,
    bg_color: input.bgColor,
    user_msg_color: input.userMsgColor,
    bot_msg_color: input.botMsgColor,
    icon_url: input.iconUrl,
    position: input.position,
    website_url: input.websiteUrl,
    webhook_url: input.webhookUrl ?? "",
    status: "active",
  };

  console.log("[SERVICE] createPayload result:", payload);

  return payload;
}

function patchPayload(input: BotPatchInput) {
  console.log("[SERVICE] patchPayload called with:", input);

  const output: Record<string, unknown> = {};

  const fields: Array<[keyof BotPatchInput, string]> = [
    ["name", "bot_name"],
    ["description", "description"],
    ["knowledgeBase", "knowledge_base"],
    ["welcomeMessage", "welcome_message"],
    ["primaryColor", "primary_color"],
    ["textColor", "text_color"],
    ["bgColor", "bg_color"],
    ["userMsgColor", "user_msg_color"],
    ["botMsgColor", "bot_msg_color"],
    ["iconUrl", "icon_url"],
    ["position", "position"],
    ["websiteUrl", "website_url"],
    ["webhookUrl", "webhook_url"],
    ["status", "status"],
  ];

  for (const [source, destination] of fields) {
    if (input[source] !== undefined) {
      output[destination] = input[source];
    }
  }

  console.log("[SERVICE] patchPayload result:", output);

  return output;
}

/**
 * IMPORTANT:
 * chunkBotKnowledge() updates kb_chunks in Supabase.
 * The original row object is stale after chunking, so we reload the bot
 * before creating the searchable chunk index and generating FAQs.
 *
 * This does NOT remove or change existing kb_chunks logic.
 */
async function runPostChunkingTasks(input: {
  botRef: string;
  ownerId: string;
  fallbackRow: Awaited<ReturnType<typeof repository.findBotForOwner>>;
}) {
  console.log("[SERVICE] runPostChunkingTasks started:", {
    botRef: input.botRef,
    ownerId: input.ownerId,
  });

  const latestBot =
    (await repository.findBotForOwner(input.botRef, input.ownerId)) ??
    input.fallbackRow;

  if (!latestBot) {
    console.error(
      "[SERVICE] runPostChunkingTasks failed: latest bot could not be loaded",
    );

    return {
      knowledgeIndex: undefined,
      faqGeneration: undefined,
    };
  }

  console.log("[SERVICE] runPostChunkingTasks latest bot loaded:", {
    botId: latestBot.id,
    refId: latestBot.ref_id,
    knowledgeBaseLength: latestBot.knowledge_base?.length ?? 0,
    hasKbChunks: Boolean(latestBot.kb_chunks),
  });

  let knowledgeIndex:
    | {
        indexed: boolean;
        count: number;
        knowledgeHash?: string;
        reason?: string;
      }
    | undefined;

  let faqGeneration:
    | {
        generated: boolean;
        count: number;
        batchCount?: number;
        knowledgeHash?: string;
        reason?: string;
      }
    | undefined;

  /*
   * Build the searchable database index from the same original kb_chunks
   * created by your existing chunker.
   */
  try {
    knowledgeIndex = await syncOriginalChunksForBot(latestBot);

    console.log("[SERVICE] Bot knowledge search index result:", {
      knowledgeIndex,
    });
  } catch (error) {
    console.error(
      "[SERVICE] runPostChunkingTasks knowledge index creation failed:",
      error,
    );

    knowledgeIndex = {
      indexed: false,
      count: 0,
      reason:
        error instanceof Error
          ? error.message
          : "Knowledge chunk index creation failed",
    };
  }

  /*
   * Keep your FAQ generation logic.
   * It can use the newest full knowledge base from latestBot.
   */
  try {
    faqGeneration = await generateGeneratedFaqsForBot(latestBot);

    console.log("[SERVICE] runPostChunkingTasks FAQ generation result:", {
      faqGeneration,
    });
  } catch (error) {
    console.error(
      "[SERVICE] runPostChunkingTasks FAQ generation failed:",
      error,
    );

    faqGeneration = {
      generated: false,
      count: 0,
      reason: error instanceof Error ? error.message : "FAQ generation failed",
    };
  }

  return {
    knowledgeIndex,
    faqGeneration,
  };
}

export async function listBotsForOwner(ownerId: string) {
  console.log("[SERVICE] listBotsForOwner called with ownerId:", ownerId);

  const bots = await repository.listBotsByOwner(ownerId);

  console.log("[SERVICE] listBotsForOwner found", {
    count: bots.length,
  });

  const result = bots.map(mapBotRow);

  console.log("[SERVICE] listBotsForOwner returning", {
    count: result.length,
  });

  return result;
}

export async function getBotForOwner(botRef: string, ownerId: string) {
  console.log("[SERVICE] getBotForOwner called with:", {
    botRef,
    ownerId,
  });

  const row = await repository.findBotForOwner(botRef, ownerId);

  console.log(
    "[SERVICE] getBotForOwner repository result:",
    row ? "found" : "not found",
  );

  const result = row ? mapBotRow(row) : null;

  console.log(
    "[SERVICE] getBotForOwner returning:",
    result ? "bot found" : "null",
  );

  return result;
}

export async function createBotForOwner(ownerId: string, input: BotFormData) {
  console.log("[SERVICE] createBotForOwner called with:", {
    ownerId,
    input,
  });
  await assertCanCreateBot(ownerId);

  const row = await repository.createBotRow(createPayload(ownerId, input));

  console.log("[SERVICE] createBotForOwner bot created in DB:", {
    botId: row.id,
    refId: row.ref_id,
  });

  const activeBotLimit = await enforceActiveBotLimit({
    ownerId,
    keepBotRef: row.ref_id,
  });

  console.log("[SERVICE] createBotForOwner active bot limit result:", {
    activeBotLimit,
  });

  let chunking: {
    chunked: boolean;
    reason?: string;
    categories?: string[];
    totalLeaves?: number;
  } = {
    chunked: false,
  };

  let knowledgeIndex:
    | {
        indexed: boolean;
        count: number;
        knowledgeHash?: string;
        reason?: string;
      }
    | undefined;

  let faqGeneration:
    | {
        generated: boolean;
        count: number;
        batchCount?: number;
        knowledgeHash?: string;
        reason?: string;
      }
    | undefined;

  if (row.knowledge_base?.trim()) {
    console.log("[SERVICE] createBotForOwner starting knowledge chunking...");

    try {
      chunking = await chunkBotKnowledge(row);

      console.log("[SERVICE] createBotForOwner chunking result:", chunking);

      if (chunking.chunked) {
        const postChunking = await runPostChunkingTasks({
          botRef: row.ref_id,
          ownerId,
          fallbackRow: row,
        });

        knowledgeIndex = postChunking.knowledgeIndex;
        faqGeneration = postChunking.faqGeneration;
      }
    } catch (error) {
      chunking = {
        chunked: false,
        reason: error instanceof Error ? error.message : "Chunking failed",
      };

      console.error(
        "[SERVICE] createBotForOwner chunking or post-chunking tasks failed:",
        chunking.reason,
      );
    }
  }

  const latest = (await repository.findBotForOwner(row.ref_id, ownerId)) ?? row;

  return {
    bot: mapBotRow(latest),
    chunking,
    knowledgeIndex,
    faqGeneration,
    activeBotLimit,
  };
}

export async function updateBotForOwner(
  botRef: string,
  ownerId: string,
  input: BotPatchInput,
) {
  console.log("[SERVICE] updateBotForOwner called with:", {
    botRef,
    ownerId,
    input,
  });

  if (input.status === "active") {
    await assertCanActivateBot({
      ownerId,
      botRef,
    });
  }

  const row = await repository.updateBotForOwner(
    botRef,
    ownerId,
    patchPayload(input),
  );

  console.log(
    "[SERVICE] updateBotForOwner update result:",
    row ? "updated" : "not found",
  );

  if (!row) {
    return null;
  }

  let chunking:
    | {
        chunked: boolean;
        reason?: string;
        categories?: string[];
        totalLeaves?: number;
      }
    | undefined;

  let knowledgeIndex:
    | {
        indexed: boolean;
        count: number;
        knowledgeHash?: string;
        reason?: string;
      }
    | undefined;

  let faqGeneration:
    | {
        generated: boolean;
        count: number;
        batchCount?: number;
        knowledgeHash?: string;
        reason?: string;
      }
    | undefined;

  if (input.knowledgeBase !== undefined) {
    console.log(
      "[SERVICE] updateBotForOwner knowledge base updated, starting chunking...",
    );

    try {
      chunking = await chunkBotKnowledge(row);

      console.log("[SERVICE] updateBotForOwner chunking result:", chunking);

      await invalidateBotKnowledgeCache(botRef);

      if (chunking.chunked) {
        const postChunking = await runPostChunkingTasks({
          botRef,
          ownerId,
          fallbackRow: row,
        });

        knowledgeIndex = postChunking.knowledgeIndex;
        faqGeneration = postChunking.faqGeneration;
      }

      console.log(
        "[SERVICE] updateBotForOwner chunking, indexing, and FAQ generation complete:",
        {
          chunking,
          knowledgeIndex,
          faqGeneration,
        },
      );
    } catch (error) {
      chunking = {
        chunked: false,
        reason: error instanceof Error ? error.message : "Chunking failed",
      };

      console.error(
        "[SERVICE] updateBotForOwner chunking or post-chunking tasks failed:",
        chunking.reason,
      );
    }
  }

  const latest = (await repository.findBotForOwner(botRef, ownerId)) ?? row;

  return {
    bot: mapBotRow(latest),
    chunking,
    knowledgeIndex,
    faqGeneration,
  };
}

export async function deleteBotForOwner(botRef: string, ownerId: string) {
  console.log("[SERVICE] deleteBotForOwner called with:", {
    botRef,
    ownerId,
  });

  const result = await repository.deleteBotForOwner(botRef, ownerId);

  console.log(
    "[SERVICE] deleteBotForOwner result:",
    result ? "deleted" : "not found/deletion failed",
  );

  return result;
}

export async function chunkKnowledgeForOwner(botRef: string, ownerId: string) {
  console.log("[SERVICE] chunkKnowledgeForOwner called with:", {
    botRef,
    ownerId,
  });

  const row = await repository.findBotForOwner(botRef, ownerId);

  console.log(
    "[SERVICE] chunkKnowledgeForOwner bot found:",
    row ? "yes" : "no",
  );

  if (!row) {
    return null;
  }

  const chunking = await chunkBotKnowledge(row);

  console.log("[SERVICE] chunkKnowledgeForOwner chunking result:", chunking);

  await invalidateBotKnowledgeCache(botRef);

  let knowledgeIndex:
    | {
        indexed: boolean;
        count: number;
        knowledgeHash?: string;
        reason?: string;
      }
    | undefined;

  let faqGeneration:
    | {
        generated: boolean;
        count: number;
        batchCount?: number;
        knowledgeHash?: string;
        reason?: string;
      }
    | undefined;

  if (chunking.chunked) {
    const postChunking = await runPostChunkingTasks({
      botRef,
      ownerId,
      fallbackRow: row,
    });

    knowledgeIndex = postChunking.knowledgeIndex;
    faqGeneration = postChunking.faqGeneration;
  }

  return {
    ...chunking,
    knowledgeIndex,
    faqGeneration,
  };
}

export async function updateBotStatusAsAdmin(
  botRef: string,
  status: "active" | "paused" | "draft",
) {
  console.log("[SERVICE] updateBotStatusAsAdmin called with:", {
    botRef,
    status,
  });

  const row = await repository.updateBotByRef(botRef, {
    status,
  });

  console.log(
    "[SERVICE] updateBotStatusAsAdmin update result:",
    row ? "updated" : "not found",
  );

  const result = row ? mapBotRow(row) : null;

  console.log(
    "[SERVICE] updateBotStatusAsAdmin returning:",
    result ? "bot found" : "null",
  );

  return result;
}
