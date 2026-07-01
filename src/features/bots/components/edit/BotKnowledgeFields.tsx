"use client";

import { BookOpenText, FileText, Sparkles } from "lucide-react";
import type { BotFormData } from "@/features/bots/types/bot-config";
import type { BotFieldUpdater } from "./BotGeneralFields";

export default function BotKnowledgeFields({
  form,
  update,
}: {
  form: BotFormData;
  update: BotFieldUpdater;
}) {
  return (
    <section className="space-y-5">
      <header>
        <p className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
          <BookOpenText size={16} />
          Knowledge base
        </p>
        <h2 className="text-xl font-semibold text-text-primary">Train your chatbot with useful context</h2>
        <p className="mt-1 max-w-2xl text-sm text-text-muted">
          Add company details, service information, FAQs, policies, products, and any facts the bot should use to answer visitors.
        </p>
      </header>

      <label className="block">
        <span className="label">Knowledge content</span>
        <textarea
          className="textarea min-h-80 font-mono text-xs leading-relaxed"
          value={form.knowledgeBase}
          onChange={(event) => update("knowledgeBase", event.target.value)}
          placeholder={"Company: Acme Inc.\n\nServices:\n- Product implementation\n- Technical support\n\nFAQ:\nQ: What are your business hours?\nA: Monday to Friday, 9 AM to 5 PM."}
        />
      </label>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">
            <FileText size={17} />
          </span>
          <div>
            <p className="text-sm font-medium text-text-primary">Content size</p>
            <p className="text-xs text-text-muted">The knowledge index is built from this field.</p>
          </div>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-surface-elevated px-3 py-1.5 text-xs font-medium text-text-secondary">
          <Sparkles size={14} className="text-primary" />
          {form.knowledgeBase.length.toLocaleString()} / 500,000 characters
        </span>
      </div>
    </section>
  );
}
