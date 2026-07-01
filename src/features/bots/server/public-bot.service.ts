import { mapPublicBotConfig } from '@/features/bots/mappers/bot.mapper';
import { findBotByRef } from './bot.repository';

export async function getPublicBotConfig(botRef: string) {
  const bot = await findBotByRef(botRef);
  return bot?.status === 'active' ? mapPublicBotConfig(bot) : null;
}

export async function getActiveBotForPublicChat(botRef: string) {
  const bot = await findBotByRef(botRef);
  return bot?.status === 'active' ? bot : null;
}
