import { Bot } from 'lucide-react';
import type { PublicBotConfig } from '@/features/bots/types/public-bot';

console.log('[COMPONENT] ChatHeader widget loaded');

export default function ChatHeader({ bot }: { bot: PublicBotConfig }) {
  console.log('[COMPONENT] ChatHeader rendering with bot:', { botName: bot.name, hasIcon: !!bot.iconUrl, primaryColor: bot.primaryColor });

  return (
    <header className="flex items-center gap-3 p-4" style={{ backgroundColor: bot.primaryColor, color: bot.textColor }}>
      {bot.iconUrl ? (
        console.log('[COMPONENT] ChatHeader rendering bot icon from URL:', bot.iconUrl),
        <img src={bot.iconUrl} alt="" className="h-9 w-9 rounded-full object-cover"/>
      ) : (
        console.log('[COMPONENT] ChatHeader rendering default bot icon'),
        <span className="grid h-9 w-9 place-items-center rounded-full bg-white/20"><Bot size={19}/></span>
      )}
      <div>
        <h1 className="text-sm font-semibold">{bot.name}</h1>
        <p className="text-xs opacity-80">Online now</p>
      </div>
    </header>
  );
}
