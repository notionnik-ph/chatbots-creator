import type { BotFormData } from './bot-config';

export type BotStatus = 'active' | 'draft' | 'paused';
export type WidgetPosition = 'bottom-right' | 'bottom-left';

export interface ChatbotRow {
  id: string;
  ref_id: string;
  owner_id: string;
  bot_name: string;
  description: string | null;
  knowledge_base: string | null;
  kb_chunks: Record<string, unknown> | null;
  welcome_message: string | null;
  primary_color: string | null;
  text_color: string | null;
  bg_color: string | null;
  user_msg_color: string | null;
  bot_msg_color: string | null;
  icon_url: string | null;
  position: WidgetPosition | null;
  website_url: string | null;
  webhook_url: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
}

export interface Bot extends BotFormData {
  id: string;
  refId: string;
  status: BotStatus;
  createdAt: string;
  updatedAt: string;
}
