import type { GeneratedFaqCandidate } from "@/features/bots/types/generated-faq";

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

export function parseGeneratedFaqPayload(
  payload: unknown,
): GeneratedFaqCandidate[] {
  if (!payload || typeof payload !== "object") {
    return [];
  }

  const faqs = (payload as { faqs?: unknown }).faqs;

  if (!Array.isArray(faqs)) {
    return [];
  }

  const output: GeneratedFaqCandidate[] = [];

  for (const faq of faqs) {
    if (!faq || typeof faq !== "object") {
      continue;
    }

    const item = faq as Record<string, unknown>;

    const question = cleanText(item.question, 280);
    const answer = cleanText(item.answer, 700);

    if (question.length < 3 || answer.length < 3) {
      continue;
    }

    output.push({ question, answer });
  }

  return output;
}