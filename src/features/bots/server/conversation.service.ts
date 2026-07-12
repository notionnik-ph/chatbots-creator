import type { ChatMessage } from "@/features/bots/types/conversation";

import { generateGroqReply } from "./ai/groq.service";
import {
  findCachedReply,
  insertConversationLog,
  listConversationsForBot,
} from "./conversation.repository";
import { getActiveBotForPublicChat } from "./public-bot.service";

import { findGeneratedFaqReply } from "./knowledge/faq-matching.service";
import {
  findKnowledgeChunkCandidates,
  getSelectedKnowledgeChunks,
} from "./knowledge/knowledge-chunk-index.repository";
import { buildSelectedKnowledgeContext } from "./knowledge/knowledge-context-resolver.service";
import { getKnowledgeHash } from "./knowledge/knowledge-version.service";
import { routeQuestionToKnowledgeChunks } from "./knowledge/knowledge-router.service";

import { normalizeQuestion } from "./question-normalizer";
import { syncOriginalChunksForBot } from "./knowledge/knowledge-chunk-index.service";
import { canOwnerUseAiTokens } from "@/features/billing/server/billing.service";

console.log("[SERVICE] conversation.service.ts loaded");

function normalizeMessage(message: string) {
  console.log("[SERVICE] normalizeMessage input:", { message });

  const normalized = normalizeQuestion(message);

  console.log("[SERVICE] normalizeMessage output:", { normalized });

  return normalized;
}

function buildOutOfScopeReply(botName: string) {
  return `I can help with questions related to ${botName}, its services, programs, and published information. I do not have enough relevant information to answer that question.`;
}

export async function replyToPublicMessage(
  botRef: string,
  message: string,
  history: ChatMessage[],
) {
  console.log("[SERVICE] replyToPublicMessage called with:", {
    botRef,
    message,
    historyLength: history.length,
  });

  console.log(
    "[SERVICE] fetchActiveBotForPublicChat called with botRef:",
    botRef,
  );

  const bot = await getActiveBotForPublicChat(botRef);

  if (!bot) {
    console.log(
      "[SERVICE] replyToPublicMessage bot not found or not active for botRef:",
      botRef,
    );

    return { kind: "not_found" as const };
  }

  console.log("[SERVICE] replyToPublicMessage bot found:", {
    botId: bot.id,
    botName: bot.bot_name,
  });

  const normalized = normalizeMessage(message);
  const knowledgeHash = getKnowledgeHash(bot.knowledge_base);

  /*
   * PRIORITY 1:
   * Generated FAQ exact match.
   * No Groq call needed.
   */
  console.log(
    "[SERVICE] replyToPublicMessage checking generated FAQ database first",
  );

  const generatedFaq = await findGeneratedFaqReply(
    bot.id,
    knowledgeHash,
    normalized,
  ).catch((error) => {
    console.error(
      "[SERVICE] replyToPublicMessage generated FAQ lookup failed:",
      error,
    );

    return null;
  });

  if (generatedFaq) {
    console.log(
      "[SERVICE] replyToPublicMessage generated FAQ HIT:",
      generatedFaq.id,
    );

    return {
      kind: "success" as const,
      reply: generatedFaq.answer,
      cached: true,
    };
  }

  console.log("[SERVICE] replyToPublicMessage generated FAQ MISS");

  /*
   * PRIORITY 2:
   * Exact duplicate saved conversation answer.
   * No Groq call needed.
   */
  console.log("[SERVICE] replyToPublicMessage normalized message:", normalized);

  console.log(
    "[SERVICE] replyToPublicMessage checking cache for botRef:",
    botRef,
    "normalized:",
    normalized,
  );

  const cached = await findCachedReply(botRef, normalized, knowledgeHash).catch(
    (error) => {
      console.error(
        "[SERVICE] replyToPublicMessage conversation cache lookup failed:",
        error,
      );

      return null;
    },
  );

  if (cached) {
    console.log("[SERVICE] replyToPublicMessage cache HIT for botRef:", botRef);

    return {
      kind: "success" as const,
      reply: cached,
      cached: true,
    };
  }

  console.log("[SERVICE] replyToPublicMessage cache MISS for botRef:", botRef);

  const tokenGate = await canOwnerUseAiTokens(bot.owner_id).catch((error) => {
    console.error(
      "[SERVICE] replyToPublicMessage token usage check failed:",
      error,
    );

    return null;
  });

  if (tokenGate && !tokenGate.allowed) {
    console.warn("[SERVICE] replyToPublicMessage token limit reached:", {
      ownerId: bot.owner_id,
      monthlyTokensUsed: tokenGate.summary.monthlyTokensUsed,
      monthlyTokenLimit: tokenGate.summary.profile.monthlyTokenLimit,
    });

    return {
      kind: "success" as const,
      reply:
        "This chatbot has reached its monthly token limit. Please contact the site owner or try again after the billing period resets.",
      cached: false,
    };
  }

  /*
   * PRIORITY 3:
   * Database prefilter.
   *
   * This checks indexed metadata from the original kb_chunks and returns
   * only the best 12 possible chunks. It does NOT send all KB content.
   */
  console.log(
    "[SERVICE] replyToPublicMessage finding original chunk candidates...",
  );

  let candidates = await findKnowledgeChunkCandidates({
    botId: bot.id,
    knowledgeHash,
    question: message,
    limit: 12,
  }).catch((error) => {
    console.error(
      "[SERVICE] replyToPublicMessage knowledge candidate lookup failed:",
      error,
    );

    return [];
  });

  /*
   * Self-healing for bots created before the new searchable-index feature.
   * It uses the SAME existing original kb_chunks.
   * It does not remove, replace, or re-chunk your knowledge base.
   */
  if (!candidates.length) {
    console.warn(
      "[SERVICE] replyToPublicMessage no indexed candidates; attempting automatic original chunk index rebuild",
    );

    const serializedKbChunks = JSON.stringify(bot.kb_chunks ?? null) ?? "";

    console.log("[SERVICE] replyToPublicMessage index repair source check:", {
      botId: bot.id,
      kbChunksType: Array.isArray(bot.kb_chunks)
        ? "array"
        : typeof bot.kb_chunks,
      hasKbChunks: Boolean(bot.kb_chunks),
      kbChunksLength: serializedKbChunks.length,
    });

    const indexRepair = await syncOriginalChunksForBot({
      id: bot.id,
      knowledge_base: bot.knowledge_base,
      kb_chunks: bot.kb_chunks,
    }).catch((error) => {
      console.error(
        "[SERVICE] replyToPublicMessage automatic index rebuild failed:",
        error,
      );

      return null;
    });

    console.log(
      "[SERVICE] replyToPublicMessage automatic index rebuild result:",
      indexRepair,
    );

    if (indexRepair?.indexed) {
      candidates = await findKnowledgeChunkCandidates({
        botId: bot.id,
        knowledgeHash,
        question: message,
        limit: 12,
      }).catch((error) => {
        console.error(
          "[SERVICE] replyToPublicMessage candidate retry after index rebuild failed:",
          error,
        );

        return [];
      });
    }
  }

  console.log(
    "[SERVICE] replyToPublicMessage knowledge candidate prefilter complete:",
    {
      candidateCount: candidates.length,
      candidates: candidates.map((candidate) => ({
        chunkId: candidate.chunkId,
        path: candidate.path,
        label: candidate.label,
        score: candidate.score,
      })),
    },
  );

  if (!candidates.length) {
    console.log(
      "[SERVICE] replyToPublicMessage no relevant indexed chunks found",
    );

    return {
      kind: "success" as const,
      reply: buildOutOfScopeReply(bot.bot_name),
      cached: false,
    };
  }

  /*
   * PRIORITY 4:
   * Groq Identifier receives only the small candidate catalog:
   * chunk ID + path + label + short preview.
   *
   * It selects 1–5 original chunk IDs.
   */
  console.log(
    "[SERVICE] replyToPublicMessage routing question to selected original chunks...",
  );

  const routeDecision = await routeQuestionToKnowledgeChunks({
    question: message,
    candidates,
  }).catch((error) => {
    console.error(
      "[SERVICE] replyToPublicMessage knowledge router failed:",
      error,
    );

    return {
      relevant: false,
      selectedChunkIds: [],
      needsClarification: false,
      clarificationQuestion: undefined,
    };
  });

  console.log(
    "[SERVICE] replyToPublicMessage knowledge router decision:",
    routeDecision,
  );

  if (!routeDecision.relevant || !routeDecision.selectedChunkIds.length) {
    console.log(
      "[SERVICE] replyToPublicMessage router found no relevant selected chunks",
    );

    return {
      kind: "success" as const,
      reply:
        routeDecision.clarificationQuestion?.trim() ||
        buildOutOfScopeReply(bot.bot_name),
      cached: false,
    };
  }

  /*
   * Fetch only the full content of selected ORIGINAL kb_chunks.
   */
  console.log(
    "[SERVICE] replyToPublicMessage loading selected original chunks...",
  );

  const selectedChunks = await getSelectedKnowledgeChunks({
    botId: bot.id,
    knowledgeHash,
    chunkIds: routeDecision.selectedChunkIds,
  }).catch((error) => {
    console.error(
      "[SERVICE] replyToPublicMessage selected chunk lookup failed:",
      error,
    );

    return [];
  });

  console.log(
    "[SERVICE] replyToPublicMessage selected original chunks loaded:",
    {
      selectedCount: selectedChunks.length,
      selectedChunks: selectedChunks.map((chunk) => ({
        chunkId: chunk.chunkId,
        path: chunk.path,
        label: chunk.label,
        contentLength: chunk.content.length,
      })),
    },
  );

  const knowledgeContext = buildSelectedKnowledgeContext(selectedChunks);

  if (!knowledgeContext.trim()) {
    console.log(
      "[SERVICE] replyToPublicMessage selected knowledge context was empty",
    );

    return {
      kind: "success" as const,
      reply: buildOutOfScopeReply(bot.bot_name),
      cached: false,
    };
  }

  /*
   * FINAL:
   * Groq receives only selected original chunks and the latest 4 messages.
   * No more buildKnowledgeContext(bot.kb_chunks, bot.knowledge_base).
   */
  console.log("[SERVICE] replyToPublicMessage generating Groq reply...", {
    selectedKnowledgeContextLength: knowledgeContext.length,
    originalHistoryLength: history.length,
    sentHistoryLength: history.slice(-4).length,
  });

  const generated = await generateGroqReply({
    botName: bot.bot_name,
    websiteUrl: bot.website_url ?? "",
    knowledgeContext,
    history: history.slice(-4),
    message,
  });

  console.log("[SERVICE] replyToPublicMessage Groq reply generated:", {
    replyLength: generated.reply.length,
    tokensUsed: generated.tokensUsed,
  });

  console.log("[SERVICE] replyToPublicMessage inserting conversation log...");

  void insertConversationLog({
    bot_id: bot.id,
    bot_ref_id: bot.ref_id,
    user_id: bot.owner_id,
    user_message: message,
    normalized_message: normalized,
    knowledge_hash: knowledgeHash,
    bot_response: generated.reply,
    tokens_used: generated.tokensUsed,
  }).catch((error) => {
    console.error(
      "[SERVICE] replyToPublicMessage error logging conversation:",
      error,
    );
  });

  console.log("[SERVICE] replyToPublicMessage returning success response");

  return {
    kind: "success" as const,
    reply: generated.reply,
    cached: false,
  };
}

export async function getOwnerConversations(botId: string) {
  console.log("[SERVICE] getOwnerConversations called with botId:", botId);

  const conversations = await listConversationsForBot(botId);

  console.log("[SERVICE] getOwnerConversations found", {
    count: conversations.length,
  });

  return conversations;
}
