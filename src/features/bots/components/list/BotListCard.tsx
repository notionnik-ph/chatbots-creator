"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Bot,
  CheckCircle2,
  Copy,
  ExternalLink,
  Globe,
  Pause,
  Play,
  Trash2,
} from "lucide-react";
import type { Bot as BotType } from "@/features/bots/types/bot";
import { buildEmbedSnippet } from "../embed/build-embed-snippet";

export default function BotListCard({
  bot,
  onToggle,
  onDelete,
}: {
  bot: BotType;
  onToggle: (bot: BotType) => Promise<void>;
  onDelete: (bot: BotType) => Promise<void>;
}) {
  const [copied, setCopied] = useState(false);
  const isActive = bot.status === "active";

  async function copyEmbedCode() {
    await navigator.clipboard.writeText(buildEmbedSnippet(bot, window.location.origin));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2_000);
  }

  return (
    <article className="group flex min-h-[250px] flex-col rounded-2xl border border-border bg-surface-elevated p-5 transition-all hover:-translate-y-0.5 hover:border-border-hover hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent-cyan text-white shadow-md">
            {bot.iconUrl ? <img src={bot.iconUrl} alt="" className="h-full w-full rounded-xl object-cover" /> : <Bot size={20} />}
          </span>
          <div className="min-w-0">
            <Link href={`/dashboard/bots/${bot.refId}`} className="block truncate text-base font-semibold text-text-primary transition-colors hover:text-primary">
              {bot.name}
            </Link>
            <div className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${isActive ? "bg-green-400/15 text-green-400" : "bg-surface text-text-muted"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-green-400" : "bg-text-muted"}`} />
              {bot.status}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void onDelete(bot)}
          className="rounded-lg p-2 text-text-muted transition-colors hover:bg-red-500/10 hover:text-red-300"
          aria-label={`Delete ${bot.name}`}
          title="Delete bot"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <p className="mt-5 line-clamp-2 min-h-10 text-sm leading-relaxed text-text-secondary">
        {bot.description || "No description yet. Add one in the bot editor."}
      </p>

      <div className="mt-5 flex items-center gap-2 text-xs text-text-muted">
        <Globe size={14} className="shrink-0 text-primary" />
        <span className="truncate">{bot.websiteUrl || "No website URL set"}</span>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-text-muted">
        <CheckCircle2 size={14} className={bot.knowledgeBase.trim() ? "text-green-400" : "text-text-muted"} />
        <span>{bot.knowledgeBase.trim() ? "Knowledge base added" : "Knowledge base not added"}</span>
      </div>

      <div className="mt-auto flex flex-wrap gap-2 border-t border-border pt-5">
        <Link href={`/dashboard/bots/${bot.refId}`} className="btn-secondary flex-1 px-3 py-2">
          <ExternalLink size={15} />
          Open
        </Link>
        <button type="button" className="btn-secondary px-3 py-2" onClick={() => void copyEmbedCode()} title="Copy embed code">
          {copied ? <CheckCircle2 size={15} className="text-green-400" /> : <Copy size={15} />}
          <span className="hidden sm:inline">{copied ? "Copied" : "Embed"}</span>
        </button>
        <button
          type="button"
          className="btn-ghost px-3 py-2"
          onClick={() => void onToggle(bot)}
          title={isActive ? "Pause bot" : "Activate bot"}
        >
          {isActive ? <Pause size={15} /> : <Play size={15} />}
          <span className="hidden sm:inline">{isActive ? "Pause" : "Activate"}</span>
        </button>
      </div>
    </article>
  );
}
