import type { User } from '@supabase/supabase-js';
import { env } from '@/lib/env';

export function isAdminUser(user: User) {
  if (user.app_metadata?.role === 'admin') return true;
  return Boolean(user.email && env.adminEmails.includes(user.email.toLowerCase()));
}
