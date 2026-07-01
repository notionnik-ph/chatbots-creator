import type { NextRequest } from 'next/server';
import { success, failure } from '@/lib/http/api-response';
import { toErrorResponse } from '@/lib/http/api-error';
import { requireUser } from '@/features/auth/server/require-user';
import { chunkKnowledgeForOwner } from '@/features/bots/server/bot.service';

type Context = { params: Promise<{ botRef: string }> };
export async function POST(request: NextRequest, { params }: Context) { try { const user = await requireUser(request); const { botRef } = await params; const result = await chunkKnowledgeForOwner(botRef, user.id); return result ? success(result) : failure('Bot not found', 404); } catch (error) { return toErrorResponse(error); } }
