import type { NextRequest } from "next/server";
import { success, failure } from "@/lib/http/api-response";
import { toErrorResponse } from "@/lib/http/api-error";
import { requireUser } from "@/features/auth/server/require-user";
import { getBillingLimitHttpResponse } from "@/features/billing/server/billing-http";
import {
  BotValidationError,
  parseBotPatchInput,
} from "@/features/bots/schemas/bot.schema";
import {
  deleteBotForOwner,
  getBotForOwner,
  updateBotForOwner,
} from "@/features/bots/server/bot.service";
import { getOwnerConversations } from "@/features/bots/server/conversation.service";

type Context = { params: Promise<{ botRef: string }> };
export async function GET(request: NextRequest, { params }: Context) {
  try {
    const user = await requireUser(request);
    const { botRef } = await params;
    const bot = await getBotForOwner(botRef, user.id);
    if (!bot) return failure("Bot not found", 404);
    if (request.nextUrl.searchParams.get("include") === "conversations")
      return success({
        bot,
        conversations: await getOwnerConversations(bot.id),
      });
    return success(bot);
  } catch (error) {
    return toErrorResponse(error);
  }
}
export async function PATCH(request: NextRequest, { params }: Context) {
  try {
    const user = await requireUser(request);
    const { botRef } = await params;
    const input = parseBotPatchInput(await request.json());
    const result = await updateBotForOwner(botRef, user.id, input);
    return result ? success(result) : failure("Bot not found", 404);
  } catch (error) {
    const billingLimit = getBillingLimitHttpResponse(error);

    if (billingLimit) {
      return Response.json(billingLimit.body, {
        status: billingLimit.status,
      });
    }
    if (error instanceof BotValidationError) return failure(error.message, 400);
    return toErrorResponse(error);
  }
}
export async function DELETE(request: NextRequest, { params }: Context) {
  try {
    const user = await requireUser(request);
    const { botRef } = await params;
    const deleted = await deleteBotForOwner(botRef, user.id);
    return deleted ? success({ deleted: true }) : failure("Bot not found", 404);
  } catch (error) {
    return toErrorResponse(error);
  }
}
