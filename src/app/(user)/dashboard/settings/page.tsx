"use client";

import { Mail, Settings2, ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "@/features/auth/components/AuthProvider";

export default function SettingsPage() {
  const { user } = useAuth();
  const username = user?.user_metadata?.username || user?.email?.split("@")[0] || "User";

  return (
    <div className="mx-auto max-w-4xl p-6 sm:p-8">
      <header className="mb-8">
        <p className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
          <Settings2 size={16} />
          Account
        </p>
        <h1 className="text-3xl font-bold text-text-primary">Settings</h1>
        <p className="mt-1 text-text-secondary">Review the account connected to your chatbot workspace.</p>
      </header>

      <section className="card max-w-2xl">
        <div className="flex items-center gap-4 border-b border-border pb-6">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-primary to-accent-cyan text-white">
            <UserRound size={21} />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">{username}</h2>
            <p className="text-sm text-text-muted">Chatbot Creator account</p>
          </div>
        </div>

        <dl className="divide-y divide-border">
          <div className="flex flex-col gap-1 py-5 sm:flex-row sm:items-center sm:justify-between">
            <dt className="flex items-center gap-2 text-sm text-text-secondary"><Mail size={16} className="text-primary" /> Email address</dt>
            <dd className="break-all text-sm font-medium text-text-primary">{user?.email ?? "—"}</dd>
          </div>
          <div className="flex flex-col gap-1 py-5 sm:flex-row sm:items-center sm:justify-between">
            <dt className="flex items-center gap-2 text-sm text-text-secondary"><ShieldCheck size={16} className="text-primary" /> Authentication</dt>
            <dd className="text-sm font-medium text-text-primary">Managed by Supabase Auth</dd>
          </div>
        </dl>

        <div className="mt-2 rounded-xl border border-border bg-surface p-4">
          <p className="text-sm font-medium text-text-primary">Password and email changes</p>
          <p className="mt-1 text-sm leading-relaxed text-text-muted">
            Account credential changes are managed through your configured Supabase authentication flow.
          </p>
        </div>
      </section>
    </div>
  );
}
