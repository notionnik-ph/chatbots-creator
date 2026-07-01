"use client";

import { useState } from "react";
import { Bot, MessageCircle, Send, X } from "lucide-react";
import type { BotFormData } from "@/features/bots/types/bot-config";

export default function BotPreview({
  config,
}: {
  config: Pick<
    BotFormData,
    "name" | "welcomeMessage" | "primaryColor" | "textColor" | "bgColor" | "userMsgColor" | "botMsgColor" | "iconUrl"
  >;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="relative min-h-[360px] overflow-hidden rounded-2xl border border-border bg-[#08080d] p-4">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent-cyan/10" />
      <p className="relative mb-3 text-[10px] font-medium uppercase tracking-[0.16em] text-text-muted">Widget preview</p>

      <div
        className="relative ml-auto overflow-hidden rounded-2xl border border-white/10 shadow-2xl transition-all"
        style={{
          backgroundColor: config.bgColor,
          width: isOpen ? "100%" : "64px",
          maxWidth: isOpen ? "320px" : "64px",
        }}
      >
        {isOpen ? (
          <>
            <div className="flex items-center justify-between gap-3 px-4 py-3.5" style={{ backgroundColor: config.primaryColor, color: config.textColor }}>
              <div className="flex min-w-0 items-center gap-2.5">
                {config.iconUrl ? (
                  <img src={config.iconUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-white/20">
                    <Bot size={18} />
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{config.name || "Your bot"}</p>
                  <p className="text-xs opacity-80">Online now</p>
                </div>
              </div>
              <button type="button" onClick={() => setIsOpen(false)} aria-label="Close preview" className="rounded-md p-1 opacity-75 transition-opacity hover:bg-white/10 hover:opacity-100">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 p-4">
              <div className="max-w-[86%] rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-xs leading-relaxed" style={{ backgroundColor: config.botMsgColor, color: config.textColor }}>
                {config.welcomeMessage || "Hi! How can I help you today?"}
              </div>
              <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-xs leading-relaxed text-white" style={{ backgroundColor: config.userMsgColor }}>
                Hello! I have a question about your services.
              </div>
              <div className="max-w-[86%] rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-xs leading-relaxed" style={{ backgroundColor: config.botMsgColor, color: config.textColor }}>
                I&apos;d be happy to help. What would you like to know?
              </div>
            </div>

            <div className="flex items-center gap-2 border-t border-white/10 px-3 py-2.5">
              <span className="flex-1 text-xs opacity-50" style={{ color: config.textColor }}>Type a message…</span>
              <span className="grid h-7 w-7 place-items-center rounded-full text-white" style={{ backgroundColor: config.primaryColor }}>
                <Send size={12} />
              </span>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="grid h-16 w-16 place-items-center rounded-full text-white"
            style={{ backgroundColor: config.primaryColor }}
            aria-label="Open preview"
          >
            <MessageCircle size={25} />
          </button>
        )}
      </div>
    </div>
  );
}
