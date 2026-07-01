import { env } from '@/lib/env';
import type { ChatbotRow } from '@/features/bots/types/bot';
import { updateKnowledgeChunks } from '@/features/bots/server/bot.repository';

const instructions = `Convert the business knowledge base below into a deeply nested JSON object. Return only valid JSON. Preserve facts. Use concise lowercase_snake_case keys. Do not invent information.`;

function geminiUrl(model: string) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.geminiApiKey}`;
}

function normalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, child]) => [key, normalize(child)]));
  return typeof value === 'number' || typeof value === 'boolean' ? String(value) : value;
}

function countLeaves(value: unknown): number {
  if (Array.isArray(value)) return value.reduce<number>((total, child) => total + countLeaves(child), 0);
  if (value && typeof value === 'object') return Object.values(value as Record<string, unknown>).reduce<number>((total, child) => total + countLeaves(child), 0);
  return 1;
}

async function generate(model: string, prompt: string) {
  const response = await fetch(geminiUrl(model), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 65_536, responseMimeType: 'application/json' },
    }),
  });
  if (!response.ok) throw new Error(`Knowledge structuring failed with ${response.status}`);
  const data = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.replace(/```json|```/g, '').trim();
  if (!text) throw new Error('Knowledge structuring returned no content');
  return JSON.parse(text) as unknown;
}

export async function chunkBotKnowledge(bot: ChatbotRow) {
  const source = bot.knowledge_base?.trim();
  if (!source) return { chunked: false, reason: 'Knowledge base is empty' };
  if (!env.geminiApiKey) return { chunked: false, reason: 'Gemini is not configured' };

  let parsed: unknown;
  try {
    parsed = await generate(env.geminiModel, `${instructions}\n\nKNOWLEDGE BASE:\n${source}`);
  } catch (firstError) {
    if (env.geminiFallbackModel === env.geminiModel) throw firstError;
    parsed = await generate(env.geminiFallbackModel, `${instructions}\n\nKNOWLEDGE BASE:\n${source}`);
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Knowledge structuring returned an invalid object');
  const chunks = normalize(parsed) as Record<string, unknown>;
  if (!Object.keys(chunks).length) throw new Error('Knowledge structuring returned no categories');
  await updateKnowledgeChunks(bot.id, chunks);
  return { chunked: true, categories: Object.keys(chunks), totalLeaves: countLeaves(chunks) };
}
