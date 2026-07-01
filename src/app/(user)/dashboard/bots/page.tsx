"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bot, Plus } from "lucide-react";
import LoadingState from "@/components/ui/LoadingState";
import BotList from "@/features/bots/components/list/BotList";
import { useAuth } from "@/features/auth/components/AuthProvider";
import type { Bot as BotType } from "@/features/bots/types/bot";

export default function BotsPage() {
  const { session } = useAuth();
  const [bots, setBots] = useState<BotType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session?.access_token) return;

    void fetch("/api/v1/me/bots", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Unable to load bots");
        return body.data as BotType[];
      })
      .then(setBots)
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load bots"))
      .finally(() => setLoading(false));
  }, [session?.access_token]);

  async function request(path: string, options: RequestInit) {
    if (!session?.access_token) throw new Error("Session expired");

    const response = await fetch(path, {
      ...options,
      headers: {
        ...(options.headers ?? {}),
        Authorization: `Bearer ${session.access_token}`,
      },
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || "Request failed");
    return body.data;
  }

  if (loading) return <LoadingState label="Loading your bots…" />;

  return (
    <div className="p-6 sm:p-8">
      <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
            <Bot size={16} />
            Chatbot workspace
          </p>
          <h1 className="mb-1 text-3xl font-bold text-text-primary">My Bots</h1>
          <p className="text-text-secondary">Create, configure, deploy, and manage your AI chatbots.</p>
        </div>
        <Link href="/dashboard/bots/create" className="btn-primary w-fit px-4 py-2.5">
          <Plus size={17} />
          Create New Bot
        </Link>
      </header>

      {error && (
        <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <BotList
        bots={bots}
        onToggle={async (bot) => {
          try {
            const data = await request(`/api/v1/me/bots/${bot.refId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: bot.status === "active" ? "paused" : "active" }),
            });
            setBots((current) => current.map((item) => item.refId === bot.refId ? data.bot : item));
          } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Unable to update bot");
          }
        }}
        onDelete={async (bot) => {
          if (!window.confirm(`Delete ${bot.name}? This cannot be undone.`)) return;

          try {
            await request(`/api/v1/me/bots/${bot.refId}`, { method: "DELETE" });
            setBots((current) => current.filter((item) => item.refId !== bot.refId));
          } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Unable to delete bot");
          }
        }}
      />
    </div>
  );
}
