import { env } from "@/lib/env";
import type {
  KnowledgeChunkCandidate,
  KnowledgeRouteDecision,
} from "@/features/bots/types/knowledge-retrieval";

console.log("[SERVICE] knowledge-router.service.ts loaded");

const MAX_SELECTED_CHUNKS = 5;

export async function routeQuestionToKnowledgeChunks(input: {
  question: string;
  candidates: KnowledgeChunkCandidate[];
}): Promise<KnowledgeRouteDecision> {
  console.log("[SERVICE] routeQuestionToKnowledgeChunks called:", {
    questionLength: input.question.length,
    candidateCount: input.candidates.length,
  });

  if (!env.groqApiKey) {
    throw new Error("AI service is not configured");
  }

  if (!input.candidates.length) {
    return {
      relevant: false,
      selectedChunkIds: [],
      needsClarification: false,
    };
  }

  const allowedChunkIds = new Set(
    input.candidates.map((candidate) => candidate.chunkId),
  );

  const catalog = input.candidates.map((candidate) => ({
    chunkId: candidate.chunkId,
    path: candidate.path,
    label: candidate.label,
    preview: candidate.preview,
  }));

  const system = [
    "You are a retrieval router for a business chatbot.",
    "Do not answer the visitor question.",
    "Choose the smallest set of source chunk IDs needed to answer accurately.",
    "Select only IDs that exist in the provided candidate catalog.",
    `Never select more than ${MAX_SELECTED_CHUNKS} chunks.`,
    "Do not select sibling fields merely because they share a parent path.",
    "For broad questions, select only the overview or descriptive chunks needed.",
    "For narrow questions, select only the narrow supporting chunks needed.",
    "Return JSON only using this exact structure:",
    '{"relevant":true,"selectedChunkIds":["chunk-id"],"needsClarification":false,"clarificationQuestion":null}',
  ].join("\n");

  const response = await fetch(env.groqApiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.groqApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: env.groqModel,
      messages: [
        {
          role: "system",
          content: system,
        },
        {
          role: "user",
          content: JSON.stringify({
            question: input.question,
            candidateCatalog: catalog,
          }),
        },
      ],
      temperature: 0,
      max_tokens: 180,
      response_format: {
        type: "json_object",
      },
    }),
  });

  const data = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
  };

  if (!response.ok) {
    console.error("[SERVICE] Knowledge router returned error:", data);
    throw new Error("Knowledge routing failed");
  }

  const rawJson = data.choices?.[0]?.message?.content?.trim();

  if (!rawJson) {
    return {
      relevant: false,
      selectedChunkIds: [],
      needsClarification: false,
    };
  }

  try {
    const parsed = JSON.parse(rawJson) as {
      relevant?: unknown;
      selectedChunkIds?: unknown;
      needsClarification?: unknown;
      clarificationQuestion?: unknown;
    };

    const selectedChunkIds = Array.isArray(parsed.selectedChunkIds)
      ? parsed.selectedChunkIds
          .filter(
            (chunkId): chunkId is string =>
              typeof chunkId === "string" && allowedChunkIds.has(chunkId),
          )
          .slice(0, MAX_SELECTED_CHUNKS)
      : [];

    const decision: KnowledgeRouteDecision = {
      relevant: parsed.relevant === true && selectedChunkIds.length > 0,
      selectedChunkIds,
      needsClarification: parsed.needsClarification === true,
      clarificationQuestion:
        typeof parsed.clarificationQuestion === "string"
          ? parsed.clarificationQuestion.trim()
          : undefined,
    };

    console.log("[SERVICE] Knowledge router decision:", decision);

    return decision;
  } catch (error) {
    console.error("[SERVICE] Knowledge router JSON parsing failed:", error);

    return {
      relevant: false,
      selectedChunkIds: [],
      needsClarification: false,
    };
  }
}