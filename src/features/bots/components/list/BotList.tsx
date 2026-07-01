"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Bot, Plus, Search } from "lucide-react";
import type { Bot as BotType } from "@/features/bots/types/bot";
import EmptyState from "@/components/ui/EmptyState";
import BotListCard from "./BotListCard";

export default function BotList({
  bots,
  onToggle,
  onDelete,
}: {
  bots: BotType[];
  onToggle: (bot: BotType) => Promise<void>;
  onDelete: (bot: BotType) => Promise<void>;
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () => bots.filter((bot) => `${bot.name} ${bot.description}`.toLowerCase().includes(search.toLowerCase())),
    [bots, search],
  );

  return (
    <section>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block w-full max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            className="input pl-10"
            placeholder="Search your bots…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <p className="text-sm text-text-muted">
          {filtered.length} {filtered.length === 1 ? "bot" : "bots"}
        </p>
      </div>

      {filtered.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((bot) => (
            <BotListCard key={bot.id} bot={bot} onToggle={onToggle} onDelete={onDelete} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={bots.length ? "No matching bots" : "No bots yet"}
          description={bots.length ? "Try a different search term." : "Create your first AI assistant to get started."}
          action={!bots.length ? (
            <Link href="/dashboard/bots/create" className="btn-primary inline-flex">
              <Plus size={16} />
              Create your first bot
            </Link>
          ) : <Bot className="mx-auto text-text-muted" />}
        />
      )}
    </section>
  );
}
