import type { Bot, BotStatus, ChatbotRow, WidgetPosition } from '@/features/bots/types/bot';
import type { PublicBotConfig } from '@/features/bots/types/public-bot';

const defaults = {
  welcomeMessage: 'Hi! How can I help you today?',
  primaryColor: '#6366f1',
  textColor: '#ffffff',
  bgColor: '#111118',
  userMsgColor: '#6366f1',
  botMsgColor: '#1e1e2e',
  position: 'bottom-right' as WidgetPosition,
};

function mapStatus(value: string | null): BotStatus {
  return value === 'paused' || value === 'draft' ? value : 'active';
}

export function mapBotRow(row: ChatbotRow): Bot {
  return {
    id: row.id,
    refId: row.ref_id,
    name: row.bot_name,
    description: row.description ?? '',
    knowledgeBase: row.knowledge_base ?? '',
    welcomeMessage: row.welcome_message ?? defaults.welcomeMessage,
    primaryColor: row.primary_color ?? defaults.primaryColor,
    textColor: row.text_color ?? defaults.textColor,
    bgColor: row.bg_color ?? defaults.bgColor,
    userMsgColor: row.user_msg_color ?? defaults.userMsgColor,
    botMsgColor: row.bot_msg_color ?? defaults.botMsgColor,
    iconUrl: row.icon_url ?? '',
    position: row.position === 'bottom-left' ? 'bottom-left' : defaults.position,
    websiteUrl: row.website_url ?? '',
    webhookUrl: row.webhook_url ?? '',
    status: mapStatus(row.status),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapPublicBotConfig(row: ChatbotRow): PublicBotConfig {
  const bot = mapBotRow(row);
  return {
    refId: bot.refId,
    name: bot.name,
    welcomeMessage: bot.welcomeMessage,
    primaryColor: bot.primaryColor,
    textColor: bot.textColor,
    bgColor: bot.bgColor,
    userMsgColor: bot.userMsgColor,
    botMsgColor: bot.botMsgColor,
    iconUrl: bot.iconUrl,
    position: bot.position,
  };
}
