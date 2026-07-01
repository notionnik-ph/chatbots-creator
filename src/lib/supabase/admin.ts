import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

/** Server-only client. Never import this file from a client component. */
export const supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});
