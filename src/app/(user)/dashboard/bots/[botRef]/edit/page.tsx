"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit3, Sparkles } from "lucide-react";
import LoadingState from "@/components/ui/LoadingState";
import BotEditForm from "@/features/bots/components/edit/BotEditForm";
import { useAuth } from "@/features/auth/components/AuthProvider";
import type { Bot } from "@/features/bots/types/bot";
import type { BotFormData } from "@/features/bots/types/bot-config";

export default function EditBotPage() {
  const { botRef } = useParams<{ botRef: string }>();
  const router = useRouter();
  const { session } = useAuth();
  const [bot, setBot] = useState<Bot | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session?.access_token) return;

    void fetch(`/api/v1/me/bots/${botRef}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Unable to load bot");
        return body.data as Bot;
      })
      .then(setBot)
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load bot"));
  }, [botRef, session?.access_token]);

  async function save(data: BotFormData) {
    if (!session?.access_token) throw new Error("Session expired");

    const response = await fetch(`/api/v1/me/bots/${botRef}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(data),
    });
    const body = await response.json();

    if (!response.ok) throw new Error(body.error || "Unable to save");
    setBot(body.data.bot);
    router.replace(`/dashboard/bots/${botRef}`);
  }

  async function refreshKnowledge() {
    if (!session?.access_token) throw new Error("Session expired");

    const response = await fetch(`/api/v1/me/bots/${botRef}/knowledge/chunk`, {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const body = await response.json();

    if (!response.ok) throw new Error(body.error || "Unable to refresh knowledge");
  }

  if (error) {
    return <div className="p-8"><div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">{error}</div></div>;
  }
  if (!bot) return <LoadingState label="Loading editor…" />;

  return (
    <div className="mx-auto max-w-7xl p-6 sm:p-8">
      <Link href={`/dashboard/bots/${botRef}`} className="inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-text-primary">
        <ArrowLeft size={16} />
        Back to {bot.name}
      </Link>

      <header className="mt-7 mb-8 rounded-2xl border border-border bg-surface-elevated p-6">
        <p className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
          <Sparkles size={16} />
          Bot configuration
        </p>
        <h1 className="flex items-center gap-3 text-3xl font-bold text-text-primary">
          <Edit3 size={25} className="text-primary" />
          Edit {bot.name}
        </h1>
        <p className="mt-2 text-text-secondary">Update content, styling, knowledge, and widget deployment details.</p>
      </header>

      <BotEditForm bot={bot} onSave={save} onRefreshKnowledge={refreshKnowledge} />
    </div>
  );
}
