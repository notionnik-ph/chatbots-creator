import type { WidgetPosition } from './bot';

export interface BotFormData {
  name: string;
  description: string;
  knowledgeBase: string;
  welcomeMessage: string;
  primaryColor: string;
  textColor: string;
  bgColor: string;
  userMsgColor: string;
  botMsgColor: string;
  iconUrl: string;
  position: WidgetPosition;
  websiteUrl: string;
  webhookUrl?: string;
}

export const defaultBotFormData: BotFormData = {
  name: '',
  description: '',
  knowledgeBase: '',
  welcomeMessage: 'Hi! How can I help you today?',
  primaryColor: '#6366f1',
  textColor: '#ffffff',
  bgColor: '#111118',
  userMsgColor: '#6366f1',
  botMsgColor: '#1e1e2e',
  iconUrl: '',
  position: 'bottom-right',
  websiteUrl: '',
};
