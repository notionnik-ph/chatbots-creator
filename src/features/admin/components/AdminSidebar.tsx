"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bot,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Shield,
  Users,
} from "lucide-react";
import { useAuth } from "@/features/auth/components/AuthProvider";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/dashboard/bots", label: "Bots", icon: Bot },
  { href: "/admin/dashboard/users", label: "Users", icon: Users },
  { href: "/admin/dashboard/conversations", label: "Conversations", icon: MessageSquare },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    router.replace("/admin");
  }

  return (
    <aside className="flex min-h-screen w-64 shrink-0 flex-col border-r border-border glass md:sticky md:top-0 md:h-screen">
      <div className="border-b border-border px-6 py-5">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-red-500 to-orange-400 text-white shadow-lg">
            <Shield size={18} />
          </span>
          <div>
            <p className="text-lg font-bold text-text-primary">Admin Console</p>
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-red-300">Platform control</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                active
                  ? "border border-red-500/20 bg-red-500/10 text-red-300"
                  : "text-text-secondary hover:bg-surface-elevated hover:text-text-primary",
              )}
            >
              <Icon size={17} />
              <span>{label}</span>
              {active && <ChevronRight size={14} className="ml-auto" />}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-border px-3 pb-4 pt-4">
        <div className="rounded-xl bg-surface-elevated px-4 py-3">
          <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.16em] text-text-muted">Signed in as</p>
          <p className="truncate text-sm font-semibold text-text-primary">{user?.email}</p>
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
