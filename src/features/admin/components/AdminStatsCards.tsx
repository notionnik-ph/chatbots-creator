import { Bot, MessageSquare, TrendingUp, Users } from "lucide-react";

export type AdminMetrics = {
  bots: number;
  users: number;
  conversations: number;
  tokens: number;
};

export default function AdminStatsCards({ metrics }: { metrics: AdminMetrics }) {
  const cards = [
    { label: "Total Bots", value: metrics.bots, icon: Bot, color: "from-blue-500 to-cyan-400" },
    { label: "Users", value: metrics.users, icon: Users, color: "from-violet-500 to-purple-400" },
    { label: "Conversations", value: metrics.conversations, icon: MessageSquare, color: "from-green-500 to-emerald-400" },
    { label: "Tokens Used", value: metrics.tokens.toLocaleString(), icon: TrendingUp, color: "from-orange-500 to-amber-400" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ label, value, icon: Icon, color }) => (
        <article key={label} className="card flex items-center gap-4">
          <span className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${color} text-white shadow-md`}>
            <Icon size={22} />
          </span>
          <div>
            <p className="text-2xl font-bold text-text-primary">{value}</p>
            <p className="text-xs text-text-muted">{label}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
