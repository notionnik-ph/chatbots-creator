"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Bot, MessageSquare, ShieldCheck, Users } from "lucide-react";
import AdminStatsCards, { type AdminMetrics } from "@/features/admin/components/AdminStatsCards";
import LoadingState from "@/components/ui/LoadingState";
import { useAuth } from "@/features/auth/components/AuthProvider";

export default function AdminOverviewPage() {
  const { session } = useAuth();
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session?.access_token) return;

    void fetch("/api/v1/admin/metrics", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error);
        return body.data as AdminMetrics;
      })
      .then(setMetrics)
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load metrics"));
  }, [session?.access_token]);

  if (error) {
    return <div className="p-8"><div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">{error}</div></div>;
  }
  if (!metrics) return <LoadingState label="Loading platform metrics…" />;

  const overviewLinks = [
    {
      href: "/admin/dashboard/bots",
      icon: Bot,
      title: "Review bots",
      description: "Browse every chatbot and pause or activate a bot when necessary.",
    },
    {
      href: "/admin/dashboard/users",
      icon: Users,
      title: "Manage users",
      description: "View Supabase-authenticated accounts and confirmation status.",
    },
    {
      href: "/admin/dashboard/conversations",
      icon: MessageSquare,
      title: "Inspect conversations",
      description: "Review recent public widget activity across the platform.",
    },
  ];

  return (
    <div className="p-6 sm:p-8">
      <header className="mb-8 rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-500/10 via-surface-elevated to-orange-400/10 p-6">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-red-500/15 text-red-300">
            <ShieldCheck size={23} />
          </span>
          <div>
            <p className="mb-1 text-sm font-medium text-red-300">Platform administration</p>
            <h1 className="text-3xl font-bold text-text-primary">Admin overview</h1>
            <p className="mt-2 max-w-2xl text-text-secondary">
              Monitor the entire chatbot platform, including users, bots, conversations, and aggregate token usage.
            </p>
          </div>
        </div>
      </header>

      <AdminStatsCards metrics={metrics} />

      <section className="mt-8 grid gap-5 lg:grid-cols-3">
        {overviewLinks.map(({ href, icon: Icon, title, description }) => (
          <Link key={href} href={href} className="card group block hover:-translate-y-0.5 hover:shadow-lg">
            <span className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-red-500/10 text-red-300">
              <Icon size={20} />
            </span>
            <h2 className="flex items-center gap-2 font-semibold text-text-primary">
              {title}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-text-muted">{description}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
