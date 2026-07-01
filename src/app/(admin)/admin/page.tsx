"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Shield } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = await supabaseBrowser.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.replace("/admin/dashboard");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-orange-400/5" />
      <div className="relative w-full max-w-md animate-slide-up">
        <header className="mb-8 text-center">
          <Link href="/" className="mb-6 inline-flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-red-500 to-orange-400 text-white shadow-lg">
              <Shield size={22} />
            </span>
            <span className="text-xl font-bold text-text-primary">Admin Console</span>
          </Link>
          <h1 className="mb-2 text-3xl font-bold text-text-primary">Admin sign in</h1>
          <p className="text-text-secondary">Use an authorized platform administrator account.</p>
        </header>

        <section className="card p-8">
          {error && (
            <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="label">Email address</span>
              <input type="email" className="input" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
            </label>
            <label className="block">
              <span className="label">Password</span>
              <span className="relative block">
                <input type={showPassword ? "text" : "password"} className="input pr-12" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
                <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((current) => !current)} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </span>
            </label>
            <button type="submit" disabled={loading} className="btn-primary w-full bg-red-500 py-3 text-base hover:bg-red-400">
              {loading ? <Loader2 size={18} className="animate-spin" /> : "Open Admin Console"}
            </button>
          </form>
        </section>
        <p className="mt-6 text-center text-xs text-text-muted">
          <Link href="/" className="transition-colors hover:text-text-secondary">← Back to home</Link>
        </p>
      </div>
    </main>
  );
}
