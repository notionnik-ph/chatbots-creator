"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bot, Eye, EyeOff, Loader2 } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);

    const { data, error: authError } = await supabaseBrowser.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      router.replace("/dashboard");
      return;
    }

    setNotice("Check your email to confirm your account, then log in.");
    setLoading(false);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent-cyan/5" />
      <div className="relative w-full max-w-md animate-slide-up">
        <header className="mb-8 text-center">
          <Link href="/" className="mb-6 inline-flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent-cyan text-white shadow-glow">
              <Bot size={22} />
            </span>
            <span className="text-xl font-bold text-text-primary">Chatbot Creator</span>
          </Link>
          <h1 className="mb-2 text-3xl font-bold text-text-primary">Create your account</h1>
          <p className="text-text-secondary">Start building AI chatbots for free</p>
        </header>

        <section className="card p-8">
          {error && (
            <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}
          {notice && (
            <div className="mb-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              {notice}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">
            <label className="block">
              <span className="label">Username</span>
              <input
                type="text"
                className="input"
                placeholder="yourname"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                minLength={2}
                required
              />
            </label>

            <label className="block">
              <span className="label">Email address</span>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </label>

            <label className="block">
              <span className="label">Password</span>
              <span className="relative block">
                <input
                  type={showPassword ? "text" : "password"}
                  className="input pr-12"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-text-secondary"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </span>
            </label>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? <Loader2 size={18} className="animate-spin" /> : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-text-muted">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </p>
        </section>

        <p className="mt-4 text-center text-xs text-text-muted">
          By signing up, you agree to our{" "}
          <a href="#" className="underline transition-colors hover:text-text-secondary">Terms</a>
          {" & "}
          <a href="#" className="underline transition-colors hover:text-text-secondary">Privacy Policy</a>.
        </p>
        <p className="mt-2 text-center text-xs text-text-muted">
          <Link href="/" className="transition-colors hover:text-text-secondary">← Back to home</Link>
        </p>
      </div>
    </main>
  );
}
