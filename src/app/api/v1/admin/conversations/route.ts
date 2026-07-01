import type { NextRequest } from 'next/server';
import { success } from '@/lib/http/api-response';
import { toErrorResponse } from '@/lib/http/api-error';
import { requireAdmin } from '@/features/admin/server/require-admin';
import { getAdminConversations } from '@/features/admin/server/admin-dashboard.service';
export async function GET(request: NextRequest) { try { await requireAdmin(request); return success(await getAdminConversations()); } catch (error) { return toErrorResponse(error); } }
