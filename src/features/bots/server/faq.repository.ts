import { supabaseAdmin } from "@/lib/supabase/admin";
import type { GeneratedFaqCandidate } from "@/features/bots/types/generated-faq";

const TABLE = "bot_generated_faqs";

export async function findActiveGeneratedFaq(
  botId: string,
  knowledgeHash: string,
  normalizedQuestion: string,
) {
  const { data, error } = await supabaseAdmin
    .from("bot_generated_faqs")
    .select("id, answer")
    .eq("bot_id", botId)
    .eq("knowledge_hash", knowledgeHash)
    .eq("normalized_question", normalizedQuestion)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function saveGeneratedFaqs(
  botId: string,
  knowledgeHash: string,
  faqs: Array<{
    question: string;
    answer: string;
    normalizedQuestion: string;
    sourceChunkIds: string[];
  }>,
) {
  console.log("[REPOSITORY] saveGeneratedFaqs called:", {
    botId,
    count: faqs.length,
  });

  const { error: deactivateError } = await supabaseAdmin
    .from("bot_generated_faqs")
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("bot_id", botId)
    .eq("is_active", true);

  if (deactivateError) {
    throw new Error(deactivateError.message);
  }

  const rows = faqs.map((faq) => ({
    bot_id: botId,
    knowledge_hash: knowledgeHash,
    question: faq.question,
    normalized_question: faq.normalizedQuestion,
    answer: faq.answer,
    source_chunk_ids: faq.sourceChunkIds,
    generation_method: "gemini",
    is_active: true,
    updated_at: new Date().toISOString(),
  }));

  const { error: upsertError } = await supabaseAdmin
    .from("bot_generated_faqs")
    .upsert(rows, {
      onConflict: "bot_id,knowledge_hash,normalized_question",
    });

  if (upsertError) {
    throw new Error(upsertError.message);
  }

  console.log("[REPOSITORY] saveGeneratedFaqs completed:", {
    botId,
    count: rows.length,
  });
}