import { createClient } from '@supabase/supabase-js';
import { clientEnv } from '@/lib/env.client';

export const supabaseBrowser = createClient(
  clientEnv.supabaseUrl,
  clientEnv.supabaseAnonKey
);

// Backward-compatible alias for any existing imports that use `supabase`.
export const supabase = supabaseBrowser;
