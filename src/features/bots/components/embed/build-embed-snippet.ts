import type { Bot } from "@/features/bots/types/bot";

export function getEmbedBaseUrl(browserOrigin?: string) {
  const rawUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    browserOrigin?.trim().replace(/\/+$/, "") ||
    "http://localhost:3000";

  // Production embeds must always use HTTPS.
  if (!rawUrl.includes("localhost")) {
    return rawUrl.replace(/^http:\/\//i, "https://");
  }

  return rawUrl;
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

  const safeWidgetUrl = escapeHtmlAttribute(widgetUrl);
  const safeRefId = escapeHtmlAttribute(bot.refId);
  const safeTitle = escapeHtmlAttribute(
    `${bot.name || "Chatbot"} AI Assistant`,
  );

  return `<iframe
  src="${safeWidgetUrl}"
  id="inline-chatbot-${safeRefId}"
  title="${safeTitle}"
  width="100%"
  height="720"
  loading="eager"
  allow="clipboard-read; clipboard-write"
  style="display:block;width:100%;height:720px;min-height:560px;border:0;border-radius:16px;background:#111118;overflow:hidden"
></iframe>`;
}