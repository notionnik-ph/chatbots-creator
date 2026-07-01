import type { User } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';
import { ApiError } from '@/lib/http/api-error';
import { getCurrentUser } from './get-current-user';

export async function requireUser(request: NextRequest): Promise<User> {
  const user = await getCurrentUser(request);
  if (!user) throw new ApiError('Unauthorized', 401);
  return user;
}
