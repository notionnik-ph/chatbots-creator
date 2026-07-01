'use client';

import { useEffect, useRef } from 'react';
import type { ChatMessage } from '@/features/bots/types/conversation';
import type { PublicBotConfig } from '@/features/bots/types/public-bot';

console.log('[COMPONENT] ChatMessageList loaded');

export default function ChatMessageList({ messages, bot, sending }: { messages: ChatMessage[]; bot: PublicBotConfig; sending: boolean }) {
  console.log('[COMPONENT] ChatMessageList rendering with:', {
    messagesCount: messages.length,
    botName: bot?.name ?? 'unknown',
    sending
  });

  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('[COMPONENT] ChatMessageList scrolling to bottom');
    end.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  console.log('[COMPONENT] ChatMessageList rendering messages list');
  return (
    <main
      className="flex-1 space-y-3 overflow-y-auto p-4"
      style={{ backgroundColor: bot.bgColor, color: bot.textColor }}
    >
      {messages.map((message, index) => {
        console.log('[COMPONENT] ChatMessageList rendering message', index, {
          role: message.role,
          contentLength: message.content.length
        });
        return (
          <div
            key={`${message.role}-${index}`}
            className={`max-w-[86%] whitespace-pre-wrap rounded-2xl p-3 text-sm ${message.role === 'user' ? 'ml-auto rounded-tr-sm' : 'rounded-tl-sm'}`}
            style={{ backgroundColor: message.role === 'user' ? bot.userMsgColor : bot.botMsgColor }}
          >
            {message.content}
          </div>
        );
      })}{sending && (
        <div
          className="w-fit rounded-2xl rounded-tl-sm p-3 text-sm opacity-70"
          style={{ backgroundColor: bot.botMsgColor }}
        >
          Typing…
        </div>
      )}
      <div ref={end}/>
    </main>
  );
}
