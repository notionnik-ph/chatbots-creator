import { supabaseAdmin } from '@/lib/supabase/admin';
import type { ConversationLog } from '@/features/bots/types/conversation';

const TABLE = 'conversation_logs';

function mapRow(row: Record<string, unknown>): ConversationLog {
  return {
    id: String(row.id),
    botId: String(row.bot_id ?? ''),
    botRefId: String(row.bot_ref_id ?? ''),
    userId: String(row.user_id ?? ''),
    userMessage: String(row.user_message ?? ''),
    botResponse: String(row.bot_response ?? ''),
    tokensUsed: Number(row.tokens_used ?? 0),
    createdAt: String(row.created_at ?? ''),
  };
}

export async function findCachedReply(botRefId: string, normalizedMessage: string) {
  const { data, error } = await supabaseAdmin.from(TABLE).select('bot_response').eq('bot_ref_id', botRefId).eq('normalized_message', normalizedMessage).order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (error) throw new Error(error.message);
  return data?.bot_response ?? null;
}

export async function insertConversationLog(payload: Record<string, unknown>) {
  const { error } = await supabaseAdmin.from(TABLE).insert(payload);
  if (error) throw new Error(error.message);
}

export async function listConversationsForBot(botId: string, limit = 200) {
  const { data, error } = await supabaseAdmin.from(TABLE).select('*').eq('bot_id', botId).order('created_at', { ascending: false }).limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
}

export async function listAllConversations(limit = 300) {
  const { data, error } = await supabaseAdmin.from(TABLE).select('*').order('created_at', { ascending: false }).limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
}

export async function clearConversationCache(botRefId: string) {
  const { error } = await supabaseAdmin.from(TABLE).delete().eq('bot_ref_id', botRefId);
  if (error) throw new Error(error.message);
}
