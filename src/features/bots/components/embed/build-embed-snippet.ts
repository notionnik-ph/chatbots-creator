import type { Bot } from "@/features/bots/types/bot";

export function getEmbedBaseUrl(browserOrigin?: string) {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    browserOrigin ||
    "http://localhost:3000"
  );
}

function escapeHtmlAttribute(value: string) {
  const entities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };

  return value.replace(/[&<>"']/g, (character) => entities[character]);
}

export function buildEmbedSnippet(
  bot: Pick<Bot, "refId" | "name">,
  browserOrigin?: string,
) {
  const baseUrl = getEmbedBaseUrl(browserOrigin);
  const widgetUrl = `${baseUrl}/widget/${encodeURIComponent(bot.refId)}`;

  const safeBotRef = escapeHtmlAttribute(bot.refId);
  const safeWidgetUrl = escapeHtmlAttribute(widgetUrl);
  const safeTitle = escapeHtmlAttribute(
    `${bot.name || "Chatbot"} AI Assistant`,
  );

  return `<iframe
  src="${safeWidgetUrl}"
  style="width:100%;height:680px;min-height:560px;border:none;border-radius:16px;display:block;overflow:hidden"
  id="inline-chatbot-${safeBotRef}"
  data-layout="{'id':'INLINE'}"
  data-bot-ref="${safeBotRef}"
  title="${safeTitle}"
  loading="lazy"
  allow="clipboard-write"
></iframe>`;
}
