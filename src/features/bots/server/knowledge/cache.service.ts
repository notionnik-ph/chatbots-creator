import { clearConversationCache } from '@/features/bots/server/conversation.repository';

/** Invalidate cached replies when the bot's source knowledge changes. */
export async function invalidateBotKnowledgeCache(botRef: string) {
  await clearConversationCache(botRef);
}
