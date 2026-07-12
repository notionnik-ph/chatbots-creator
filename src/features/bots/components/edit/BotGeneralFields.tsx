"use client";

import { Bot, Globe2, MessageSquareText, Palette, Webhook } from "lucide-react";
import Input from "@/components/ui/Input";
import type { BotFormData } from "@/features/bots/types/bot-config";
import BotIconUpload from "@/features/bots/components/shared/BotIconUpload";

export type BotFieldUpdater = <K extends keyof BotFormData>(
  field: K,
  value: BotFormData[K],
) => void;

export default function BotGeneralFields({
  form,
  update,
}: {
  form: BotFormData;
  update: BotFieldUpdater;
}) {
  return (
    <section className="space-y-6">
      <header>
        <p className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
          <Bot size={16} />
          General setup
        </p>
        <h2 className="text-xl font-semibold text-text-primary">
          Give your chatbot an identity
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          Set the name, website, welcome message, and placement for this bot.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Bot name"
          value={form.name}
          onChange={(event) => update("name", event.target.value)}
          placeholder="e.g. Acme Support Assistant"
          required
        />
        <Input
          label="Website URL"
          type="url"
          value={form.websiteUrl}
          onChange={(event) => update("websiteUrl", event.target.value)}
          placeholder="https://example.com"
        />
      </div>

      <label className="block">
        <span className="label">Description</span>
        <textarea
          className="textarea min-h-24"
          value={form.description}
          onChange={(event) => update("description", event.target.value)}
          placeholder="What does this bot help visitors with?"
        />
      </label>

      <label className="block">
        <span className="label">Welcome message</span>
        <textarea
          className="textarea min-h-24"
          value={form.welcomeMessage}
          onChange={(event) => update("welcomeMessage", event.target.value)}
          placeholder="Hi! How can I help you today?"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">
            Bot Icon
          </label>

          <BotIconUpload
            value={form.iconUrl}
            onChange={(iconUrl) => update("iconUrl", iconUrl)}
          />
        </div>
        <Input
          label="Webhook URL (optional)"
          type="url"
          value={form.webhookUrl ?? ""}
          onChange={(event) => update("webhookUrl", event.target.value)}
          placeholder="https://example.com/webhook"
        />
      </div>

      <label className="block">
        <span className="label">Widget position</span>
        <select
          className="input"
          value={form.position}
          onChange={(event) =>
            update("position", event.target.value as BotFormData["position"])
          }
        >
          <option value="bottom-right">Bottom right</option>
          <option value="bottom-left">Bottom left</option>
        </select>
      </label>

      <div className="grid gap-3 border-t border-border pt-5 sm:grid-cols-3">
        {[
          [Globe2, "Website ready", "Set a destination website URL."],
          [
            MessageSquareText,
            "Welcome message",
            "Start every chat with a clear greeting.",
          ],
          [
            Webhook,
            "Webhook optional",
            "Use an external URL only when your flow needs one.",
          ],
        ].map(([Icon, title, description]) => {
          const FeatureIcon = Icon as typeof Globe2;
          return (
            <div key={String(title)} className="rounded-xl bg-surface p-3">
              <FeatureIcon size={16} className="mb-2 text-primary" />
              <p className="text-sm font-medium text-text-primary">
                {title as string}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-text-muted">
                {description as string}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
