import { supabaseAdmin } from '@/lib/supabase/admin';
import type { ChatbotRow } from '@/features/bots/types/bot';

const TABLE = 'chatbots';
const asRow = (data: unknown) => data as ChatbotRow;

export async function listBotsByOwner(ownerId: string) {
  const { data, error } = await supabaseAdmin.from(TABLE).select('*').eq('owner_id', ownerId).order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(asRow);
}

export async function findBotForOwner(refId: string, ownerId: string) {
  const { data, error } = await supabaseAdmin.from(TABLE).select('*').eq('ref_id', refId).eq('owner_id', ownerId).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? asRow(data) : null;
}

export async function findBotByRef(refId: string) {
  const { data, error } = await supabaseAdmin.from(TABLE).select('*').eq('ref_id', refId).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? asRow(data) : null;
}

export async function createBotRow(payload: Record<string, unknown>) {
  const { data, error } = await supabaseAdmin.from(TABLE).insert(payload).select('*').single();
  if (error) throw new Error(error.message);
  return asRow(data);
}

export async function updateBotForOwner(refId: string, ownerId: string, payload: Record<string, unknown>) {
  const { data, error } = await supabaseAdmin.from(TABLE).update(payload).eq('ref_id', refId).eq('owner_id', ownerId).select('*').maybeSingle();
  if (error) throw new Error(error.message);
  return data ? asRow(data) : null;
}

export async function updateBotByRef(refId: string, payload: Record<string, unknown>) {
  const { data, error } = await supabaseAdmin.from(TABLE).update(payload).eq('ref_id', refId).select('*').maybeSingle();
  if (error) throw new Error(error.message);
  return data ? asRow(data) : null;
}

export async function deleteBotForOwner(refId: string, ownerId: string) {
  const { data, error } = await supabaseAdmin.from(TABLE).delete().eq('ref_id', refId).eq('owner_id', ownerId).select('id').maybeSingle();
  if (error) throw new Error(error.message);
  return Boolean(data);
}

export async function updateKnowledgeChunks(botId: string, chunks: Record<string, unknown>) {
  const { error } = await supabaseAdmin.from(TABLE).update({ kb_chunks: chunks }).eq('id', botId);
  if (error) throw new Error(error.message);
}

export async function listAllBots() {
  const { data, error } = await supabaseAdmin.from(TABLE).select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(asRow);
}
