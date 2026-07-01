"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Bot as BotIcon,
  Edit3,
  ExternalLink,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import LoadingState from "@/components/ui/LoadingState";
import EmbedCodePanel from "@/features/bots/components/embed/EmbedCodePanel";
import { useAuth } from "@/features/auth/components/AuthProvider";
import type { Bot } from "@/features/bots/types/bot";
import { formatDate } from "@/lib/utils";

export default function BotDetailPage() {
  const { botRef } = useParams<{ botRef: string }>();
  const { session } = useAuth();
  const [bot, setBot] = useState<Bot | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!botRef || !session?.access_token) return;

    void fetch(`/api/v1/me/bots/${botRef}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Bot not found");
        return body.data as Bot;
      })
      .then(setBot)
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load bot"));
  }, [botRef, session?.access_token]);

  if (error) {
    return (
      <div className="p-8">
        <div className="max-w-xl rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>
      </div>
    );
  }
  if (!bot) return <LoadingState label="Loading chatbot details…" />;

  const active = bot.status === "active";

  return (
    <div className="mx-auto max-w-6xl p-6 sm:p-8">
      <Link href="/dashboard/bots" className="inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-text-primary">
        <ArrowLeft size={16} />
        Back to My Bots
      </Link>

      <header className="mt-7 flex flex-col justify-between gap-5 rounded-2xl border border-border bg-surface-elevated p-6 sm:flex-row sm:items-start">
        <div className="flex min-w-0 items-start gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-accent-cyan text-white shadow-glow">
            {bot.iconUrl ? <img src={bot.iconUrl} alt="" className="h-full w-full object-cover" /> : <BotIcon size={25} />}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="truncate text-3xl font-bold text-text-primary">{bot.name}</h1>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${active ? "bg-green-400/15 text-green-400" : "bg-surface text-text-muted"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-green-400" : "bg-text-muted"}`} />
                {bot.status}
              </span>
            </div>
            <p className="mt-2 max-w-2xl text-text-secondary">{bot.description || "No description yet."}</p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-text-muted">
              <span>Created {formatDate(bot.createdAt)}</span>
              <span>{bot.knowledgeBase.length.toLocaleString()} knowledge characters</span>
              {bot.websiteUrl && <span className="max-w-xs truncate">{bot.websiteUrl}</span>}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href={`/dashboard/bots/${bot.refId}/conversations`} className="btn-secondary px-4 py-2">
            <MessageSquare size={16} />
            Conversations
          </Link>
          <Link href={`/dashboard/bots/${bot.refId}/edit`} className="btn-primary px-4 py-2">
            <Edit3 size={16} />
            Edit Bot
          </Link>
        </div>
      </header>

      <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <article className="card">
          <EmbedCodePanel bot={bot} />
        </article>

        <aside className="space-y-4">
          <article className="rounded-2xl border border-border bg-surface-elevated p-5">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-primary">
              <Sparkles size={16} className="text-primary" />
              Bot readiness
            </p>
            <ul className="space-y-3 text-sm">
              {[
                ["Knowledge base", Boolean(bot.knowledgeBase.trim())],
                ["Welcome message", Boolean(bot.welcomeMessage.trim())],
                ["Website URL", Boolean(bot.websiteUrl.trim())],
                ["Embed status", active],
              ].map(([label, ready]) => (
                <li key={label as string} className="flex items-center justify-between gap-3">
                  <span className="text-text-secondary">{label as string}</span>
                  <span className={ready ? "text-green-400" : "text-text-muted"}>{ready ? "Ready" : "Needs setup"}</span>
                </li>
              ))}
            </ul>
          </article>

          {bot.websiteUrl && (
            <a href={bot.websiteUrl} target="_blank" rel="noreferrer" className="btn-secondary w-full">
              <ExternalLink size={16} />
              Visit website
            </a>
          )}
        </aside>
      </section>
    </div>
  );
}
