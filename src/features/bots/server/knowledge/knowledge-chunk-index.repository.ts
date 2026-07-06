import { supabaseAdmin } from "@/lib/supabase/admin";

import type {
  KnowledgeChunkCandidate,
  OriginalKnowledgeChunk,
  SelectedKnowledgeChunk,
} from "@/features/bots/types/knowledge-retrieval";

console.log("[REPOSITORY] knowledge-chunk-index.repository.ts loaded");

const TABLE = "bot_knowledge_chunk_index";

type IndexRow = {
  chunk_id: string;
  path: string;
  label: string;
  content: string;
  keywords: string;
};

function getFallbackGroup(path: string) {
  /*
   * For arrays:
   * knowledge.frequently_asked_questions[8].answer
   * becomes:
   * knowledge.frequently_asked_questions
   *
   * This prevents 20 FAQ rows from taking all fallback slots.
   */
  const arrayMatch = path.match(/^(.*)\[\d+\]/);

  if (arrayMatch?.[1]) {
    return arrayMatch[1].replace(/\.$/, "");
  }

  /*
   * For normal fields:
   * knowledge.services.online_coaching.description
   * becomes:
   * knowledge.services.online_coaching
   */
  const parts = path.split(".").filter(Boolean);

  return parts.slice(0, Math.max(parts.length - 1, 1)).join(".");
}

function buildDiverseFallbackCandidates(
  rows: IndexRow[],
  limit: number,
): KnowledgeChunkCandidate[] {
  /*
   * Choose one meaningful/longer original chunk per KB branch.
   * This is only used if normal full-text search finds zero matches.
   *
   * It remains dynamic: it uses actual paths/chunks from each bot's KB,
   * not hardcoded business categories or intents.
   */
  const bestByGroup = new Map<string, IndexRow>();

  for (const row of rows) {
    const group = getFallbackGroup(row.path);
    const current = bestByGroup.get(group);

    if (!current || row.content.length > current.content.length) {
      bestByGroup.set(group, row);
    }
  }

  return [...bestByGroup.values()]
    .sort((left, right) => right.content.length - left.content.length)
    .slice(0, limit)
    .map((row) => ({
      chunkId: String(row.chunk_id),
      path: String(row.path),
      label: String(row.label),
      preview: String(row.content).slice(0, 500),
      score: 0,
    }));
}

export async function replaceActiveKnowledgeChunkIndex(input: {
  botId: string;
  knowledgeHash: string;
  chunks: OriginalKnowledgeChunk[];
}) {
  console.log("[REPOSITORY] replaceActiveKnowledgeChunkIndex called:", {
    botId: input.botId,
    knowledgeHash: input.knowledgeHash,
    chunkCount: input.chunks.length,
  });

  const now = new Date().toISOString();

  const { error: deactivateError } = await supabaseAdmin
    .from(TABLE)
    .update({
      is_active: false,
      updated_at: now,
    })
    .eq("bot_id", input.botId)
    .eq("is_active", true);

  if (deactivateError) {
    console.error(
      "[REPOSITORY] replaceActiveKnowledgeChunkIndex deactivate failed:",
      deactivateError,
    );

    throw new Error(deactivateError.message);
  }

  const rows = input.chunks.map((chunk) => ({
    bot_id: input.botId,
    knowledge_hash: input.knowledgeHash,
    chunk_id: chunk.chunkId,
    path: chunk.path,
    label: chunk.label,
    content: chunk.content,
    keywords: chunk.keywords,
    is_active: true,
    updated_at: now,
  }));

  const { error: upsertError } = await supabaseAdmin
    .from(TABLE)
    .upsert(rows, {
      onConflict: "bot_id,knowledge_hash,chunk_id",
    });

  if (upsertError) {
    console.error(
      "[REPOSITORY] replaceActiveKnowledgeChunkIndex upsert failed:",
      upsertError,
    );

    throw new Error(upsertError.message);
  }

  console.log("[REPOSITORY] replaceActiveKnowledgeChunkIndex completed:", {
    botId: input.botId,
    indexedCount: rows.length,
  });

  return {
    indexed: true,
    count: rows.length,
  };
}

export async function findKnowledgeChunkCandidates(input: {
  botId: string;
  knowledgeHash: string;
  question: string;
  limit?: number;
}): Promise<KnowledgeChunkCandidate[]> {
  const limit = input.limit ?? 12;

  console.log("[REPOSITORY] findKnowledgeChunkCandidates called:", {
    botId: input.botId,
    knowledgeHash: input.knowledgeHash,
    question: input.question,
    limit,
  });

  /*
   * Normal fast path:
   * PostgreSQL full-text + trigram search.
   */
  const { data, error } = await supabaseAdmin.rpc(
    "match_bot_knowledge_chunks",
    {
      p_bot_id: input.botId,
      p_knowledge_hash: input.knowledgeHash,
      p_query: input.question,
      p_limit: limit,
    },
  );

  if (error) {
    console.error(
      "[REPOSITORY] findKnowledgeChunkCandidates RPC failed:",
      error,
    );

    throw new Error(error.message);
  }

  const matchingCandidates: KnowledgeChunkCandidate[] = (data ?? []).map(
    (row: {
      chunk_id: unknown;
      path: unknown;
      label: unknown;
      preview: unknown;
      score: unknown;
    }) => ({
      chunkId: String(row.chunk_id),
      path: String(row.path),
      label: String(row.label),
      preview: String(row.preview ?? ""),
      score: Number(row.score ?? 0),
    }),
  );

  if (matchingCandidates.length) {
    console.log(
      "[REPOSITORY] findKnowledgeChunkCandidates normal search HIT:",
      {
        count: matchingCandidates.length,
      },
    );

    return matchingCandidates;
  }

  /*
   * Broad or semantic question fallback:
   * Pull a small, diverse catalog of original active chunks.
   *
   * This does NOT send full KB contents to Groq.
   * The Groq Identifier sees only up to `limit` branch representatives.
   */
  console.log(
    "[REPOSITORY] findKnowledgeChunkCandidates normal search MISS; building diverse fallback catalog",
  );

  const { data: fallbackData, error: fallbackError } = await supabaseAdmin
    .from(TABLE)
    .select("chunk_id, path, label, content, keywords")
    .eq("bot_id", input.botId)
    .eq("knowledge_hash", input.knowledgeHash)
    .eq("is_active", true)
    .limit(300);

  if (fallbackError) {
    console.error(
      "[REPOSITORY] findKnowledgeChunkCandidates fallback query failed:",
      fallbackError,
    );

    throw new Error(fallbackError.message);
  }

  const fallbackRows: IndexRow[] = (fallbackData ?? []).map((row) => ({
    chunk_id: String(row.chunk_id),
    path: String(row.path),
    label: String(row.label),
    content: String(row.content ?? ""),
    keywords: String(row.keywords ?? ""),
  }));

  const fallbackCandidates = buildDiverseFallbackCandidates(
    fallbackRows,
    Math.max(limit, 18),
  );

  console.log(
    "[REPOSITORY] findKnowledgeChunkCandidates fallback catalog complete:",
    {
      totalActiveRows: fallbackRows.length,
      candidateCount: fallbackCandidates.length,
      candidates: fallbackCandidates.map((candidate) => ({
        chunkId: candidate.chunkId,
        path: candidate.path,
      })),
    },
  );

  return fallbackCandidates;
}

export async function getSelectedKnowledgeChunks(input: {
  botId: string;
  knowledgeHash: string;
  chunkIds: string[];
}): Promise<SelectedKnowledgeChunk[]> {
  console.log("[REPOSITORY] getSelectedKnowledgeChunks called:", {
    botId: input.botId,
    knowledgeHash: input.knowledgeHash,
    requestedChunkIds: input.chunkIds,
  });

  if (!input.chunkIds.length) {
    return [];
  }

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select("chunk_id, path, label, content")
    .eq("bot_id", input.botId)
    .eq("knowledge_hash", input.knowledgeHash)
    .eq("is_active", true)
    .in("chunk_id", input.chunkIds);

  if (error) {
    console.error(
      "[REPOSITORY] getSelectedKnowledgeChunks query failed:",
      error,
    );

    throw new Error(error.message);
  }

  const byChunkId = new Map<string, SelectedKnowledgeChunk>(
    (data ?? []).map((row) => [
      String(row.chunk_id),
      {
        chunkId: String(row.chunk_id),
        path: String(row.path),
        label: String(row.label),
        content: String(row.content),
      },
    ]),
  );

  const orderedSelectedChunks = input.chunkIds
    .map((chunkId) => byChunkId.get(chunkId))
    .filter(
      (chunk): chunk is SelectedKnowledgeChunk => Boolean(chunk),
    );

  console.log("[REPOSITORY] getSelectedKnowledgeChunks completed:", {
    requestedCount: input.chunkIds.length,
    foundCount: orderedSelectedChunks.length,
  });

  return orderedSelectedChunks;
}