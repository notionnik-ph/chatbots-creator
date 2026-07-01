import Link from "next/link";
import { Bot } from "lucide-react";

export default function MarketingNavbar() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-border glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent-cyan text-white shadow-glow">
            <Bot size={20} />
          </span>
          <span className="text-lg font-bold text-text-primary">Chatbot Creator</span>
        </Link>

        <div className="hidden items-center gap-8 text-sm font-medium text-text-secondary md:flex">
          <a href="#features" className="transition-colors hover:text-text-primary">Features</a>
          <a href="#pricing" className="transition-colors hover:text-text-primary">Pricing</a>
          <a href="#about" className="transition-colors hover:text-text-primary">About</a>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="rounded-xl px-3 py-2 text-sm font-medium text-text-secondary transition-all hover:bg-surface-elevated hover:text-text-primary sm:px-4"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white shadow-glow transition-all hover:bg-primary-hover sm:px-4"
          >
            <span className="hidden sm:inline">Get Started Free</span>
            <span className="sm:hidden">Start</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
