"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bot,
  CheckCircle2,
  CreditCard,
  Loader2,
  Sparkles,
  Zap,
} from "lucide-react";

import { supabaseBrowser } from "@/lib/supabase/browser";
import type { BillingSummary } from "@/features/billing/types/billing";

console.log("[PAGE] billing/page.tsx loaded");

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function getUsagePercent(used: number, limit: number) {
  if (!limit) return 0;
  return Math.min(Math.round((used / limit) * 100), 100);
}

export default function BillingPage() {
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const usagePercent = useMemo(() => {
    if (!summary) return 0;

    return getUsagePercent(
      summary.monthlyTokensUsed,
      summary.profile.monthlyTokenLimit,
    );
  }, [summary]);

  useEffect(() => {
    let active = true;

    async function loadBilling() {
      console.log("[PAGE] BillingPage loadBilling called");

      setLoading(true);
      setErrorMessage("");

      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabaseBrowser.auth.getSession();

        if (sessionError) {
          throw new Error(sessionError.message);
        }

        if (!session?.access_token) {
          throw new Error("Please log in again to view billing.");
        }

        const response = await fetch("/api/v1/me/billing", {
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        const payload = (await response.json()) as {
          data?: BillingSummary;
          error?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error || "Failed to load billing");
        }

        if (active) {
          setSummary(payload.data ?? null);
        }
      } catch (error) {
        console.error("[PAGE] BillingPage loadBilling failed:", error);

        if (active) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Failed to load billing details.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadBilling();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-5 py-4 text-text-secondary">
          <Loader2 size={18} className="animate-spin text-primary" />
          Loading billing details...
        </div>
      </div>
    );
  }

  if (errorMessage || !summary) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <h1 className="text-xl font-semibold text-text-primary">
          Billing unavailable
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          {errorMessage || "Billing details could not be loaded right now."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-border bg-card p-6 shadow-card">
        <p className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
          <CreditCard size={16} />
          Billing
        </p>

        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-3xl font-semibold text-text-primary">
              Pricing & Usage
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-muted">
              Free plan includes 1 chatbot and 100,000 monthly AI tokens.
            </p>
          </div>

          <div className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-primary">
              Current Plan
            </p>
            <p className="mt-1 text-xl font-semibold capitalize text-text-primary">
              {summary.profile.plan}
            </p>
          </div>
        </div>
      </header>

      <section className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <p className="mb-3 flex items-center gap-2 text-sm font-medium text-text-muted">
            <Bot size={16} className="text-primary" />
            Bots created
          </p>

          <p className="text-3xl font-semibold text-text-primary">
            {summary.activeBotCount}
            <span className="text-base text-text-muted">
              {" "}
              / {summary.profile.botLimit}
            </span>
          </p>

          <p className="mt-2 text-sm text-text-muted">
            Free plan allows only one bot for now.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <p className="mb-3 flex items-center gap-2 text-sm font-medium text-text-muted">
            <Zap size={16} className="text-primary" />
            Monthly tokens
          </p>

          <p className="text-3xl font-semibold text-text-primary">
            {formatNumber(summary.monthlyTokensUsed)}
            <span className="text-base text-text-muted">
              {" "}
              / {formatNumber(summary.profile.monthlyTokenLimit)}
            </span>
          </p>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${usagePercent}%` }}
            />
          </div>

          <p className="mt-2 text-sm text-text-muted">
            {formatNumber(summary.monthlyTokensRemaining)} tokens remaining.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <p className="mb-3 flex items-center gap-2 text-sm font-medium text-text-muted">
            <Sparkles size={16} className="text-primary" />
            Billing period
          </p>

          <p className="text-sm text-text-secondary">
            Starts:{" "}
            {new Date(summary.profile.billingPeriodStart).toLocaleDateString()}
          </p>

          <p className="mt-2 text-sm text-text-secondary">
            Resets:{" "}
            {new Date(summary.profile.billingPeriodEnd).toLocaleDateString()}
          </p>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-3xl border border-primary/40 bg-card p-6 shadow-card">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Current
          </span>

          <h2 className="mt-4 text-2xl font-semibold text-text-primary">
            Free Plan
          </h2>

          <p className="mt-3 text-4xl font-semibold text-text-primary">
            $0
            <span className="text-base font-normal text-text-muted">
              /month
            </span>
          </p>

          <ul className="mt-6 space-y-3 text-sm text-text-secondary">
            {[
              "1 chatbot only",
              "100,000 monthly AI tokens",
              "Website embed widget",
              "Generated FAQ matching",
              "Conversation cache",
              "Knowledge-base retrieval",
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <CheckCircle2 size={16} className="mt-0.5 text-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-3xl border border-border bg-card/70 p-6 shadow-card">
          <span className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-text-muted">
            Coming soon
          </span>

          <h2 className="mt-4 text-2xl font-semibold text-text-primary">
            Paid Plan
          </h2>

          <p className="mt-3 text-4xl font-semibold text-text-primary">
            Soon
          </p>

          <ul className="mt-6 space-y-3 text-sm text-text-secondary">
            {[
              "More chatbots",
              "Higher token limits",
              "Advanced analytics",
              "Team access",
              "Stripe subscription support",
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <CheckCircle2 size={16} className="mt-0.5 text-text-muted" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}