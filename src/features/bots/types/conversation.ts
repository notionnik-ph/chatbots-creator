export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ConversationLog {
  id: string;
  botId: string;
  botRefId: string;
  userId: string;
  userMessage: string;
  botResponse: string;
  tokensUsed: number;
  createdAt: string;
}
