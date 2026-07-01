import type { BotStatus, WidgetPosition } from '@/features/bots/types/bot';
import type { BotFormData } from '@/features/bots/types/bot-config';
import { cleanText, isSafeHttpUrl } from '@/lib/security/sanitize';
import { parseHexColor } from './bot-style.schema';

export class BotValidationError extends Error {}

function requiredText(value: unknown, field: string, maxLength: number) {
  try { return cleanText(value, maxLength, true); } catch (error) { throw new BotValidationError(`${field}: ${error instanceof Error ? error.message : 'invalid value'}`); }
}

function optionalText(value: unknown, field: string, maxLength: number) {
  try { return cleanText(value, maxLength); } catch (error) { throw new BotValidationError(`${field}: ${error instanceof Error ? error.message : 'invalid value'}`); }
}

function optionalUrl(value: unknown, field: string) {
  const url = optionalText(value, field, 2_000);
  if (url && !isSafeHttpUrl(url)) throw new BotValidationError(`${field} must be an http or https URL`);
  return url;
}

function widgetPosition(value: unknown): WidgetPosition {
  return value === 'bottom-left' ? 'bottom-left' : 'bottom-right';
}

function color(value: unknown, field: string, fallback: string) {
  try { return parseHexColor(value, field, fallback); } catch (error) { throw new BotValidationError(error instanceof Error ? error.message : 'Invalid color'); }
}

export function parseCreateBotInput(body: unknown): BotFormData {
  if (!body || typeof body !== 'object') throw new BotValidationError('Invalid request body');
  const input = body as Record<string, unknown>;
  return {
    name: requiredText(input.name, 'name', 120),
    description: optionalText(input.description, 'description', 1_000),
    knowledgeBase: optionalText(input.knowledgeBase, 'knowledgeBase', 500_000),
    welcomeMessage: optionalText(input.welcomeMessage, 'welcomeMessage', 1_000) || 'Hi! How can I help you today?',
    primaryColor: color(input.primaryColor, 'primaryColor', '#6366f1'),
    textColor: color(input.textColor, 'textColor', '#ffffff'),
    bgColor: color(input.bgColor, 'bgColor', '#111118'),
    userMsgColor: color(input.userMsgColor, 'userMsgColor', '#6366f1'),
    botMsgColor: color(input.botMsgColor, 'botMsgColor', '#1e1e2e'),
    iconUrl: optionalUrl(input.iconUrl, 'iconUrl'),
    position: widgetPosition(input.position),
    websiteUrl: optionalUrl(input.websiteUrl, 'websiteUrl'),
    webhookUrl: optionalUrl(input.webhookUrl, 'webhookUrl'),
  };
}

export type BotPatchInput = Partial<BotFormData> & { status?: BotStatus };

export function parseBotPatchInput(body: unknown): BotPatchInput {
  if (!body || typeof body !== 'object') throw new BotValidationError('Invalid request body');
  const input = body as Record<string, unknown>;
  const patch: BotPatchInput = {};
  if ('name' in input) patch.name = requiredText(input.name, 'name', 120);
  if ('description' in input) patch.description = optionalText(input.description, 'description', 1_000);
  if ('knowledgeBase' in input) patch.knowledgeBase = optionalText(input.knowledgeBase, 'knowledgeBase', 500_000);
  if ('welcomeMessage' in input) patch.welcomeMessage = requiredText(input.welcomeMessage, 'welcomeMessage', 1_000);
  if ('primaryColor' in input) patch.primaryColor = color(input.primaryColor, 'primaryColor', '#6366f1');
  if ('textColor' in input) patch.textColor = color(input.textColor, 'textColor', '#ffffff');
  if ('bgColor' in input) patch.bgColor = color(input.bgColor, 'bgColor', '#111118');
  if ('userMsgColor' in input) patch.userMsgColor = color(input.userMsgColor, 'userMsgColor', '#6366f1');
  if ('botMsgColor' in input) patch.botMsgColor = color(input.botMsgColor, 'botMsgColor', '#1e1e2e');
  if ('iconUrl' in input) patch.iconUrl = optionalUrl(input.iconUrl, 'iconUrl');
  if ('websiteUrl' in input) patch.websiteUrl = optionalUrl(input.websiteUrl, 'websiteUrl');
  if ('webhookUrl' in input) patch.webhookUrl = optionalUrl(input.webhookUrl, 'webhookUrl');
  if ('position' in input) patch.position = widgetPosition(input.position);
  if ('status' in input) {
    if (input.status !== 'active' && input.status !== 'paused' && input.status !== 'draft') throw new BotValidationError('status must be active, paused, or draft');
    patch.status = input.status;
  }
  if (!Object.keys(patch).length) throw new BotValidationError('No supported fields were supplied');
  return patch;
}
