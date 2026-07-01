"use client";

import { Palette } from "lucide-react";
import type { BotFormData } from "@/features/bots/types/bot-config";
import type { BotFieldUpdater } from "./BotGeneralFields";

const fields: Array<{
  key: keyof Pick<BotFormData, "primaryColor" | "textColor" | "bgColor" | "userMsgColor" | "botMsgColor">;
  label: string;
  description: string;
}> = [
  { key: "primaryColor", label: "Primary color", description: "Widget header and action color" },
  { key: "textColor", label: "Text color", description: "Text on the primary header" },
  { key: "bgColor", label: "Background color", description: "Widget background" },
  { key: "userMsgColor", label: "User message color", description: "Visitor message bubble" },
  { key: "botMsgColor", label: "Bot message color", description: "Assistant message bubble" },
];

export default function BotBrandingFields({
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
          <Palette size={16} />
          Branding
        </p>
        <h2 className="text-xl font-semibold text-text-primary">Make the widget feel like your website</h2>
        <p className="mt-1 text-sm text-text-muted">Choose six-digit HEX colors. The live preview updates instantly.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map(({ key, label, description }) => (
          <label key={key} className="rounded-xl border border-border bg-surface p-4 transition-colors hover:border-border-hover">
            <span className="mb-1 block text-sm font-medium text-text-primary">{label}</span>
            <span className="mb-3 block text-xs text-text-muted">{description}</span>
            <span className="flex gap-2">
              <input
                type="color"
                value={form[key]}
                onChange={(event) => update(key, event.target.value)}
                className="h-11 w-14 cursor-pointer rounded-lg border border-border bg-surface-elevated p-1"
                aria-label={`${label} picker`}
              />
              <input
                className="input font-mono uppercase"
                value={form[key]}
                onChange={(event) => update(key, event.target.value)}
                maxLength={7}
                aria-label={label}
              />
            </span>
          </label>
        ))}
      </div>
    </section>
  );
}
