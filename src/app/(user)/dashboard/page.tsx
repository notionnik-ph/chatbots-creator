"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Code2,
  MessageSquare,
  Plus,
  Sparkles,
  Zap,
} from "lucide-react";
import LoadingState from "@/components/ui/LoadingState";
import { useAuth } from "@/features/auth/components/AuthProvider";
import type { Bot as BotType } from "@/features/bots/types/bot";

export default function DashboardPage() {
  const { user, session } = useAuth();
  const [bots, setBots] = useState<BotType[]>([]);
  const [loading, setLoading] = useState(true);

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
      .catch(() => setBots([]))
      .finally(() => setLoading(false));
  }, [session?.access_token]);

  const activeBots = useMemo(() => bots.filter((bot) => bot.status === "active").length, [bots]);
  const configuredBots = useMemo(() => bots.filter((bot) => bot.knowledgeBase.trim().length > 0).length, [bots]);
  const knowledgeCharacters = useMemo(
    () => bots.reduce((total, bot) => total + bot.knowledgeBase.length, 0),
    [bots],
  );

  if (loading) return <LoadingState label="Loading your chatbot workspace…" />;

  const username = user?.user_metadata?.username || user?.email?.split("@")[0] || "there";
  const stats = [
    { label: "Total Bots", value: bots.length, icon: Bot, color: "from-blue-500 to-cyan-400" },
    { label: "Active Bots", value: activeBots, icon: Zap, color: "from-yellow-500 to-orange-400" },
    { label: "Knowledge Ready", value: configuredBots, icon: CheckCircle2, color: "from-green-500 to-emerald-400" },
    { label: "Knowledge Chars", value: knowledgeCharacters.toLocaleString(), icon: Sparkles, color: "from-purple-500 to-violet-400" },
  ];

  return (
    <div className="p-6 sm:p-8">
      <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <h1 className="mb-1 text-3xl font-bold text-text-primary">Welcome back, {username} 👋</h1>
          <p className="text-text-secondary">Here&apos;s an overview of your chatbot workspace.</p>
        </div>
        <Link href="/dashboard/bots/create" className="btn-primary w-fit px-4 py-2.5">
          <Plus size={17} />
          Create New Bot
        </Link>
      </header>

      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <article key={label} className="card flex items-center gap-4">
            <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${color} shadow-md`}>
              <Icon size={22} className="text-white" />
            </span>
            <div>
              <p className="text-2xl font-bold text-text-primary">{value}</p>
              <p className="text-xs text-text-muted">{label}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <article className="card">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary">
              <Bot size={18} className="text-primary" />
              My Bots
            </h2>
            <Link href="/dashboard/bots" className="flex items-center gap-1 text-sm text-primary hover:underline">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {bots.length === 0 ? (
            <div className="py-8 text-center">
              <Bot size={32} className="mx-auto mb-3 text-text-muted" />
              <p className="mb-4 text-sm text-text-muted">No bots yet</p>
              <Link href="/dashboard/bots/create" className="btn-primary px-4 py-2 text-sm">
                <Plus size={14} />
                Create your first bot
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {bots.slice(0, 5).map((bot) => (
                <Link
                  key={bot.id}
                  href={`/dashboard/bots/${bot.refId}`}
                  className="flex items-center justify-between rounded-xl bg-surface px-4 py-3 transition-colors hover:bg-surface-hover"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">
                      <Bot size={14} />
                    </span>
                    <span className="truncate text-sm font-medium text-text-primary">{bot.name}</span>
                  </span>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${bot.status === "active" ? "bg-green-400/15 text-green-400" : "bg-surface-elevated text-text-muted"}`}>
                    {bot.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </article>

        <article className="card">
          <div className="mb-5 flex items-center gap-2">
            <Code2 size={18} className="text-primary" />
            <h2 className="text-lg font-semibold text-text-primary">Quick Start</h2>
          </div>

          <ol className="space-y-4">
            {[
              ["Create a chatbot", "Give it a name, description, and website destination."],
              ["Add your knowledge", "Paste FAQs, services, policies, products, and business facts."],
              ["Customize its style", "Choose the widget colors, icon, welcome message, and screen position."],
              ["Copy the embed code", "Paste the generated snippet before your website closing body tag."],
            ].map(([title, description], index) => (
              <li key={title} className="flex gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
                  <p className="mt-0.5 text-sm leading-relaxed text-text-muted">{description}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
            <p className="flex items-center gap-2 text-sm font-medium text-text-primary">
              <MessageSquare size={16} className="text-primary" />
              Conversations appear per bot
            </p>
            <p className="mt-1 text-sm text-text-muted">Open a bot to view its latest public widget conversations.</p>
          </div>
        </article>
      </section>
    </div>
  );
}
