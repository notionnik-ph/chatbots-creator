'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';

console.log('[COMPONENT] ChatInput widget loaded');

export default function ChatInput({ onSend, disabled, color }: { onSend: (message: string) => Promise<void>; disabled: boolean; color: string }) {
  console.log('[COMPONENT] ChatInput widget rendering with props:', { disabled, colorLength: color.length });
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    console.log('[COMPONENT] ChatInput widget form submit triggered');
    event.preventDefault();
    const text = message.trim();
    console.log('[COMPONENT] ChatInput widget preparing to send message:', { textLength: text.length, disabled });
    if (!text || disabled) {
      console.log('[COMPONENT] ChatInput widget send aborted:', { emptyText: !text, disabled });
      return;
    }
    console.log('[COMPONENT] ChatInput widget clearing input and sending message');
    setMessage('');
    console.log('[COMPONENT] ChatInput widget calling onSend callback');
    await onSend(text);
    console.log('[COMPONENT] ChatInput widget onSend callback completed');
  };

  console.log('[COMPONENT] ChatInput widget rendering JSX');
  return (
    <form className="flex gap-2 border-t border-white/10 p-3 bg-[#111118]" onSubmit={handleSubmit}>
      <input
        className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40"
        value={message}
        onChange={(event) => {
          console.log('[COMPONENT] ChatInput widget input change:', { length: event.target.value.length });
          setMessage(event.target.value);
        }}
        placeholder="Type a message…"
        maxLength={2000}
      />
      <button
        className="grid h-10 w-10 place-items-center rounded-xl text-white disabled:opacity-50"
        style={{ backgroundColor: color }}
        disabled={disabled}
        aria-label="Send"
      >
        <Send size={17}/>
      </button>
    </form>
  );
}
