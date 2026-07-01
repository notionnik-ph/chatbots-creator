import type { NextRequest } from 'next/server';
import { isAdminUser } from '@/lib/auth/roles';
import { ApiError } from '@/lib/http/api-error';
import { requireUser } from '@/features/auth/server/require-user';

export async function requireAdmin(request: NextRequest) {
  const user = await requireUser(request);
  if (!isAdminUser(user)) throw new ApiError('Forbidden: admin access required', 403);
  return user;
}
