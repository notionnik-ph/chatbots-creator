'use client';

import { useEffect, useState } from 'react';
import LoadingState from '@/components/ui/LoadingState';
import type { ChatMessage } from '@/features/bots/types/conversation';
import type { PublicBotConfig } from '@/features/bots/types/public-bot';
import ChatHeader from './ChatHeader';
import ChatInput from './ChatInput';
import ChatMessageList from './ChatMessageList';

console.log('[COMPONENT] ChatWidget loaded');

export default function ChatWindow({ botRef }: { botRef: string }) {
  console.log('[COMPONENT] ChatWidget mounting with botRef:', botRef);
  const [bot, setBot] = useState<PublicBotConfig | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  console.log('[COMPONENT] ChatWidget useEffect setup');

  useEffect(() => {
    console.log('[COMPONENT] ChatWidget useEffect triggered for botRef:', botRef);
    void fetch(`/api/v1/public/bots/${botRef}/config`)
      .then(async (response) => {
        console.log('[COMPONENT] ChatWidget bot config response status:', response.status);
        const body = await response.json();
        if (!response.ok) {
          console.error('[COMPONENT] ChatWidget bot config error:', body.error || 'Bot not found');
          throw new Error(body.error || 'Bot not found');
        }
        console.log('[COMPONENT] ChatWidget bot config received:', { botName: body.data?.bot_name });
        return body.data as PublicBotConfig;
      })
      .then((config) => {
        console.log('[COMPONENT] ChatWidget setting bot state and initial message');
        setBot(config);
        setMessages([{ role: 'assistant', content: config.welcomeMessage }]);
      })
      .catch((reason) => {
        console.error('[COMPONENT] ChatWidget failed to load bot:', reason);
        setError(reason instanceof Error ? reason.message : 'Unable to load bot');
      });
  }, [botRef]);

  if (error) {
    console.log('[COMPONENT] ChatWidget rendering error state:', error);
    return <div id="chat-widget-root" className="grid h-screen place-items-center bg-[#111118] p-6 text-center text-sm text-red-200">{error}</div>;
  }

  if (!bot) {
    console.log('[COMPONENT] ChatWidget showing loading state');
    return <div id="chat-widget-root" className="h-screen bg-[#111118]"><LoadingState label="Opening chat…"/></div>;
  }

  console.log('[COMPONENT] ChatWidget rendering chat interface with bot:', { botName: bot.name });

  async function send(message: string) {
    console.log('[COMPONENT] ChatWidget send function called with message:', { messageLength: message.length });
    setSending(true);
    console.log('[COMPONENT] ChatWidget adding user message to state');
    setMessages((current) => [...current, { role: 'user', content: message }]);
    console.log('[COMPONENT] ChatWidget sending message to API');

    try {
      console.log('[COMPONENT] ChatWidget making API call to /api/v1/public/bots/${botRef}/messages');
      const response = await fetch(`/api/v1/public/bots/${botRef}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history: messages.slice(-8) })
      });
      console.log('[COMPONENT] ChatWidget API response status:', response.status);

      const body = await response.json();
      console.log('[COMPONENT] ChatWidget API response body received');

      if (!response.ok) {
        console.error('[COMPONENT] ChatWidget API error:', body.error || 'Unable to send message');
        throw new Error(body.error || 'Unable to send message');
      }

      console.log('[COMPONENT] ChatWidget adding bot response to state');
      setMessages((current) => [...current, { role: 'assistant', content: body.data.reply }]);
    } catch (reason) {
      console.error('[COMPONENT] ChatWidget error sending message:', reason);
      setMessages((current) => [...current, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      console.log('[COMPONENT] ChatWidget send function completed');
      setSending(false);
    }
  }

  console.log('[COMPONENT] ChatWidget rendering JSX');
  return (
    <div id="chat-widget-root" className="flex h-screen flex-col overflow-hidden" style={{ backgroundColor: bot.bgColor }}>
      <ChatHeader bot={bot}/>
      <ChatMessageList bot={bot} messages={messages} sending={sending}/>
      <ChatInput color={bot.primaryColor} disabled={sending} onSend={send}/>
    </div>
  );
}
