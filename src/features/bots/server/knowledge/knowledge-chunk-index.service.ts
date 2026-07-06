import type { ChatbotRow } from "@/features/bots/types/bot";
import type { OriginalKnowledgeChunk } from "@/features/bots/types/knowledge-retrieval";

import { getKnowledgeHash } from "./knowledge-version.service";
import { replaceActiveKnowledgeChunkIndex } from "./knowledge-chunk-index.repository";

console.log("[SERVICE] knowledge-chunk-index.service.ts loaded");

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeText(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\s+/g, " ").trim();
}

function toLabel(path: string) {
  const lastPart = path
    .replace(/\[\d+\]/g, "")
    .split(".")
    .filter(Boolean)
    .at(-1) ?? "Knowledge";

  return lastPart
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function toKeywords(path: string, label: string) {
  return `${path} ${label}`
    .replace(/[.[\]_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseMaybeJson(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function appendPath(parentPath: string, key: string | number) {
  if (typeof key === "number") {
    return `${parentPath}[${key}]`;
  }

  return parentPath ? `${parentPath}.${key}` : key;
}

function getDirectChunkText(record: Record<string, unknown>) {
  const content = normalizeText(record.content);

  if (content) {
    return content;
  }

  const text = normalizeText(record.text);

  if (text) {
    return text;
  }

  const hasChunkIdentity =
    typeof record.id === "string" ||
    typeof record.path === "string" ||
    typeof record.chunk_id === "string";

  if (hasChunkIdentity) {
    return normalizeText(record.value);
  }

  return "";
}

export function extractOriginalKnowledgeChunks(
  rawKbChunks: unknown,
): OriginalKnowledgeChunk[] {
  const source = parseMaybeJson(rawKbChunks);
  const chunks = new Map<string, OriginalKnowledgeChunk>();

  const hasKnowledgeRoot =
    isRecord(source) && Object.prototype.hasOwnProperty.call(source, "knowledge");

  function addChunk(input: {
    chunkId: string;
    path: string;
    content: string;
    label?: string;
  }) {
    const content = normalizeText(input.content);

    if (content.length < 3) {
      return;
    }

    const label = input.label?.trim() || toLabel(input.path);

    chunks.set(input.chunkId, {
      chunkId: input.chunkId,
      path: input.path,
      label,
      content,
      keywords: toKeywords(input.path, label),
    });
  }

  function walk(value: unknown, currentPath: string) {
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      addChunk({
        chunkId: currentPath,
        path: currentPath,
        content: String(value),
      });

      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        walk(item, appendPath(currentPath, index));
      });

      return;
    }

    if (!isRecord(value)) {
      return;
    }

    const directText = getDirectChunkText(value);

    if (directText) {
      const chunkId =
        normalizeText(value.chunk_id) ||
        normalizeText(value.id) ||
        normalizeText(value.path) ||
        currentPath;

      const path = normalizeText(value.path) || currentPath;
      const label = normalizeText(value.label) || normalizeText(value.title);

      addChunk({
        chunkId,
        path,
        content: directText,
        label,
      });

      return;
    }

    for (const [key, childValue] of Object.entries(value)) {
      if (
        ["id", "chunk_id", "path", "label", "title", "metadata", "keywords"].includes(
          key,
        )
      ) {
        continue;
      }

      walk(childValue, appendPath(currentPath, key));
    }
  }

  walk(source, hasKnowledgeRoot ? "" : "knowledge");

  return [...chunks.values()];
}

export async function syncOriginalChunksForBot(
  bot: Pick<ChatbotRow, "id" | "knowledge_base" | "kb_chunks">,
) {
  console.log("[SERVICE] syncOriginalChunksForBot called:", {
    botId: bot.id,
  });

  const chunks = extractOriginalKnowledgeChunks(bot.kb_chunks);

  if (!chunks.length) {
    console.error("[SERVICE] No original kb_chunks could be extracted");

    return {
      indexed: false,
      count: 0,
      reason: "No usable original kb_chunks found",
    };
  }

  const knowledgeHash = getKnowledgeHash(bot.knowledge_base);

  const result = await replaceActiveKnowledgeChunkIndex({
    botId: bot.id,
    knowledgeHash,
    chunks,
  });

  console.log("[SERVICE] Original knowledge chunks indexed:", {
    botId: bot.id,
    count: result.count,
  });

  return {
    ...result,
    knowledgeHash,
  };
}