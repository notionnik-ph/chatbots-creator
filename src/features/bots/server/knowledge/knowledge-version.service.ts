import { createHash } from "node:crypto";

export function getKnowledgeHash(knowledgeBase: string | null) {
  return createHash("sha256")
    .update((knowledgeBase ?? "").trim())
    .digest("hex");
}