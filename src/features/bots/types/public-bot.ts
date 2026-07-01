import type { WidgetPosition } from './bot';

export interface PublicBotConfig {
  refId: string;
  name: string;
  welcomeMessage: string;
  primaryColor: string;
  textColor: string;
  bgColor: string;
  userMsgColor: string;
  botMsgColor: string;
  iconUrl: string;
  position: WidgetPosition;
}
