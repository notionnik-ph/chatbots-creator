import type { Bot } from "@/features/bots/types/bot";

export function getEmbedBaseUrl(browserOrigin?: string) {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, "") ||
    browserOrigin?.replace(/\/+$/, "") ||
    "http://localhost:3000"
  );
}

function escapeHtmlAttribute(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };

    return entities[character];
  });
}

export function buildEmbedSnippet(
  bot: Pick<Bot, "refId" | "name">,
  browserOrigin?: string,
) {
  const baseUrl = getEmbedBaseUrl(browserOrigin);
  const widgetUrl = `${baseUrl}/widget/${encodeURIComponent(bot.refId)}`;

  const safeRefId = escapeHtmlAttribute(bot.refId);
  const safeWidgetUrl = escapeHtmlAttribute(widgetUrl);
  const safeTitle = escapeHtmlAttribute(
    `${bot.name || "Chatbot"} AI Assistant`,
  );

  return `<iframe
  src="${safeWidgetUrl}"
  id="inline-chatbot-${safeRefId}"
  title="${safeTitle}"
  width="100%"
  height="720"
  loading="lazy"
  allow="clipboard-read; clipboard-write"
  style="display:block;width:100%;height:720px;min-height:560px;border:0;border-radius:16px;background:#111118;overflow:hidden"
></iframe>`;
}