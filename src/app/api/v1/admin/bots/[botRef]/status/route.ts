import type { NextRequest } from 'next/server';
import { success, failure } from '@/lib/http/api-response';
import { toErrorResponse } from '@/lib/http/api-error';
import { requireAdmin } from '@/features/admin/server/require-admin';
import { BotValidationError, parseBotPatchInput } from '@/features/bots/schemas/bot.schema';
import { updateBotStatusAsAdmin } from '@/features/bots/server/bot.service';

type Context = { params: Promise<{ botRef: string }> };
export async function PATCH(request: NextRequest, { params }: Context) { try { await requireAdmin(request); const input = parseBotPatchInput(await request.json()); if (!input.status) return failure('status is required', 400); const { botRef } = await params; const bot = await updateBotStatusAsAdmin(botRef, input.status); return bot ? success({ refId: bot.refId, status: bot.status }) : failure('Bot not found', 404); } catch (error) { if (error instanceof BotValidationError) return failure(error.message, 400); return toErrorResponse(error); } }
