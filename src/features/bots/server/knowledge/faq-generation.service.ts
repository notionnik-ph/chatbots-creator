import type { ChatbotRow } from "@/features/bots/types/bot";
import type {
  FaqGenerationResult,
  GeneratedFaqWithSource,
} from "@/features/bots/types/generated-faq";

import { generateGeminiFaqBatch } from "@/features/bots/server/ai/gemini.service";
import { saveGeneratedFaqs } from "@/features/bots/server/faq.repository";
import { normalizeQuestion } from "@/features/bots/server/question-normalizer";

import { getKnowledgeHash } from "./knowledge-version.service";

console.log("[SERVICE] faq-generation.service.ts loaded");

/**
 * This is NOT your saved kb_chunks structure.
 * It only splits the complete knowledge base into safe Gemini request sizes.
 */
const MAX_KNOWLEDGE_CHARS_PER_BATCH = 18_000;

/**
 * Gemini can generate many FAQs per full-KB section.
 * Increase carefully if your Gemini account can handle it.
 */
const FAQS_PER_BATCH = 50;

/**
 * Prevents an extremely large KB from creating unlimited Supabase rows.
 */
const MAX_TOTAL_FAQS = 1_000;

type KnowledgeBatch = {
  id: string;
  content: string;
};

function splitKnowledgeIntoBatches(
  knowledgeBase: string,
  maxCharacters: number,
): KnowledgeBatch[] {
  const source = knowledgeBase.replace(/\r\n/g, "\n").trim();

  if (!source) {
    return [];
  }

  const batches: KnowledgeBatch[] = [];

  let cursor = 0;
  let batchNumber = 1;

  while (cursor < source.length) {
    let end = Math.min(cursor + maxCharacters, source.length);

    /**
     * Try to split on a newline or space instead of cutting a sentence
     * in the middle. If no useful split exists, it safely hard-cuts.
     */
    if (end < source.length) {
      const newlineIndex = source.lastIndexOf("\n", end);
      const spaceIndex = source.lastIndexOf(" ", end);
      const preferredBreak = Math.max(newlineIndex, spaceIndex);

      const minimumUsefulBreak = cursor + Math.floor(maxCharacters * 0.55);

      if (preferredBreak >= minimumUsefulBreak) {
        end = preferredBreak;
      }
    }

    const content = source.slice(cursor, end).trim();

    if (content) {
      batches.push({
        id: `knowledge-batch-${String(batchNumber).padStart(3, "0")}`,
        content,
      });

      batchNumber += 1;
    }

    cursor = end;

    while (cursor < source.length && /\s/.test(source[cursor])) {
      cursor += 1;
    }
  }

  return batches;
}

export async function generateGeneratedFaqsForBot(
  bot: ChatbotRow,
): Promise<FaqGenerationResult> {
  console.log("[SERVICE] generateGeneratedFaqsForBot called:", {
    botId: bot.id,
    botName: bot.bot_name,
    knowledgeBaseLength: bot.knowledge_base?.length ?? 0,
  });

  const knowledgeBase = bot.knowledge_base?.trim() ?? "";

  if (knowledgeBase.length < 80) {
    console.log(
      "[SERVICE] FAQ generation skipped: overall knowledge base is too short",
    );

    return {
      generated: false,
      count: 0,
      reason: "Knowledge base is too short",
    };
  }

  const knowledgeHash = getKnowledgeHash(knowledgeBase);

  /**
   * Uses the ENTIRE raw knowledge_base.
   * Does not use bot.kb_chunks.
   */
  const knowledgeBatches = splitKnowledgeIntoBatches(
    knowledgeBase,
    MAX_KNOWLEDGE_CHARS_PER_BATCH,
  );

  console.log("[SERVICE] FAQ generation plan:", {
    botId: bot.id,
    knowledgeBaseLength: knowledgeBase.length,
    batchCount: knowledgeBatches.length,
    maxCharactersPerBatch: MAX_KNOWLEDGE_CHARS_PER_BATCH,
    faqsPerBatch: FAQS_PER_BATCH,
  });

  const generatedFaqs: GeneratedFaqWithSource[] = [];

  for (const [index, knowledgeBatch] of knowledgeBatches.entries()) {
    console.log("[FAQ] Generating Gemini FAQ batch:", {
      batch: index + 1,
      totalBatches: knowledgeBatches.length,
      batchId: knowledgeBatch.id,
      contentLength: knowledgeBatch.content.length,
    });

    try {
      /**
       * Gemini service already expects chunks.
       * We give it a temporary synthetic batch ID.
       */
      const batchFaqs = await generateGeminiFaqBatch({
        botName: bot.bot_name,
        chunks: [
          {
            id: knowledgeBatch.id,
            content: knowledgeBatch.content,
          },
        ],
        maxFaqs: FAQS_PER_BATCH,
      });

      generatedFaqs.push(...batchFaqs);

      console.log("[FAQ] Gemini FAQ batch complete:", {
        batch: index + 1,
        generatedCount: batchFaqs.length,
      });
    } catch (error) {
      console.error("[FAQ] Gemini FAQ batch failed:", {
        batch: index + 1,
        batchId: knowledgeBatch.id,
        error,
      });
    }
  }

  const uniqueFaqs = new Map<
    string,
    GeneratedFaqWithSource & { normalizedQuestion: string }
  >();

  for (const faq of generatedFaqs) {
    const normalizedQuestion = normalizeQuestion(faq.question);

    if (!normalizedQuestion) {
      continue;
    }

    if (uniqueFaqs.has(normalizedQuestion)) {
      continue;
    }

    uniqueFaqs.set(normalizedQuestion, {
      ...faq,
      normalizedQuestion,
    });

    if (uniqueFaqs.size >= MAX_TOTAL_FAQS) {
      console.log("[SERVICE] FAQ generation reached total FAQ limit:", {
        maxTotalFaqs: MAX_TOTAL_FAQS,
      });

      break;
    }
  }

  const faqs = [...uniqueFaqs.values()];

  if (!faqs.length) {
    console.log("[SERVICE] FAQ generation completed with no valid FAQ rows");

    return {
      generated: false,
      count: 0,
      batchCount: knowledgeBatches.length,
      knowledgeHash,
      reason: "Gemini returned no valid FAQ records",
    };
  }

  await saveGeneratedFaqs(bot.id, knowledgeHash, faqs);

  console.log("[SERVICE] FAQ generation complete:", {
    botId: bot.id,
    generatedFaqCount: faqs.length,
    batchCount: knowledgeBatches.length,
  });

  return {
    generated: true,
    count: faqs.length,
    batchCount: knowledgeBatches.length,
    knowledgeHash,
  };
}