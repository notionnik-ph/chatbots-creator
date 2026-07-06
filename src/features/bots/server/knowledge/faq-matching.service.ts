import { findActiveGeneratedFaq } from "@/features/bots/server/faq.repository";

console.log("[SERVICE] faq-matching.service.ts loaded");

export async function findGeneratedFaqReply(
  botId: string,
  knowledgeHash: string,
  normalizedQuestion: string,
) {
  console.log("[SERVICE] findGeneratedFaqReply called:", {
    botId,
    knowledgeHash,
    normalizedQuestion,
  });

  return findActiveGeneratedFaq(
    botId,
    knowledgeHash,
    normalizedQuestion,
  );
}