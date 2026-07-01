'use client';

import { supabaseBrowser } from '@/lib/supabase/browser';

export async function signOutCurrentUser() {
  await supabaseBrowser.auth.signOut();
}
