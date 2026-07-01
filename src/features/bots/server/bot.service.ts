import { mapBotRow } from '@/features/bots/mappers/bot.mapper';
import type { BotFormData } from '@/features/bots/types/bot-config';
import type { BotPatchInput } from '@/features/bots/schemas/bot.schema';
import * as repository from './bot.repository';
import { invalidateBotKnowledgeCache } from './knowledge/cache.service';
import { chunkBotKnowledge } from './knowledge/chunker.service';

console.log('[SERVICE] bot.service.ts loaded');

function botRef() {
  const ref = crypto.randomUUID().replace(/-/g, '').slice(0, 12);
  console.log('[SERVICE] botRef generated:', ref);
  return ref;
}

function createPayload(ownerId: string, input: BotFormData) {
  console.log('[SERVICE] createPayload called with:', { ownerId, input });
  const payload = {
    ref_id: botRef(), owner_id: ownerId, bot_name: input.name, description: input.description,
    knowledge_base: input.knowledgeBase, welcome_message: input.welcomeMessage, primary_color: input.primaryColor,
    text_color: input.textColor, bg_color: input.bgColor, user_msg_color: input.userMsgColor,
    bot_msg_color: input.botMsgColor, icon_url: input.iconUrl, position: input.position,
    website_url: input.websiteUrl, webhook_url: input.webhookUrl ?? '', status: 'active',
  };
  console.log('[SERVICE] createPayload result:', payload);
  return payload;
}

function patchPayload(input: BotPatchInput) {
  console.log('[SERVICE] patchPayload called with:', input);
  const output: Record<string, unknown> = {};
  const fields: Array<[keyof BotPatchInput, string]> = [
    ['name', 'bot_name'], ['description', 'description'], ['knowledgeBase', 'knowledge_base'], ['welcomeMessage', 'welcome_message'],
    ['primaryColor', 'primary_color'], ['textColor', 'text_color'], ['bgColor', 'bg_color'], ['userMsgColor', 'user_msg_color'],
    ['botMsgColor', 'bot_msg_color'], ['iconUrl', 'icon_url'], ['position', 'position'], ['websiteUrl', 'website_url'], ['webhookUrl', 'webhook_url'], ['status', 'status'],
  ];
  for (const [source, destination] of fields) {
    if (input[source] !== undefined) {
      output[destination] = input[source];
    }
  }
  console.log('[SERVICE] patchPayload result:', output);
  return output;
}

export async function listBotsForOwner(ownerId: string) {
  console.log('[SERVICE] listBotsForOwner called with ownerId:', ownerId);
  const bots = await repository.listBotsByOwner(ownerId);
  console.log('[SERVICE] listBotsForOwner found', { count: bots.length });
  const result = bots.map(mapBotRow);
  console.log('[SERVICE] listBotsForOwner returning', { count: result.length });
  return result;
}

export async function getBotForOwner(botRef: string, ownerId: string) {
  console.log('[SERVICE] getBotForOwner called with:', { botRef, ownerId });
  const row = await repository.findBotForOwner(botRef, ownerId);
  console.log('[SERVICE] getBotForOwner repository result:', row ? 'found' : 'not found');
  const result = row ? mapBotRow(row) : null;
  console.log('[SERVICE] getBotForOwner returning:', result ? 'bot found' : 'null');
  return result;
}

export async function createBotForOwner(ownerId: string, input: BotFormData) {
  console.log('[SERVICE] createBotForOwner called with:', { ownerId, input });
  const row = await repository.createBotRow(createPayload(ownerId, input));
  console.log('[SERVICE] createBotForOwner bot created in DB:', { botId: row.id, refId: row.ref_id });

  let chunking: { chunked: boolean; reason?: string; categories?: string[]; totalLeaves?: number } = { chunked: false };
  if (row.knowledge_base?.trim()) {
    console.log('[SERVICE] createBotForOwner starting knowledge chunking...');
    try {
      chunking = await chunkBotKnowledge(row);
      console.log('[SERVICE] createBotForOwner chunking result:', chunking);
    } catch (error) {
      chunking = { chunked: false, reason: error instanceof Error ? error.message : 'Chunking failed' };
      console.error('[SERVICE] createBotForOwner chunking failed:', chunking.reason);
    }
  }

  console.log('[SERVICE] createBotForOwner fetching latest bot state...');
  const latest = await repository.findBotForOwner(row.ref_id, ownerId) ?? row;
  console.log('[SERVICE] createBotForOwner latest bot fetched:', { botId: latest.id });

  const result = { bot: mapBotRow(latest), chunking };
  console.log('[SERVICE] createBotForOwner returning result');
  return result;
}

export async function updateBotForOwner(botRef: string, ownerId: string, input: BotPatchInput) {
  console.log('[SERVICE] updateBotForOwner called with:', { botRef, ownerId, input });
  const row = await repository.updateBotForOwner(botRef, ownerId, patchPayload(input));
  console.log('[SERVICE] updateBotForOwner update result:', row ? 'updated' : 'not found');
  if (!row) return null;

  let chunking: { chunked: boolean; reason?: string; categories?: string[]; totalLeaves?: number } | undefined;
  if (input.knowledgeBase !== undefined) {
    console.log('[SERVICE] updateBotForOwner knowledge base updated, starting chunking...');
    try {
      chunking = await chunkBotKnowledge(row);
      await invalidateBotKnowledgeCache(botRef);
      console.log('[SERVICE] updateBotForOwner chunking and cache invalidation complete:', chunking);
    }
    catch (error) {
      chunking = { chunked: false, reason: error instanceof Error ? error.message : 'Chunking failed' };
      console.error('[SERVICE] updateBotForOwner chunking failed:', chunking.reason);
    }
  }

  console.log('[SERVICE] updateBotForOwner fetching latest bot state...');
  const latest = await repository.findBotForOwner(botRef, ownerId) ?? row;
  console.log('[SERVICE] updateBotForOwner latest bot fetched:', { botId: latest.id });

  const result = { bot: mapBotRow(latest), chunking };
  console.log('[SERVICE] updateBotForOwner returning result');
  return result;
}

export async function deleteBotForOwner(botRef: string, ownerId: string) {
  console.log('[SERVICE] deleteBotForOwner called with:', { botRef, ownerId });
  const result = await repository.deleteBotForOwner(botRef, ownerId);
  console.log('[SERVICE] deleteBotForOwner result:', result ? 'deleted' : 'not found/deletion failed');
  return result;
}

export async function chunkKnowledgeForOwner(botRef: string, ownerId: string) {
  console.log('[SERVICE] chunkKnowledgeForOwner called with:', { botRef, ownerId });
  const row = await repository.findBotForOwner(botRef, ownerId);
  console.log('[SERVICE] chunkKnowledgeForOwner bot found:', row ? 'yes' : 'no');
  if (!row) return null;

  console.log('[SERVICE] chunkKnowledgeForOwner starting chunking process...');
  const result = await chunkBotKnowledge(row);
  console.log('[SERVICE] chunkKnowledgeForOwner chunking result:', result);

  await invalidateBotKnowledgeCache(botRef);
  console.log('[SERVICE] chunkKnowledgeForOwner cache invalidated');

  return result;
}

export async function updateBotStatusAsAdmin(botRef: string, status: 'active' | 'paused' | 'draft') {
  console.log('[SERVICE] updateBotStatusAsAdmin called with:', { botRef, status });
  const row = await repository.updateBotByRef(botRef, { status });
  console.log('[SERVICE] updateBotStatusAsAdmin update result:', row ? 'updated' : 'not found');
  const result = row ? mapBotRow(row) : null;
  console.log('[SERVICE] updateBotStatusAsAdmin returning:', result ? 'bot found' : 'null');
  return result;
}
