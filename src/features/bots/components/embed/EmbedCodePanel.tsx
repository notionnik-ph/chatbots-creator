"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, Globe2, Terminal } from "lucide-react";
import type { Bot } from "@/features/bots/types/bot";
import { buildEmbedSnippet, getEmbedBaseUrl } from "./build-embed-snippet";

export default function EmbedCodePanel({ bot }: { bot: Bot }) {
  const [copied, setCopied] = useState(false);

  const origin =
    typeof window === "undefined" ? undefined : window.location.origin;

  const snippet = buildEmbedSnippet(bot, origin);
  const baseUrl = getEmbedBaseUrl(origin);

  async function copyCode() {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);

    window.setTimeout(() => setCopied(false), 2_000);
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
            <Terminal size={16} />
            Deployment
          </p>

          <h2 className="text-xl font-semibold text-text-primary">
            Embed this chatbot on your website
          </h2>

          <p className="mt-1 text-sm text-text-muted">
            Copy the iframe below and paste it into any{" "}
            <code className="rounded bg-surface px-1.5 py-0.5 text-primary">
              HTML / Embed
            </code>{" "}
            block. No script tag, body tag, or extra setup is required.
          </p>
        </div>

        <button
          type="button"
          className="btn-secondary shrink-0 px-4 py-2"
          onClick={() => void copyCode()}
        >
          {copied ? (
            <Check size={16} className="text-green-400" />
          ) : (
            <Copy size={16} />
          )}

          {copied ? "Copied!" : "Copy Embed Code"}
        </button>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-border bg-[#020205]">
        <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-2">
          <span className="flex items-center gap-2 text-[11px] font-medium text-text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            HTML iframe embed
          </span>

          <span className="text-[10px] uppercase tracking-[0.16em] text-text-muted">
            Ready to paste
          </span>
        </div>

        <pre className="overflow-x-auto p-5 text-xs leading-relaxed text-text-secondary">
          <code>{snippet}</code>
        </pre>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-text-primary">
            <Globe2 size={16} className="text-primary" />
            How to embed
          </p>

          <ol className="space-y-1.5 text-sm text-text-secondary">
            <li>1. Copy the iframe code above.</li>
            <li>2. Add a Custom HTML or Embed block on the website.</li>
            <li>3. Paste the iframe directly into that block.</li>
            <li>4. Save and publish the website.</li>
          </ol>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="mb-2 text-sm font-semibold text-text-primary">
            Standalone chatbot URL
          </p>

          <a
            href={`${baseUrl}/widget/${bot.refId}`}
            target="_blank"
            rel="noreferrer"
            className="flex break-all text-sm text-primary hover:underline"
          >
            {baseUrl}/widget/{bot.refId}
            <ExternalLink size={14} className="ml-2 mt-1 shrink-0" />
          </a>

          <p className="mt-3 text-xs text-text-muted">
            Bot ID: <code className="text-primary">{bot.refId}</code>
          </p>
        </div>
      </div>
    </section>
  );
}