import type { ChatMessage } from '@/features/bots/types/conversation';
import { generateGroqReply } from './ai/groq.service';
import { findCachedReply, insertConversationLog, listConversationsForBot } from './conversation.repository';
import { buildKnowledgeContext } from './knowledge/retrieval.service';
import { getActiveBotForPublicChat } from './public-bot.service';

console.log('[SERVICE] conversation.service.ts loaded');

function normalizeMessage(message: string) {
  console.log('[SERVICE] normalizeMessage input:', { message });
  const normalized = message.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
  console.log('[SERVICE] normalizeMessage output:', { normalized });
  return normalized;
}

export async function replyToPublicMessage(botRef: string, message: string, history: ChatMessage[]) {
  console.log('[SERVICE] replyToPublicMessage called with:', { botRef, message, historyLength: history.length });

  console.log('[SERVICE] fetchActiveBotForPublicChat called with botRef:', botRef);
  const bot = await getActiveBotForPublicChat(botRef);
  if (!bot) {
    console.log('[SERVICE] replyToPublicMessage bot not found or not active for botRef:', botRef);
    return { kind: 'not_found' as const };
  }
  console.log('[SERVICE] replyToPublicMessage bot found:', { botId: bot.id, botName: bot.bot_name });

  const normalized = normalizeMessage(message);
  console.log('[SERVICE] replyToPublicMessage normalized message:', normalized);

  console.log('[SERVICE] replyToPublicMessage checking cache for botRef:', botRef, 'normalized:', normalized);
  const cached = await findCachedReply(botRef, normalized).catch(() => null);
  if (cached) {
    console.log('[SERVICE] replyToPublicMessage cache HIT for botRef:', botRef);
    return { kind: 'success' as const, reply: cached, cached: true };
  }
  console.log('[SERVICE] replyToPublicMessage cache MISS for botRef:', botRef);

  console.log('[SERVICE] replyToPublicMessage generating Groq reply...');
  const generated = await generateGroqReply({
    botName: bot.bot_name,
    websiteUrl: bot.website_url ?? '',
    knowledgeContext: buildKnowledgeContext(bot.kb_chunks, bot.knowledge_base),
    history,
    message,
  });
  console.log('[SERVICE] replyToPublicMessage Groq reply generated:', { replyLength: generated.reply.length, tokensUsed: generated.tokensUsed });

  console.log('[SERVICE] replyToPublicMessage inserting conversation log...');
  void insertConversationLog({
    bot_id: bot.id,
    bot_ref_id: bot.ref_id,
    user_id: bot.owner_id,
    user_message: message,
    normalized_message: normalized,
    bot_response: generated.reply,
    tokens_used: generated.tokensUsed,
  }).catch((error) => {
    console.error('[SERVICE] replyToPublicMessage error logging conversation:', error);
  });

  console.log('[SERVICE] replyToPublicMessage returning success response');
  return { kind: 'success' as const, reply: generated.reply, cached: false };
}

export async function getOwnerConversations(botId: string) {
  console.log('[SERVICE] getOwnerConversations called with botId:', botId);
  const conversations = await listConversationsForBot(botId);
  console.log('[SERVICE] getOwnerConversations found', { count: conversations.length });
  return conversations;
}
