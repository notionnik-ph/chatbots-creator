import { CheckCircle2, CreditCard, Sparkles } from "lucide-react";

export default function BillingPage() {
  return (
    <div className="mx-auto max-w-5xl p-6 sm:p-8">
      <header className="mb-8">
        <p className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
          <CreditCard size={16} />
          Subscription
        </p>
        <h1 className="text-3xl font-bold text-text-primary">Billing</h1>
        <p className="mt-1 text-text-secondary">Manage your plan when a billing provider is connected.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 via-surface-elevated to-accent-cyan/10 p-7">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
            <div>
              <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1.5 text-xs font-semibold text-primary">
                <Sparkles size={14} />
                Current plan
              </span>
              <h2 className="text-2xl font-bold text-text-primary">Starter</h2>
              <p className="mt-2 text-sm text-text-secondary">Your bot creation, knowledge base, dashboard, and widget features remain available.</p>
            </div>
            <span className="w-fit rounded-xl bg-surface px-4 py-2 text-sm font-semibold text-text-primary">Free</span>
          </div>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {["Create and manage chatbots", "Customize your widget", "Copy an embed snippet", "Review conversation history"].map((item) => (
              <p key={item} className="flex items-center gap-2 text-sm text-text-secondary">
                <CheckCircle2 size={16} className="text-green-400" />
                {item}
              </p>
            ))}
          </div>
        </section>

        <aside className="card">
          <CreditCard className="text-primary" />
          <h2 className="mt-4 text-lg font-semibold text-text-primary">Billing integration pending</h2>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">
            Subscription controls and payment history will appear here when billing is connected.
          </p>
        </aside>
      </div>
    </div>
  );
}
