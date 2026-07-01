import { findBotForOwner } from './bot.repository';

export async function ownerCanAccessBot(ownerId: string, botRef: string) {
  return Boolean(await findBotForOwner(botRef, ownerId));
}
