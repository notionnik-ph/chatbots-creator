import type { User } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function getCurrentUser(request: NextRequest): Promise<User | null> {
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) return null;
  const token = authorization.slice(7).trim();
  if (!token) return null;

  const client = createSupabaseServerClient();
  const { data, error } = await client.auth.getUser(token);
  return error ? null : data.user ?? null;
}
