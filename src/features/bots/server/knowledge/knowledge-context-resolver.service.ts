import type { SelectedKnowledgeChunk } from "@/features/bots/types/knowledge-retrieval";

console.log("[SERVICE] knowledge-context-resolver.service.ts loaded");

const DEFAULT_MAX_CONTEXT_CHARACTERS = 4_500;

export function buildSelectedKnowledgeContext(
  chunks: SelectedKnowledgeChunk[],
  maxCharacters = DEFAULT_MAX_CONTEXT_CHARACTERS,
) {
  let context = "";

  for (const chunk of chunks) {
    const block = [
      `[${chunk.label}]`,
      `Path: ${chunk.path}`,
      chunk.content.trim(),
    ].join("\n");

    const separator = context ? "\n\n---\n\n" : "";
    const remainingCharacters = maxCharacters - context.length - separator.length;

    if (remainingCharacters <= 0) {
      break;
    }

    if (block.length <= remainingCharacters) {
      context += `${separator}${block}`;
      continue;
    }

    context += `${separator}${block.slice(0, remainingCharacters).trimEnd()}`;
    break;
  }

  console.log("[SERVICE] Selected knowledge context built:", {
    chunkCount: chunks.length,
    contextLength: context.length,
  });

  return context;
}