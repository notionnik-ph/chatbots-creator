"use client";

import { useEffect, useMemo, useState } from "react";
import { Bot, Pause, Play, Search } from "lucide-react";
import LoadingState from "@/components/ui/LoadingState";
import { useAuth } from "@/features/auth/components/AuthProvider";
import { formatDate } from "@/lib/utils";

type AdminBot = {
  refId: string;
  name: string;
  status: string;
  ownerEmail: string;
  createdAt: string;
};

export default function AdminBotsPage() {
  const { session } = useAuth();
  const [bots, setBots] = useState<AdminBot[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!session?.access_token) return;

    void fetch("/api/v1/admin/bots", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error);
        return body.data as AdminBot[];
      })
      .then(setBots)
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load bots"))
      .finally(() => setLoading(false));
  }, [session?.access_token]);

  const filteredBots = useMemo(
    () => bots.filter((bot) => `${bot.name} ${bot.ownerEmail}`.toLowerCase().includes(search.toLowerCase())),
    [bots, search],
  );

  async function toggle(bot: AdminBot) {
    if (!session?.access_token) return;

    const status = bot.status === "active" ? "paused" : "active";
    const response = await fetch(`/api/v1/admin/bots/${bot.refId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ status }),
    });
    const body = await response.json();

    if (!response.ok) {
      setError(body.error || "Unable to update bot");
      return;
    }

    setBots((current) =>
      current.map((item) => (item.refId === bot.refId ? { ...item, status: body.data.status } : item)),
    );
  }

  if (loading) return <LoadingState label="Loading all bots…" />;

  return (
    <div className="p-6 sm:p-8">
      <header className="mb-8">
        <p className="mb-2 flex items-center gap-2 text-sm font-medium text-red-300">
          <Bot size={16} />
          Platform inventory
        </p>
        <h1 className="text-3xl font-bold text-text-primary">All Bots</h1>
        <p className="mt-1 text-text-secondary">Review and pause any chatbot across the platform.</p>
      </header>

      {error && <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block w-full max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input className="input pl-10" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by bot or owner…" />
        </label>
        <p className="text-sm text-text-muted">{filteredBots.length} {filteredBots.length === 1 ? "bot" : "bots"}</p>
      </div>

      <section className="overflow-hidden rounded-2xl border border-border bg-surface-elevated">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border bg-surface text-xs font-medium uppercase tracking-wide text-text-muted">
              <tr>
                <th className="px-5 py-4">Bot</th>
                <th className="px-5 py-4">Owner</th>
                <th className="px-5 py-4">Created</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredBots.map((bot) => {
                const active = bot.status === "active";
                return (
                  <tr key={bot.refId} className="transition-colors hover:bg-surface-hover/70">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-lg bg-red-500/10 text-red-300"><Bot size={17} /></span>
                        <div>
                          <p className="font-medium text-text-primary">{bot.name}</p>
                          <p className="mt-0.5 font-mono text-xs text-text-muted">{bot.refId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-text-secondary">{bot.ownerEmail}</td>
                    <td className="px-5 py-4 text-text-muted">{formatDate(bot.createdAt)}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${active ? "bg-green-400/15 text-green-400" : "bg-surface text-text-muted"}`}>
                        {bot.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button type="button" onClick={() => void toggle(bot)} className="btn-secondary px-3 py-2">
                        {active ? <Pause size={15} /> : <Play size={15} />}
                        {active ? "Pause" : "Activate"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!filteredBots.length && <p className="p-8 text-center text-sm text-text-muted">No matching bots found.</p>}
      </section>
    </div>
  );
}
