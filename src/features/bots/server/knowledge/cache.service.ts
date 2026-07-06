/**
 * Conversation logs are now preserved as history.
 *
 * Old answers are prevented from being reused because every cached answer
 * is checked against the current knowledge_hash.
 */
export async function invalidateBotKnowledgeCache(botRef: string) {
  console.log(
    "[SERVICE] invalidateBotKnowledgeCache skipped physical deletion:",
    {
      botRef,
      reason: "knowledge_hash handles cache invalidation",
    },
  );
}