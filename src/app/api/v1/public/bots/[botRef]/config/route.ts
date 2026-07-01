import { NextResponse, type NextRequest } from 'next/server';
import { success, failure } from '@/lib/http/api-response';
import { toErrorResponse } from '@/lib/http/api-error';
import { publicCorsHeaders } from '@/lib/security/cors';
import { getPublicBotConfig } from '@/features/bots/server/public-bot.service';

type Context = { params: Promise<{ botRef: string }> };
export async function GET(request: NextRequest, { params }: Context) { try { const { botRef } = await params; const bot = await getPublicBotConfig(botRef); return bot ? success(bot, { headers: publicCorsHeaders(request) }) : failure('Bot not found', 404); } catch (error) { return toErrorResponse(error); } }
export function OPTIONS(request: NextRequest) { return new NextResponse(null, { status: 204, headers: publicCorsHeaders(request) }); }
