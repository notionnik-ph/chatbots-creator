"use client";

import { useState } from "react";
import { Save, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";
import type { Bot } from "@/features/bots/types/bot";
import type { BotFormData } from "@/features/bots/types/bot-config";
import BotBrandingFields from "./BotBrandingFields";
import BotGeneralFields, { type BotFieldUpdater } from "./BotGeneralFields";
import BotKnowledgeFields from "./BotKnowledgeFields";
import BotPreview from "../preview/BotPreview";

function toForm(bot: Bot): BotFormData {
  const {
    id: _id,
    refId: _refId,
    status: _status,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    ...form
  } = bot;

  return form;
}

export default function BotEditForm({
  bot,
  onSave,
  onRefreshKnowledge,
}: {
  bot: Bot;
  onSave: (data: BotFormData) => Promise<void>;
  onRefreshKnowledge: () => Promise<void>;
}) {
  const [form, setForm] = useState<BotFormData>(() => toForm(bot));
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const update: BotFieldUpdater = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      await onSave(form);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save bot");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]" onSubmit={handleSubmit}>
      <div className="space-y-8">
        <section className="card">
          <BotGeneralFields form={form} update={update} />
        </section>

        <section className="card">
          <BotKnowledgeFields form={form} update={update} />
          <div className="mt-5 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-md text-sm text-text-muted">
              Rebuild the knowledge index after changing your source content.
            </p>
            <Button
              type="button"
              variant="secondary"
              isLoading={refreshing}
              onClick={async () => {
                setRefreshing(true);
                setError("");
                try {
                  await onRefreshKnowledge();
                } catch (reason) {
                  setError(reason instanceof Error ? reason.message : "Unable to refresh knowledge");
                } finally {
                  setRefreshing(false);
                }
              }}
            >
              <Sparkles size={16} />
              Refresh knowledge index
            </Button>
          </div>
        </section>

        <section className="card">
          <BotBrandingFields form={form} update={update} />
        </section>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <Button type="submit" isLoading={saving}>
            <Save size={16} />
            Save changes
          </Button>
        </div>
      </div>

      <aside className="lg:sticky lg:top-8 lg:self-start">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-text-primary">Live Preview</h2>
          <span className="text-xs text-text-muted">Updates as you edit</span>
        </div>
        <BotPreview config={form} />
      </aside>
    </form>
  );
}
