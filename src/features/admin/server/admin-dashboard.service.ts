import { supabaseAdmin } from '@/lib/supabase/admin';
import { listAllBots } from '@/features/bots/server/bot.repository';
import { listAllConversations } from '@/features/bots/server/conversation.repository';

export async function getAdminMetrics() {
  const [bots, conversations, users, tokenRows] = await Promise.all([
    supabaseAdmin.from('chatbots').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('conversation_logs').select('*', { count: 'exact', head: true }),
    supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1_000 }),
    supabaseAdmin.from('conversation_logs').select('tokens_used').limit(10_000),
  ]);
  if (bots.error || conversations.error || users.error || tokenRows.error) throw new Error(bots.error?.message ?? conversations.error?.message ?? users.error?.message ?? tokenRows.error?.message);
  return { bots: bots.count ?? 0, users: users.data.users.length, conversations: conversations.count ?? 0, tokens: (tokenRows.data ?? []).reduce((total, row) => total + Number(row.tokens_used ?? 0), 0) };
}

export async function getAdminUsers() {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1_000 });
  if (error) throw new Error(error.message);
  return data.users.map((user) => ({ id: user.id, email: user.email ?? '', name: user.user_metadata?.full_name ?? user.user_metadata?.username ?? '', createdAt: user.created_at, lastSignInAt: user.last_sign_in_at, confirmed: Boolean(user.email_confirmed_at) }));
}

export async function getAdminBots() {
  const bots = await listAllBots();
  const owners = await Promise.all(bots.map(async (bot) => { const { data } = await supabaseAdmin.auth.admin.getUserById(bot.owner_id); return [bot.owner_id, data.user?.email ?? 'Unknown owner'] as const; }));
  const ownerMap = new Map(owners);
  return bots.map((bot) => ({ refId: bot.ref_id, name: bot.bot_name, status: bot.status ?? 'active', ownerEmail: ownerMap.get(bot.owner_id) ?? 'Unknown owner', createdAt: bot.created_at }));
}

export async function getAdminConversations() { return listAllConversations(); }
