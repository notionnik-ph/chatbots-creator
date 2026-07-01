import type { ChatMessage } from '@/features/bots/types/conversation';
import { cleanText } from '@/lib/security/sanitize';

export class ChatValidationError extends Error {}

export function parseChatMessageInput(body: unknown): { message: string; history: ChatMessage[] } {
  if (!body || typeof body !== 'object') throw new ChatValidationError('Invalid request body');
  const input = body as Record<string, unknown>;
  let message: string;
  try { message = cleanText(input.message, 2_000, true); } catch (error) { throw new ChatValidationError(error instanceof Error ? error.message : 'message is invalid'); }

  const history = (Array.isArray(input.history) ? input.history : []).slice(-8).flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const row = item as Record<string, unknown>;
    if ((row.role !== 'user' && row.role !== 'assistant') || typeof row.content !== 'string') return [];
    const content = row.content.replace(/\u0000/g, '').trim().slice(0, 1_000);
    return content ? [{ role: row.role, content } as ChatMessage] : [];
  });
  return { message, history };
}
