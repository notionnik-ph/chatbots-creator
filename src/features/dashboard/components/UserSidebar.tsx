"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bot,
  ChevronRight,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Plus,
  Settings,
  User,
} from "lucide-react";
import { useAuth } from "@/features/auth/components/AuthProvider";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/bots", label: "My Bots", icon: Bot },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function UserSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const username = user?.user_metadata?.username || user?.email?.split("@")[0] || "User";

  async function handleSignOut() {
    await signOut();
    router.replace("/");
  }

  return (
    <aside className="flex min-h-screen w-64 shrink-0 flex-col border-r border-border glass md:sticky md:top-0 md:h-screen">
      <div className="border-b border-border px-6 py-5">
        <Link href="/dashboard" className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent-cyan text-white shadow-glow">
            <Bot size={18} />
          </span>
          <span className="text-lg font-bold text-text-primary">Chatbot Creator</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                active
                  ? "border border-primary/20 bg-primary/15 text-primary"
                  : "text-text-secondary hover:bg-surface-elevated hover:text-text-primary",
              )}
            >
              <Icon size={17} />
              <span>{label}</span>
              {active && <ChevronRight size={14} className="ml-auto" />}
            </Link>
          );
        })}

        <div className="pt-4">
          <Link href="/dashboard/bots/create" className="flex items-center gap-3 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-glow transition-all hover:bg-primary-hover">
            <Plus size={17} />
            Create New Bot
          </Link>
        </div>
      </nav>

      <div className="space-y-2 border-t border-border px-3 pb-4 pt-4">
        <div className="flex items-center gap-3 rounded-xl bg-surface-elevated px-4 py-3">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-accent-cyan text-white">
            <User size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-text-primary">{username}</p>
            <p className="truncate text-xs text-text-muted">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => void handleSignOut()}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-text-secondary transition-all hover:bg-red-400/10 hover:text-red-400"
        >
          <LogOut size={17} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
