import { GoogleGenAI, Type } from "@google/genai";

import { env } from "@/lib/env";
import type { GeneratedFaqWithSource } from "@/features/bots/types/generated-faq";

console.log("[SERVICE] gemini.service.ts loaded");

const ai = new GoogleGenAI({
  apiKey: env.geminiApiKey,
});

const faqResponseSchema = {
  type: Type.OBJECT,
  properties: {
    faqs: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: {
            type: Type.STRING,
          },
          answer: {
            type: Type.STRING,
          },
          sourceChunkIds: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
            },
          },
        },
        required: ["question", "answer", "sourceChunkIds"],
      },
    },
  },
  required: ["faqs"],
};

function getGeminiClient() {
  if (!env.geminiApiKey) {
    console.error("[GEMINI] GEMINI_API_KEY is missing");
    throw new Error("Gemini FAQ generation is not configured");
  }

  return new GoogleGenAI({
    apiKey: env.geminiApiKey,
  });
}

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

export async function generateGeminiFaqBatch(input: {
  botName: string;
  chunks: Array<{
    id: string;
    content: string;
  }>;
  maxFaqs: number;
}): Promise<GeneratedFaqWithSource[]> {
  console.log("[GEMINI] generateGeminiFaqBatch started:", {
    botName: input.botName,
    chunkCount: input.chunks.length,
    maxFaqs: input.maxFaqs,
  });

  const ai = getGeminiClient();

  if (!env.geminiApiKey) {
    console.error("[GEMINI] GEMINI_API_KEY is missing");
    throw new Error("Gemini FAQ generation is not configured");
  }

  const allowedChunkIds = new Set(input.chunks.map((chunk) => chunk.id));

  const knowledgeChunks = input.chunks
    .map(
      (chunk) =>
        `[CHUNK ID: ${chunk.id}]\n${chunk.content}`,
    )
    .join("\n\n---\n\n");

  const prompt = `
You are generating a reusable FAQ library for a website chatbot.

BOT NAME:
${input.botName}

TASK:
Create as many useful, realistic visitor questions as possible from the supplied knowledge chunks.

RULES:
- Generate up to ${input.maxFaqs} FAQ records.
- Use only the supplied knowledge chunks.
- Do not invent services, pricing, policies, guarantees, contact details, names, or claims.
- Include question wording variations when they are genuinely useful.
- Cover company details, services, processes, requirements, timelines, policies, objections, and frequently asked customer concerns when supported by the knowledge.
- Each answer must be brief: maximum two sentences.
- Each FAQ must include the ID or IDs of the chunk that supports the answer.
- Do not create duplicate questions.
- Return JSON only.

KNOWLEDGE CHUNKS:
${knowledgeChunks}
`;

  const response = await ai.models.generateContent({
    model: env.geminiModel,
    contents: prompt,
    config: {
      temperature: 0.35,
      responseMimeType: "application/json",
      responseSchema: faqResponseSchema,
    },
  });

  const rawText = response.text?.trim();

  console.log("[GEMINI] generateGeminiFaqBatch response received:", {
    hasText: Boolean(rawText),
    textLength: rawText?.length ?? 0,
  });

  if (!rawText) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawText) as {
      faqs?: Array<{
        question?: unknown;
        answer?: unknown;
        sourceChunkIds?: unknown;
      }>;
    };

    if (!Array.isArray(parsed.faqs)) {
      return [];
    }

    const cleanedFaqs: GeneratedFaqWithSource[] = [];

    for (const rawFaq of parsed.faqs) {
      const question = cleanText(rawFaq.question, 280);
      const answer = cleanText(rawFaq.answer, 700);

      const sourceChunkIds = Array.isArray(rawFaq.sourceChunkIds)
        ? rawFaq.sourceChunkIds
            .filter(
              (chunkId): chunkId is string =>
                typeof chunkId === "string" &&
                allowedChunkIds.has(chunkId),
            )
            .slice(0, 8)
        : [];

      if (question.length < 3 || answer.length < 3) {
        continue;
      }

      if (!sourceChunkIds.length) {
        continue;
      }

      cleanedFaqs.push({
        question,
        answer,
        sourceChunkIds,
      });
    }

    console.log("[GEMINI] Valid FAQ records generated:", {
      count: cleanedFaqs.length,
    });

    return cleanedFaqs;
  } catch (error) {
    console.error("[GEMINI] FAQ JSON parsing failed:", error);
    return [];
  }
}