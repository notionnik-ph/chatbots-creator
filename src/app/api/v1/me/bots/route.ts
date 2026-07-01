import type { NextRequest } from 'next/server';
import { success, failure } from '@/lib/http/api-response';
import { toErrorResponse } from '@/lib/http/api-error';
import { requireUser } from '@/features/auth/server/require-user';
import { BotValidationError, parseCreateBotInput } from '@/features/bots/schemas/bot.schema';
import { createBotForOwner, listBotsForOwner } from '@/features/bots/server/bot.service';

console.log('[API] /api/v1/me/bots route loaded');

export async function GET(request: NextRequest) {
  console.log('[API] GET /api/v1/me/bots called');
  try {
    const user = await requireUser(request);
    console.log('[API] GET /api/v1/me/bots user:', { userId: user.id });
    const bots = await listBotsForOwner(user.id);
    console.log('[API] GET /api/v1/me/bots success, returning', { botCount: bots.length });
    return success(bots);
  } catch (error) {
    console.error('[API] GET /api/v1/me/bots error:', error);
    return toErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  console.log('[API] POST /api/v1/me/bots called');
  try {
    const user = await requireUser(request);
    console.log('[API] POST /api/v1/me/bots user:', { userId: user.id });

    const requestBody = await request.json();
    console.log('[API] POST /api/v1/me/bots request body:', requestBody);

    const input = parseCreateBotInput(requestBody);
    console.log('[API] POST /api/v1/me/bots parsed input:', input);

    const result = await createBotForOwner(user.id, input);
    console.log('[API] POST /api/v1/me/bots bot created:', { botRef: result.bot.refId });

    return success(result, { status: 201 });
  } catch (error) {
    console.error('[API] POST /api/v1/me/bots error:', error);
    if (error instanceof BotValidationError) {
      console.log('[API] POST /api/v1/me/bots validation error:', error.message);
      return failure(error.message, 400);
    }
    return toErrorResponse(error);
  }
}
