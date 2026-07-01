import { NextResponse, type NextRequest } from 'next/server';
import { success, failure } from '@/lib/http/api-response';
import { toErrorResponse } from '@/lib/http/api-error';
import { publicCorsHeaders } from '@/lib/security/cors';
import { checkRateLimit, getRequestIp } from '@/lib/security/rate-limit';
import { ChatValidationError, parseChatMessageInput } from '@/features/bots/schemas/chat-message.schema';
import { replyToPublicMessage } from '@/features/bots/server/conversation.service';

type Context = { params: Promise<{ botRef: string }> };
export async function POST(request: NextRequest, { params }: Context) { try { const { botRef } = await params; const rate = checkRateLimit(`public-chat:${botRef}:${getRequestIp(request.headers)}`, 20, 60_000); if (!rate.allowed) return NextResponse.json({ error: 'Too many messages. Please try again shortly.' }, { status: 429, headers: { ...publicCorsHeaders(request), 'Retry-After': String(rate.retryAfterSeconds) } }); const { message, history } = parseChatMessageInput(await request.json()); const result = await replyToPublicMessage(botRef, message, history); return result.kind === 'not_found' ? failure('Bot not found', 404) : success({ reply: result.reply, cached: result.cached }, { headers: publicCorsHeaders(request) }); } catch (error) { if (error instanceof ChatValidationError) return failure(error.message, 400); return toErrorResponse(error); } }
export function OPTIONS(request: NextRequest) { return new NextResponse(null, { status: 204, headers: publicCorsHeaders(request) }); }
