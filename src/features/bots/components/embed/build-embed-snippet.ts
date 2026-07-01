import type { Bot } from '@/features/bots/types/bot';

export function getEmbedBaseUrl(browserOrigin?: string) {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || browserOrigin || 'http://localhost:3000';
}

export function buildEmbedSnippet(bot: Pick<Bot, 'refId' | 'position' | 'primaryColor'>, browserOrigin?: string) {
  const baseUrl = getEmbedBaseUrl(browserOrigin);
  return `<script>window.ChatbotConfig={botId:${JSON.stringify(bot.refId)},position:${JSON.stringify(bot.position)},primaryColor:${JSON.stringify(bot.primaryColor)}};</script>\n<script src="${baseUrl}/embed/chatbot-embed.js" async></script>`;
}
