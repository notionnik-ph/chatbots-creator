"use client";

import { useEffect, useState } from "react";
import { Bot, MessageSquare, UserRound } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import LoadingState from "@/components/ui/LoadingState";
import { useAuth } from "@/features/auth/components/AuthProvider";
import type { ConversationLog } from "@/features/bots/types/conversation";
import { formatDate } from "@/lib/utils";

export default function AdminConversationsPage() {
  const { session } = useAuth();
  const [items, setItems] = useState<ConversationLog[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.access_token) return;

    void fetch("/api/v1/admin/conversations", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error);
        return body.data as ConversationLog[];
      })
      .then(setItems)
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load conversations"))
      .finally(() => setLoading(false));
  }, [session?.access_token]);

  if (loading) return <LoadingState label="Loading platform conversations…" />;

  return (
    <div className="mx-auto max-w-6xl p-6 sm:p-8">
      <header className="mb-8">
        <p className="mb-2 flex items-center gap-2 text-sm font-medium text-red-300">
          <MessageSquare size={16} />
          Public widget activity
        </p>
        <h1 className="text-3xl font-bold text-text-primary">Conversations</h1>
        <p className="mt-1 text-text-secondary">Latest visitor messages across all bots.</p>
      </header>

      {error && <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

      <div className="space-y-5">
        {items.length ? (
          items.map((item) => (
            <article key={item.id} className="card overflow-hidden p-0">
              <div className="flex flex-col justify-between gap-2 border-b border-border bg-surface px-5 py-3 text-xs text-text-muted sm:flex-row sm:items-center">
                <span className="font-mono">{item.botRefId}</span>
                <span>{formatDate(item.createdAt)} · {item.tokensUsed.toLocaleString()} tokens</span>
              </div>
              <div className="space-y-4 p-5">
                <div className="flex items-start gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface text-text-secondary"><UserRound size={15} /></span>
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-muted">Visitor</p>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">{item.userMessage}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-red-500/10 text-red-300"><Bot size={15} /></span>
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-muted">Bot response</p>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">{item.botResponse}</p>
                  </div>
                </div>
              </div>
            </article>
          ))
        ) : (
          <EmptyState
            title="No conversations yet"
            description="Public widget activity will appear here after visitors use a bot."
            action={<MessageSquare className="mx-auto text-text-muted" />}
          />
        )}
      </div>
    </div>
  );
}
