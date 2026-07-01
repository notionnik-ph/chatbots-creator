"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, UserRound } from "lucide-react";
import LoadingState from "@/components/ui/LoadingState";
import { useAuth } from "@/features/auth/components/AuthProvider";
import { formatDate } from "@/lib/utils";

type AdminUser = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  lastSignInAt: string | null;
  confirmed: boolean;
};

export default function AdminUsersPage() {
  const { session } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!session?.access_token) return;

    void fetch("/api/v1/admin/users", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error);
        return body.data as AdminUser[];
      })
      .then(setUsers)
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load users"))
      .finally(() => setLoading(false));
  }, [session?.access_token]);

  const filteredUsers = useMemo(
    () => users.filter((user) => `${user.email} ${user.name}`.toLowerCase().includes(search.toLowerCase())),
    [users, search],
  );

  if (loading) return <LoadingState label="Loading users…" />;

  return (
    <div className="p-6 sm:p-8">
      <header className="mb-8">
        <p className="mb-2 flex items-center gap-2 text-sm font-medium text-red-300">
          <UserRound size={16} />
          Authentication accounts
        </p>
        <h1 className="text-3xl font-bold text-text-primary">Users</h1>
        <p className="mt-1 text-text-secondary">Accounts managed by Supabase Auth.</p>
      </header>

      {error && <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block w-full max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input className="input pl-10" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search users…" />
        </label>
        <p className="text-sm text-text-muted">{filteredUsers.length} {filteredUsers.length === 1 ? "user" : "users"}</p>
      </div>

      <section className="overflow-hidden rounded-2xl border border-border bg-surface-elevated">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border bg-surface text-xs font-medium uppercase tracking-wide text-text-muted">
              <tr>
                <th className="px-5 py-4">User</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Created</th>
                <th className="px-5 py-4">Last sign-in</th>
                <th className="px-5 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="transition-colors hover:bg-surface-hover/70">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/15 text-primary"><UserRound size={16} /></span>
                      <span className="font-medium text-text-primary">{user.name || "—"}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-text-secondary">{user.email}</td>
                  <td className="px-5 py-4 text-text-muted">{formatDate(user.createdAt)}</td>
                  <td className="px-5 py-4 text-text-muted">{user.lastSignInAt ? formatDate(user.lastSignInAt) : "Never"}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${user.confirmed ? "bg-green-400/15 text-green-400" : "bg-amber-400/15 text-amber-300"}`}>
                      {user.confirmed ? "Confirmed" : "Pending"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filteredUsers.length && <p className="p-8 text-center text-sm text-text-muted">No matching users found.</p>}
      </section>
    </div>
  );
}
