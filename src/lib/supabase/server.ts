import { createClient } from '@supabase/supabase-js';
import { serverEnv } from '@/lib/env.server';

export function createSupabaseServerClient() {
  return createClient(serverEnv.supabaseUrl, serverEnv.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
    